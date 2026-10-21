import { useEffect, useState } from 'react'
import { getSkill, defaultKnobs } from '../data/skills'
import { generateQuestion } from '../engine'
import { gradeAnswer } from '../lib/grade'
import type { Answer, GradeResult, KnobValues, Question, Skill } from '../lib/types'
import { t, tx } from '../lib/i18n'
import { positionDifficulty } from '../lib/math'
import { playFeedback } from '../lib/audio'
import { useStore } from '../state'
import { DiffPips, KnobEditor } from '../components/chrome'
import { AnswerWidget } from '../components/widgets'
import { AnswerFace, StimulusView } from '../components/visuals'
import { MathText } from '../components/MathText'
import { Mascot } from '../components/Mascot'
import { SkillDemo } from '../components/Preview'
import { Icon } from '../components/Icon'

const PRAISE = ['fb.exact', 'fb.clean', 'fb.spiral']

export function Play() {
  const store = useStore()
  const route = store.data.route
  const profile = store.data.profile
  if (route.name !== 'play' || !profile) return null
  const skill = getSkill(route.skillId)
  if (!skill) return null
  return <Session key={skill.id} skill={skill} auto={Boolean(route.auto)} startDifficulty={route.difficulty ?? positionDifficulty(profile.position)} />
}

function Session({ skill, auto, startDifficulty }: { skill: Skill; auto: boolean; startDifficulty: number }) {
  const { locale, data, logAttempt, flash, setRoute } = useStore()
  const profile = data.profile!
  const [live, setLive] = useState(auto)
  const [difficulty, setDifficulty] = useState(startDifficulty)
  const [knobs, setKnobs] = useState<KnobValues>(() => defaultKnobs(skill, startDifficulty))
  const [question, setQuestion] = useState<Question | null>(() => (auto ? generateQuestion(skill, startDifficulty, defaultKnobs(skill, startDifficulty)) : null))
  const [answer, setAnswer] = useState<Answer | null>(null)
  const [result, setResult] = useState<GradeResult | null>(null)
  // misses: wrong checks on this question. The first miss gives one more try; the answer stays hidden until the second check.
  const [misses, setMisses] = useState(0)
  const [hinted, setHinted] = useState(false)
  const [stepsOpen, setStepsOpen] = useState(false)
  const [began, setBegan] = useState(() => Date.now())
  const [tally, setTally] = useState({ correct: 0, total: 0, streak: 0 })
  const [why, setWhy] = useState(false)

  const fresh = (nextDifficulty = difficulty, nextKnobs = knobs) => {
    setQuestion(generateQuestion(skill, nextDifficulty, nextKnobs))
    setAnswer(null)
    setResult(null)
    setMisses(0)
    setHinted(false)
    setStepsOpen(false)
    setBegan(Date.now())
  }

  const begin = () => {
    setLive(true)
    fresh()
  }

  const check = () => {
    if (!question || result) return
    if (!answer) {
      flash(t(locale, 'play.need'))
      return
    }
    const grade = gradeAnswer(question.answer, answer)
    const ok = grade === 'correct'
    if (!ok && misses === 0) {
      // First failed check (wrong or not yet simplified): log it once, keep the answer open, and reveal nothing yet.
      setMisses(1)
      setHinted(false)
      setTally((current) => ({ correct: current.correct, total: current.total + 1, streak: 0 }))
      logAttempt({
        skillId: skill.id,
        correct: false,
        timeMs: Date.now() - began,
        difficulty: question.difficulty,
        mode: 'practice',
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
      })
    }
    playFeedback(ok, profile.sound)
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Enter' || !live) return
      const tag = (event.target as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'BUTTON') return
      const offerUp = result === 'correct' && tally.streak > 0 && tally.streak % 5 === 0 && difficulty < 5
      if (result) {
        if (!offerUp) fresh()
      } else check()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const leave = () => setRoute({ name: 'practice', skillId: skill.id })

  if (!live || !question) {
    return (
      <div>
        <p className="kicker">{skill.code}</p>
        <h1>{tx(locale, skill.title)}</h1>
        <SkillDemo domain={skill.domain} />
        <p className="muted">{tx(locale, skill.blurb)}</p>
        <button type="button" className="text-btn" onClick={() => setWhy(true)}>{t(locale, 'play.why')}</button>
        <div className="pad card" style={{ marginTop: 12 }}>
          <p className="kicker">{t(locale, 'play.setup')}</p>
          <DiffPips locale={locale} value={difficulty} onChange={(level) => { setDifficulty(level); setKnobs(defaultKnobs(skill, level)) }} />
          <div style={{ height: 10 }} />
          <KnobEditor skill={skill} values={knobs} locale={locale} onChange={setKnobs} />
        </div>
        <div className="row" style={{ marginTop: 14 }}>
          <button type="button" className="ghost" onClick={leave}><Icon name="back" /> {t(locale, 'on.back')}</button>
          <button type="button" className="primary" onClick={begin}><Icon name="forward" /> {t(locale, 'play.begin')}</button>
        </div>
        {why ? (
          <div className="modal-back">
            <div className="modal">
              <h2>{t(locale, 'play.why')}</h2>
              <p>{t(locale, `life.${skill.domain}`)}</p>
              <button type="button" className="primary" onClick={() => setWhy(false)}>{t(locale, 'play.why.close')}</button>
            </div>
          </div>
        ) : null}
      </div>
    )
  }

  const offerUp = result === 'correct' && tally.streak > 0 && tally.streak % 5 === 0 && difficulty < 5
  const praise = offerUp ? 'fb.streak' : PRAISE[tally.total % PRAISE.length]
  const hint = question.steps[0] ? tx(locale, question.steps[0].text) : ''
  const retrying = misses === 1 && !result
  return (
    <div>
      <div className="row play-head">
        <span className="kicker">{skill.code} · {t(locale, `diff.${question.difficulty}`)}</span>
        <span className="play-meter">
          {tally.streak >= 2 ? <span className="streak-pill"><Icon name="spark" size={14} />{t(locale, 'play.streak', { n: tally.streak })}</span> : null}
          <span className="fine">{t(locale, 'play.session', { c: tally.correct, n: tally.total })}</span>
        </span>
      </div>
      <div className="swap" key={question.id}>
        <h2>{tx(locale, skill.title)}</h2>
        <p className="prompt"><MathText text={tx(locale, question.prompt)} /></p>
        <StimulusView stimulus={question.stimulus} locale={locale} />
        <AnswerWidget key={question.id} response={question.response} locale={locale} locked={Boolean(result)} initial={answer} onChange={setAnswer} reveal={result ? question.answer : null} />
      </div>
      {retrying ? (
        <div className="feedback retry shake">
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
        <div className={result === 'correct' ? 'feedback ok pop' : 'feedback no shake'}>
          <div className="row">
            <Mascot mood={result === 'correct' ? 'joy' : 'think'} size={48} />
            <b>{t(locale, result === 'unsimplified' ? 'fb.close' : result === 'correct' ? (misses ? 'play.second' : praise) : 'fb.miss')}</b>
          </div>
          <p className="fine">{t(locale, 'play.answer')}</p>
          <AnswerFace question={question} answer={question.answer} locale={locale} blank="" />
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
            <button type="button" className="primary warm" onClick={() => { const next = Math.min(5, difficulty + 1); setDifficulty(next); fresh(next, knobs) }}><Icon name="spark" /> {t(locale, 'play.harder')}</button>
            <button type="button" className="ghost" onClick={() => fresh()}>{t(locale, 'play.stay')}</button>
          </>
        ) : result ? (
          <button type="button" className="primary" onClick={() => fresh()}>{t(locale, 'play.next')} <Icon name="forward" /></button>
        ) : (
          <button type="button" className="primary" onClick={check}><Icon name="check" /> {t(locale, misses ? 'play.recheck' : 'play.check')}</button>
        )}
        <button type="button" className="ghost" onClick={leave}>{t(locale, 'play.done')}</button>
      </div>
    </div>
  )
}
