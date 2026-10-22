import { useEffect, useRef, useState } from 'react'
import { getSkill, defaultKnobs } from '../data/skills'
import { generateQuestion } from '../engine'
import { gradeAnswer } from '../lib/grade'
import type { Answer, BlueprintItem, GradeResult, KnobValues, Question, Skill } from '../lib/types'
import { t, tx } from '../lib/i18n'
import { positionDifficulty } from '../lib/math'
import { playFeedback } from '../lib/audio'
import { settingsKey } from '../lib/levels'
import { attemptDetail } from '../lib/review'
import { identityPath, knobsForPath, squareIds, unitTitle, unitVariant } from '../lib/units'
import { useStore } from '../state'
import { AnswerWidget } from '../components/widgets'
import { AnswerFace, StimulusView } from '../components/visuals'
import { MathText } from '../components/MathText'
import { Mascot } from '../components/Mascot'
import { Icon } from '../components/Icon'

const PRAISE = ['fb.exact', 'fb.clean', 'fb.spiral']

function replay(element: HTMLElement | null, name: string) {
  if (!element) return
  element.classList.remove(name)
  void element.offsetWidth
  element.classList.add(name)
}

export function Play() {
  const store = useStore()
  const route = store.data.route
  const profile = store.data.profile
  if (route.name !== 'play' || !profile) return null
  if ('queue' in route && route.queue.length) return <Queue queue={route.queue} />
  if (!('skillId' in route)) return null
  const skill = getSkill(route.skillId)
  if (!skill) return null
  return <Session key={skill.id + unitVariant(skill, route.knobs ?? {})} skill={skill} startDifficulty={route.difficulty ?? positionDifficulty(profile.position)} fixedKnobs={route.knobs} />
}

function Queue({ queue }: { queue: BlueprintItem[] }) {
  const [index, setIndex] = useState(0)
  const item = queue[index % queue.length]
  const skill = item ? getSkill(item.skillId) : undefined
  if (!item || !skill) return null
  return (
    <Session
      key={`${index}-${item.skillId}-${unitVariant(skill, item.knobs)}`}
      skill={skill}
      startDifficulty={item.difficulty}
      fixedKnobs={item.knobs}
      onAdvance={() => setIndex((value) => value + 1)}
    />
  )
}

function Session({ skill, startDifficulty, fixedKnobs, onAdvance }: { skill: Skill; startDifficulty: number; fixedKnobs?: KnobValues; onAdvance?: () => void }) {
  const { locale, data, logAttempt, flash, setRoute } = useStore()
  const profile = data.profile!
  const opening = fixedKnobs ?? defaultKnobs(skill, startDifficulty)
  const [difficulty, setDifficulty] = useState(startDifficulty)
  const [knobs, setKnobs] = useState<KnobValues>(opening)
  const [question, setQuestion] = useState<Question>(() => generateQuestion(skill, startDifficulty, opening))
  const [answer, setAnswer] = useState<Answer | null>(null)
  const [result, setResult] = useState<GradeResult | null>(null)
  const [misses, setMisses] = useState(0)
  const [hinted, setHinted] = useState(false)
  const [stepsOpen, setStepsOpen] = useState(false)
  const [began, setBegan] = useState(() => Date.now())
  const [tally, setTally] = useState({ correct: 0, total: 0, streak: 0 })
  const zone = useRef<HTMLDivElement>(null)
  const title = unitTitle(skill, knobs)

  const fresh = (nextDifficulty = difficulty, nextKnobs = knobs) => {
    setQuestion(generateQuestion(skill, nextDifficulty, nextKnobs))
    setAnswer(null)
    setResult(null)
    setMisses(0)
    setHinted(false)
    setStepsOpen(false)
    setBegan(Date.now())
  }

  const advance = () => {
    if (onAdvance) onAdvance()
    else fresh()
  }

  const check = () => {
    if (!question || result) return
    if (!answer) {
      flash(t(locale, 'play.need'))
      replay(zone.current, 'nudge')
      return
    }
    const grade = gradeAnswer(question.answer, answer)
    const ok = grade === 'correct'
    replay(zone.current, ok ? 'answer-ok' : 'nudge')
    if (!ok && misses === 0) {
      setMisses(1)
      setHinted(false)
      setTally((current) => ({ correct: current.correct, total: current.total + 1, streak: 0 }))
      logAttempt({
        skillId: skill.id,
        correct: false,
        timeMs: Date.now() - began,
        difficulty: question.difficulty,
        mode: 'practice',
        variant: unitVariant(skill, knobs),
        result: grade,
        ...attemptDetail(question, answer, grade, locale),
      })
      playFeedback(false, profile.sound)
      return
    }
    setResult(grade)
    setStepsOpen(!ok)
    if (misses === 0) {
      setTally((current) => ({
        correct: current.correct + (ok ? 1 : 0),
        total: current.total + 1,
        streak: ok ? current.streak + 1 : 0,
      }))
      logAttempt({
        skillId: skill.id,
        correct: ok,
        timeMs: Date.now() - began,
        difficulty: question.difficulty,
        mode: 'practice',
        variant: unitVariant(skill, knobs),
        result: grade,
        ...attemptDetail(question, answer, grade, locale),
      })
    }
    playFeedback(ok, profile.sound)
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Enter') return
      const tag = (event.target as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'BUTTON') return
      const offerUp = result === 'correct' && tally.streak > 0 && tally.streak % 5 === 0 && difficulty < 5
      if (result) {
        if (!offerUp) advance()
      } else check()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const leave = () => setRoute({ name: 'practice', skillId: skill.id })
  const offerUp = result === 'correct' && tally.streak > 0 && tally.streak % 5 === 0 && difficulty < 5
  const praise = offerUp ? 'fb.streak' : PRAISE[tally.total % PRAISE.length]
  const hint = question.steps[0] ? tx(locale, question.steps[0].text) : ''
  const retrying = misses === 1 && !result
  const harder = () => {
    const next = Math.min(5, difficulty + 1)
    const nextKnobs = knobsForPath(skill, next, identityPath(skill, knobs))
    setDifficulty(next)
    setKnobs(nextKnobs)
    fresh(next, nextKnobs)
  }
  return (
    <div>
      <div className="row play-head">
        <span className="kicker">{skill.code}{title ? ` · ${tx(locale, title)}` : ''} · {t(locale, settingsKey(skill, question.difficulty, knobs, squareIds(skill)))}</span>
        <span className="play-meter">
          {tally.streak >= 2 ? <span className="streak-pill"><Icon name="spark" size={14} />{t(locale, 'play.streak', { n: tally.streak })}</span> : null}
          <span className="fine">{t(locale, 'play.session', { c: tally.correct, n: tally.total })}</span>
        </span>
      </div>
      <div className="swap" key={question.id}>
        <h2>{title ? tx(locale, title) : tx(locale, skill.title)}</h2>
        <p className="prompt"><MathText text={tx(locale, question.prompt)} /></p>
        <StimulusView stimulus={question.stimulus} locale={locale} />
        <div ref={zone} className="answer-zone">
          <AnswerWidget key={question.id} response={question.response} locale={locale} locked={Boolean(result)} initial={answer} onChange={setAnswer} reveal={result ? question.answer : null} />
        </div>
      </div>
      {retrying ? (
        <div className="feedback retry">
          <div className="row">
            <Mascot mood="think" size={44} />
            <b>{t(locale, 'play.retry')}</b>
          </div>
          {hinted && hint ? (
            <p className="hint-line"><MathText text={hint} /></p>
          ) : (
            <button type="button" className="text-btn" onClick={() => setHinted(true)}><Icon name="spark" /> {t(locale, 'play.hint')}</button>
          )}
        </div>
      ) : null}
      {result ? (
        <div className={result === 'correct' ? 'feedback ok pop' : 'feedback no'}>
          <div className="row">
            <Mascot mood={result === 'correct' ? 'joy' : 'think'} size={48} />
            {result === 'correct' ? <svg className="tick" viewBox="0 0 24 24" aria-hidden="true"><path pathLength={1} d="M5 12.5 9.5 17 19 7" /></svg> : null}
            <b>{t(locale, result === 'unsimplified' ? 'fb.close' : result === 'correct' ? (misses ? 'play.second' : praise) : 'fb.miss')}</b>
          </div>
          <p className="fine">{t(locale, 'play.answer')}</p>
          <div className={result === 'correct' ? undefined : 'reveal-answer'}>
            <AnswerFace question={question} answer={question.answer} locale={locale} blank="" />
          </div>
          {offerUp ? <p>{t(locale, 'play.levelup')}</p> : null}
          <button type="button" className="text-btn" onClick={() => setStepsOpen((open) => !open)}>
            {stepsOpen ? t(locale, 'play.hide') : t(locale, 'play.path')}
          </button>
          {stepsOpen ? (
            <ol className="steps">
              {question.steps.map((step, index) => <li key={index}><MathText text={tx(locale, step.text)} /></li>)}
            </ol>
          ) : null}
        </div>
      ) : null}
      <div className="row" style={{ marginTop: 14 }}>
        {offerUp ? (
          <>
            <button type="button" className="primary warm" onClick={harder}><Icon name="spark" /> {t(locale, 'play.harder')}</button>
            <button type="button" className="ghost" onClick={() => fresh()}>{t(locale, 'play.stay')}</button>
          </>
        ) : result ? (
          <button type="button" className="primary" data-ready="true" onClick={advance}>{t(locale, 'play.next')} <Icon name="forward" /></button>
        ) : (
          <button type="button" className="primary" data-ready={answer !== null} onClick={check}><Icon name="check" /> {t(locale, misses ? 'play.recheck' : 'play.check')}</button>
        )}
        <button type="button" className="ghost" onClick={leave}>{t(locale, 'play.done')}</button>
      </div>
    </div>
  )
}
