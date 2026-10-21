import { useEffect, useMemo, useRef, useState } from 'react'
import { DOMAIN_COLOR, SKILLS, defaultKnobs, getSkill } from '../data/skills'
import { CHECK_MONTHS, materialize, presetFor } from '../data/pacing'
import { generateTest } from '../engine'
import { gradeAnswer, isCorrect } from '../lib/grade'
import { settingsKey } from '../lib/levels'
import { attemptDetail } from '../lib/review'
import type { ActiveTest, Answer, Blueprint, BlueprintItem, DomainId, Grade, TestRecord } from '../lib/types'
import { DOMAIN_ORDER } from '../lib/types'
import { monthName, t, tx } from '../lib/i18n'
import { monthIndex, uid } from '../lib/math'
import { useStore } from '../state'
import { Variables } from '../components/Variables'
import { AnswerWidget } from '../components/widgets'
import { AnswerFace, QuestionStem, StimulusView, groupBySkill } from '../components/visuals'
import { MathText } from '../components/MathText'
import { Mascot } from '../components/Mascot'
import { SkillDemo } from '../components/Preview'
import { Icon } from '../components/Icon'

const GRADES: Grade[] = [3, 4, 5, 6, 7]
const CAP = 36

function clock(ms: number) {
  const total = Math.max(0, Math.round(ms / 1000))
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}

function stamp(active: ActiveTest): ActiveTest {
  const now = Date.now()
  const times = active.times.slice()
  times[active.index] = (times[active.index] ?? 0) + Math.max(0, now - active.questionStartedAt)
  return { ...active, times, questionStartedAt: now }
}

export function Exam() {
  const route = useStore().data.route
  if (route.name === 'test') return <Builder />
  if (route.name === 'run') return <Runner />
  if (route.name === 'choose') return <Choose />
  if (route.name === 'investigate') return <Investigate />
  if (route.name === 'summary') return <Summary />
  if (route.name === 'shared') return <Shared />
  return null
}

function launchFrom(blueprint: Blueprint, printBlank: boolean) {
  const questions = generateTest(blueprint.items).slice(0, CAP)
  const active: ActiveTest = {
    blueprint,
    questions,
    responses: questions.map(() => null),
    times: questions.map(() => 0),
    index: 0,
    startedAt: Date.now(),
    questionStartedAt: Date.now(),
  }
  return { active, printBlank }
}

function Builder() {
  const { locale, data, setActive, setRoute, openShare, requestPrint, flash } = useStore()
  const profile = data.profile
  const [grade, setGrade] = useState<Grade>(profile?.grade ?? 4)
  const [title, setTitle] = useState('')
  const [tray, setTray] = useState<BlueprintItem[]>([])
  const [openId, setOpenId] = useState<string | null>(null)
  const [panel, setPanel] = useState<'choose' | 'month' | 'compose'>('choose')
  const [strand, setStrand] = useState<DomainId | 'all'>('all')
  const [monthAt, setMonthAt] = useState(0)
  const total = tray.reduce((sum, item) => sum + item.count, 0)
  const monthNow = monthIndex()
  const school = [9, 10, 11, 12, 1, 2, 3, 4, 5, 6]
  const reached = CHECK_MONTHS.filter((month) => school.indexOf(month) <= school.indexOf(monthNow)).at(-1) ?? 9
  const months = CHECK_MONTHS.filter((month) => presetFor(grade, month))
  const month = months[Math.min(monthAt, Math.max(0, months.length - 1))] ?? months[0]

  const go = (blueprint: Blueprint, printBlank = false) => {
    if (!blueprint.items.length || blueprint.items.every((item) => item.count < 1)) {
      flash(t(locale, 'test.empty'))
      return
    }
    try {
      const { active } = launchFrom(blueprint, printBlank)
      if (!active.questions.length) {
        flash(t(locale, 'test.empty'))
        return
      }
      setActive(active)
      setRoute({ name: 'run' })
      if (location.hash.startsWith('#t=')) history.replaceState(null, '', location.pathname + location.search)
      if (printBlank) {
        requestPrint('blank', {
          id: 'draft',
          blueprint,
          questions: active.questions,
          responses: active.responses,
          times: active.times,
          correct: active.questions.map(() => false),
          startedAt: active.startedAt,
          finishedAt: active.startedAt,
          investigate: null,
        })
      }
    } catch {
      flash(t(locale, 'test.empty'))
    }
  }

  const blueprint = (): Blueprint => ({
    v: 1,
    title: title.trim() ? { en: title.trim(), de: title.trim(), es: title.trim() } : undefined,
    items: tray.filter((item) => item.count > 0),
  })

  const add = (skillId: string) => {
    const skill = getSkill(skillId)
    if (!skill) return
    const difficulty = profile ? (profile.position === 'review' ? 2 : profile.position === 'stretch' ? 4 : 3) : 3
    setTray((current) => {
      const used = current.reduce((sum, item) => sum + item.count, 0)
      if (used >= CAP) return current
      const index = current.findIndex((item) => item.skillId === skillId)
      if (index >= 0) return current.map((item, itemIndex) => itemIndex === index ? { ...item, count: item.count + 1 } : item)
      return [...current, { skillId, count: 2, difficulty, knobs: defaultKnobs(skill, difficulty) }]
    })
  }

  const preset = month ? presetFor(grade, month) : undefined
  const gradeRow = (
    <div className="segment">
      {GRADES.map((item) => (
        <button key={item} type="button" data-on={grade === item} onClick={() => { setGrade(item); setMonthAt(0) }}>{item}</button>
      ))}
    </div>
  )

  if (panel === 'choose') {
    return (
      <div className="swap">
        <p className="kicker">{t(locale, 'nav.test')}</p>
        <h1>{t(locale, 'test.choose')}</h1>
        <p className="muted">{t(locale, 'test.hero.sub')}</p>
        <div className="catalog">
          <button type="button" className="strand-card" style={{ ['--wash' as string]: '#0f766e' }} onClick={() => { setMonthAt(Math.max(0, months.indexOf(reached))); setPanel('month') }}>
            <SkillDemo domain="MD" />
            <b>{t(locale, 'test.mode.month')}</b>
            <small>{t(locale, 'test.mode.month.sub')}</small>
          </button>
          <button type="button" className="strand-card" style={{ ['--wash' as string]: '#e25b45' }} onClick={() => setPanel('compose')}>
            <SkillDemo domain="OA" />
            <b>{t(locale, 'test.mode.compose')}</b>
            <small>{t(locale, 'test.mode.compose.sub')}</small>
          </button>
        </div>
      </div>
    )
  }

  if (panel === 'month' && preset && month) {
    return (
      <div className="swap">
        <button type="button" className="text-btn" onClick={() => setPanel('choose')}><Icon name="back" /> {t(locale, 'on.back')}</button>
        <p className="kicker">{month === reached ? t(locale, 'test.thisMonth') : t(locale, 'nav.test')}</p>
        <h1>{tx(locale, preset.title)}</h1>
        {gradeRow}
        <article className="month-stage" data-now={month === reached}>
          <div className="month-nav">
            <button type="button" className="icon-btn" aria-label={t(locale, 'on.back')} disabled={monthAt <= 0} onClick={() => setMonthAt((value) => Math.max(0, value - 1))}><Icon name="back" /></button>
            <b>{monthName(locale, month)}</b>
            <button type="button" className="icon-btn" aria-label={t(locale, 'play.next')} disabled={monthAt >= months.length - 1} onClick={() => setMonthAt((value) => Math.min(months.length - 1, value + 1))}><span className="flip"><Icon name="back" /></span></button>
          </div>
          <p className="muted">{tx(locale, preset.note)}</p>
          <button type="button" className="primary" onClick={() => go(materialize(preset))}>{t(locale, 'test.startCheck')}</button>
          <button type="button" className="text-btn" onClick={() => { setTray(materialize(preset).items); setTitle(tx(locale, preset.title)); setPanel('compose') }}>{t(locale, 'test.customize')}</button>
        </article>
      </div>
    )
  }

  const skills = SKILLS.filter((skill) => skill.grade === grade && (strand === 'all' || skill.domain === strand))
  return (
    <div className="swap">
      <button type="button" className="text-btn" onClick={() => setPanel('choose')}><Icon name="back" /> {t(locale, 'on.back')}</button>
      <p className="kicker">{t(locale, 'test.build')}</p>
      <h1>{t(locale, 'test.mode.compose')}</h1>
      {gradeRow}
      <input className="field" style={{ marginTop: 12 }} value={title} placeholder={t(locale, 'test.title.ph')} onChange={(event) => setTitle(event.target.value)} />
      <p className="fine">{t(locale, 'test.tray', { n: total })}</p>
      {tray.length ? (
        <div className="stack">
          {tray.map((item, index) => {
            const skill = getSkill(item.skillId)
            if (!skill) return null
            const key = `${item.skillId}-${index}`
            return (
              <article key={key} className="tray-row">
                <i style={{ background: DOMAIN_COLOR[skill.domain] }} />
                <b>{tx(locale, skill.title)}</b>
                <span className="stepper">
                  <button type="button" onClick={() => setTray((current) => current.map((row, itemIndex) => itemIndex === index ? { ...row, count: Math.max(1, row.count - 1) } : row))}>−</button>
                  {item.count}
                  <button type="button" onClick={() => setTray((current) => current.map((row, itemIndex) => itemIndex === index && total < CAP ? { ...row, count: row.count + 1 } : row))}>+</button>
                </span>
                <button type="button" className="text-btn" onClick={() => setOpenId(openId === key ? null : key)}>{t(locale, 'play.setup')}</button>
                <button type="button" className="text-btn" onClick={() => setTray((current) => current.filter((_, itemIndex) => itemIndex !== index))}>{t(locale, 'test.remove')}</button>
                {openId === key ? (
                  <div className="tray-more">
                    <Variables skill={skill} locale={locale} values={item.knobs} onChange={(knobs) => setTray((current) => current.map((row, itemIndex) => itemIndex === index ? { ...row, knobs } : row))} />
                  </div>
                ) : null}
              </article>
            )
          })}
        </div>
      ) : null}
      <div className="segment scroll-x" style={{ marginTop: 12 }}>
        <button type="button" data-on={strand === 'all'} onClick={() => setStrand('all')}>{t(locale, 'practice.all')}</button>
        {DOMAIN_ORDER.filter((item) => SKILLS.some((skill) => skill.grade === grade && skill.domain === item)).map((item) => (
          <button key={item} type="button" data-on={strand === item} onClick={() => setStrand(item)}>{t(locale, `domain.${item}`)}</button>
        ))}
      </div>
      <div className="catalog">
        {skills.map((skill, index) => {
          const picked = tray.find((item) => item.skillId === skill.id)
          return (
            <button key={skill.id} type="button" className="skill-card" data-here={Boolean(picked)} style={{ ['--wash' as string]: DOMAIN_COLOR[skill.domain], animationDelay: `${Math.min(index, 8) * 30}ms` }} onClick={() => add(skill.id)}>
              <SkillDemo domain={skill.domain} />
              <small>{skill.code}</small>
              <b>{tx(locale, skill.title)}</b>
              <span>{picked ? t(locale, 'test.tray', { n: picked.count }) : t(locale, 'test.add')}</span>
            </button>
          )
        })}
      </div>
      {total ? (
        <div className="builder-actions">
          <button type="button" className="primary wide" onClick={() => go(blueprint())}><Icon name="forward" />{t(locale, 'test.begin')}</button>
          <div className="tool-row">
            <button type="button" className="tool-btn" onClick={() => go(blueprint(), true)}><Icon name="print" />{t(locale, 'test.print')}</button>
            <button type="button" className="tool-btn" onClick={() => openShare(blueprint())}><Icon name="share" />{t(locale, 'test.share')}</button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function Runner() {
  const store = useStore()
  const { locale, data, setActive, setRoute, saveTest, logAttempt, openShare, requestPrint } = store
  const active = data.active
  const hold = useRef(active)
  hold.current = active
  const [mode, setMode] = useState<'focus' | 'map'>('focus')
  const [ask, setAsk] = useState(false)
  useEffect(() => {
    const current = hold.current
    if (!current) return
    setActive({ ...current, questionStartedAt: Date.now() })
    // Restart the clock for this visit without adding the time spent away.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => {
    if (mode !== 'focus') return
    const onKey = (event: KeyboardEvent) => {
      const tag = (event.target as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || event.altKey || event.ctrlKey || event.metaKey) return
      const current = hold.current
      if (!current) return
      const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
      if (!step) return
      const index = current.index + step
      if (index < 0 || index >= current.questions.length) return
      const next = { ...stamp(current), index }
      hold.current = next
      setActive(next)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mode, setActive])
  if (!active) {
    return (
      <div>
        <h1>{t(locale, 'home.test')}</h1>
        <button type="button" className="primary" onClick={() => setRoute({ name: 'test' })}>{t(locale, 'test.back')}</button>
      </div>
    )
  }
  const write = (mut: (current: ActiveTest) => ActiveTest) => {
    const current = hold.current
    if (!current) return
    const next = mut(current)
    hold.current = next
    setActive(next)
  }
  const jump = (index: number) => {
    write((current) => ({ ...stamp(current), index }))
    setMode('focus')
  }
  const save = (answer: Answer | null) => {
    write((current) => {
      const responses = current.responses.slice()
      responses[current.index] = answer
      return { ...current, responses }
    })
  }
  const finish = () => {
    const current = hold.current
    if (!current) return
    const stamped = stamp(current)
    const blanks = stamped.responses.filter((item) => item == null).length
    if (blanks && !ask) {
      setAsk(true)
      return
    }
    const correct = stamped.questions.map((question, index) => isCorrect(question.answer, stamped.responses[index]))
    const record: TestRecord = {
      id: uid('t'),
      blueprint: stamped.blueprint,
      questions: stamped.questions,
      responses: stamped.responses,
      times: stamped.times,
      correct,
      startedAt: stamped.startedAt,
      finishedAt: Date.now(),
      investigate: null,
    }
    // Questions were generated in blueprint order, so each position maps back to the problem type that made it.
    const variants = stamped.blueprint.items.flatMap((item) => Array.from({ length: item.count }, () => (typeof item.knobs.mode === 'string' ? item.knobs.mode : undefined)))
    correct.forEach((ok, index) => {
      const question = stamped.questions[index]
      const given = stamped.responses[index] ?? null
      const grade = given ? gradeAnswer(question.answer, given) : 'blank'
      logAttempt({
        skillId: question.skillId,
        correct: ok,
        timeMs: stamped.times[index] ?? 0,
        difficulty: question.difficulty,
        mode: 'test',
        testId: record.id,
        variant: variants[index],
        result: grade,
        ...attemptDetail(question, given, grade, locale),
      })
    })
    saveTest(record)
    setRoute({ name: 'choose', id: record.id })
  }
  const question = active.questions[active.index]
  const answered = active.responses.filter((item) => item != null).length
  const total = active.questions.length
  const pct = total ? Math.round((answered / total) * 100) : 0
  const skill = question ? getSkill(question.skillId) : undefined
  const printNow = () => requestPrint('blank', {
    id: 'live',
    blueprint: active.blueprint,
    questions: active.questions,
    responses: active.responses,
    times: active.times,
    correct: active.questions.map(() => false),
    startedAt: active.startedAt,
    finishedAt: Date.now(),
    investigate: null,
  })
  return (
    <div>
      <header className="runner-head">
        <div className="runner-title">
          <p className="kicker">{tx(locale, active.blueprint.title) || t(locale, 'home.test')}</p>
          <div className="progress" role="progressbar" aria-label={t(locale, 'test.progress')} aria-valuemin={0} aria-valuemax={total} aria-valuenow={answered}>
            <i style={{ width: `${pct}%` }} />
          </div>
        </div>
        <span className="runner-count"><b>{answered}</b>/{total}</span>
      </header>
      <div className="runner-tools">
        <div className="segment">
          <button type="button" data-on={mode === 'focus'} onClick={() => setMode('focus')}>{t(locale, 'test.focus')}</button>
          <button type="button" data-on={mode === 'map'} onClick={() => setMode('map')}>{t(locale, 'test.map')}</button>
        </div>
        <div className="tool-row">
          <button type="button" className="tool-btn" onClick={printNow}><Icon name="print" />{t(locale, 'test.print')}</button>
          <button type="button" className="tool-btn" onClick={() => openShare(active.blueprint)}><Icon name="share" />{t(locale, 'test.share')}</button>
        </div>
      </div>
      {mode === 'map' ? (
        <div className="overview" style={{ marginTop: 12 }}>
          {groupBySkill(active.questions).map((section) => {
            const skill = getSkill(section.skillId)
            return (
              <section key={`${section.skillId}-${section.items[0]?.index}`}>
                <h3 className="section-label">{skill ? `${skill.code} · ${tx(locale, skill.title)}` : section.skillId}</h3>
                <div className="overview-grid">
                  {section.items.map(({ question: item, index }) => (
                    <button key={item.id} type="button" className="overview-q" data-on={active.responses[index] != null} onClick={() => jump(index)}>
                      <span className="overview-top"><b>{index + 1}</b><small>{active.responses[index] ? t(locale, 'test.answered') : t(locale, 'test.blank')}</small></span>
                      <QuestionStem question={item} locale={locale} />
                    </button>
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      ) : (
        <div className="swap" key={question.id} style={{ marginTop: 8 }}>
          <div className="q-meta">
            <h2 className="q-num">{t(locale, 'test.q', { n: active.index + 1 })}</h2>
            {skill ? <span className="fine">{skill.code}</span> : null}
          </div>
          <p className="prompt"><MathText text={tx(locale, question.prompt)} /></p>
          <StimulusView stimulus={question.stimulus} locale={locale} />
          <AnswerWidget key={question.id} response={question.response} locale={locale} initial={active.responses[active.index]} onChange={save} />
          <nav className="nav-row" aria-label={t(locale, 'test.focus')}>
            <button type="button" className="ghost" disabled={active.index === 0} onClick={() => jump(active.index - 1)}><Icon name="back" />{t(locale, 'on.back')}</button>
            <span className="fine nav-count">{active.index + 1} / {total}</span>
            {active.index < total - 1 ? (
              <button type="button" className="primary" onClick={() => jump(active.index + 1)}>{t(locale, 'test.next')}<Icon name="forward" /></button>
            ) : <span />}
          </nav>
        </div>
      )}
      <section className="finish-panel">
        <div>
          <b>{total - answered ? t(locale, 'test.finish.left', { n: total - answered }) : t(locale, 'test.finish.ready')}</b>
          <p className="fine">{t(locale, 'test.finish.note')}</p>
        </div>
        <button type="button" className="primary warm" onClick={finish}><Icon name="check" />{t(locale, 'test.finish.button')}</button>
      </section>
      {ask ? (
        <div className="modal-back">
          <div className="modal">
            <Mascot mood="think" size={56} />
            <h2>{t(locale, 'test.confirm', { n: active.responses.filter((item) => item == null).length })}</h2>
            <div className="row">
              <button type="button" className="ghost" onClick={() => setAsk(false)}>{t(locale, 'test.stay')}</button>
              <button type="button" className="primary" onClick={finish}>{t(locale, 'test.end')}</button>
            </div>
          </div>
        </div>
      ) : null}
      </div>
  )
}

function Choose() {
  const { locale, data, setRoute } = useStore()
  const route = data.route
  const test = route.name === 'choose' ? data.tests.find((item) => item.id === route.id) : undefined
  if (!test) return <button type="button" className="primary" onClick={() => setRoute({ name: 'home' })}>{t(locale, 'sum.home')}</button>
  const wrong = test.correct.filter((item) => !item).length
  return (
    <div>
      <Mascot mood={wrong ? 'think' : 'joy'} size={140} />
      <p className="kicker">{tx(locale, test.blueprint.title) || t(locale, 'home.test')}</p>
      <h1>{t(locale, 'choose.title')}</h1>
      <p className="muted">{t(locale, 'choose.sub')}</p>
      <div className="stack">
        <button type="button" className="primary" onClick={() => setRoute({ name: 'summary', id: test.id })}>{t(locale, 'choose.results')}</button>
        <button type="button" className="text-btn" onClick={() => setRoute({ name: 'investigate', id: test.id })}>{t(locale, 'choose.hunt')}</button>
      </div>
    </div>
  )
}

function Investigate() {
  const { locale, data, setRoute, patchTest } = useStore()
  const route = data.route
  const test = route.name === 'investigate' ? data.tests.find((item) => item.id === route.id) : undefined
  const misses = useMemo(() => test ? test.questions.map((_, index) => index).filter((index) => test && !test.correct[index]) : [], [test])
  const [cursor, setCursor] = useState(0)
  const [picked, setPicked] = useState<'mine' | 'key' | null>(null)
  const [spotted, setSpotted] = useState(0)
  const [flip] = useState(() => misses.map(() => Math.random() < 0.5))
  if (!test) return null
  if (!misses.length) {
    return (
      <div>
        <Mascot mood="joy" size={120} />
        <h1>{t(locale, 'inv.none')}</h1>
        <button type="button" className="primary" onClick={() => { patchTest(test.id, { investigate: { spotted: 0, total: 0 } }); setRoute({ name: 'summary', id: test.id }) }}>{t(locale, 'inv.summary')}</button>
      </div>
    )
  }
  const index = misses[Math.min(cursor, misses.length - 1)]
  const question = test.questions[index]
  const order = flip[cursor] ? (['mine', 'key'] as const) : (['key', 'mine'] as const)
  const done = () => {
    patchTest(test.id, { investigate: { spotted, total: misses.length } })
    setRoute({ name: 'summary', id: test.id })
  }
  const choose = (which: 'mine' | 'key') => {
    if (picked) return
    setPicked(which)
    if (which === 'mine') setSpotted((value) => value + 1)
  }
  return (
    <div>
      <p className="kicker">{t(locale, 'inv.kicker')}</p>
      <h1>{t(locale, 'inv.ask')}</h1>
      <p className="fine">{t(locale, 'inv.progress', { n: cursor + 1, m: misses.length })}</p>
      <p className="prompt"><MathText text={tx(locale, question.prompt)} /></p>
      <StimulusView stimulus={question.stimulus} locale={locale} />
      <div className="compare-grid">
        {order.map((which, card) => (
          <button key={which} type="button" className={picked === which ? 'hunt-card picked' : 'hunt-card'} onClick={() => choose(which)}>
            <small>{t(locale, 'inv.card', { n: card + 1 })}</small>
            <AnswerFace question={question} answer={which === 'mine' ? test.responses[index] : question.answer} locale={locale} blank={t(locale, 'inv.blank')} />
          </button>
        ))}
      </div>
      {picked ? (
        <div className={picked === 'mine' ? 'feedback ok' : 'feedback no'}>
          <b>{t(locale, picked === 'mine' ? 'inv.spot' : 'inv.miss')}</b>
          <ol className="steps">
            {question.steps.map((step, stepIndex) => <li key={stepIndex}><MathText text={tx(locale, step.text)} /></li>)}
          </ol>
          {cursor + 1 < misses.length ? (
            <button type="button" className="primary" onClick={() => { setCursor((value) => value + 1); setPicked(null) }}>{t(locale, 'inv.next')}</button>
          ) : (
            <button type="button" className="primary" onClick={done}>{t(locale, 'inv.summary')}</button>
          )}
        </div>
      ) : null}
    </div>
  )
}

function Summary() {
  const { locale, data, setRoute, setActive, requestPrint } = useStore()
  const route = data.route
  const test = route.name === 'summary' ? data.tests.find((item) => item.id === route.id) : undefined
  const [open, setOpen] = useState<number | null>(null)
  if (!test) return null
  const scored = test.correct.filter(Boolean).length
  const pct = test.questions.length ? Math.round((scored / test.questions.length) * 100) : 0
  const totalTime = test.times.reduce((sum, item) => sum + item, 0)
  const groups = new Map<string, { correct: number; total: number; time: number; difficulty: number }>()
  let slowest = { skillId: '', time: -1 }
  test.questions.forEach((question, index) => {
    const spent = test.times[index] ?? 0
    const row = groups.get(question.skillId) ?? { correct: 0, total: 0, time: 0, difficulty: question.difficulty }
    row.total += 1
    row.time += spent
    if (test.correct[index]) row.correct += 1
    row.difficulty = Math.max(row.difficulty, question.difficulty)
    groups.set(question.skillId, row)
    if (spent > slowest.time) slowest = { skillId: question.skillId, time: spent }
  })
  const slowSkill = slowest.skillId ? getSkill(slowest.skillId) : undefined
  const again = () => {
    const questions = generateTest(test.blueprint.items).slice(0, CAP)
    setActive({
      blueprint: test.blueprint,
      questions,
      responses: questions.map(() => null),
      times: questions.map(() => 0),
      index: 0,
      startedAt: Date.now(),
      questionStartedAt: Date.now(),
    })
    setRoute({ name: 'run' })
  }
  return (
    <div>
      <p className="kicker">{t(locale, 'sum.dash')}</p>
      <h1>{tx(locale, test.blueprint.title) || t(locale, 'sum.score')}</h1>
      <div className="summary-hero">
        <div className="ring" style={{ ['--p' as string]: `${pct}%` }} role="img" aria-label={`${t(locale, 'sum.score')} ${pct}%`}>
          <span><b className="score-num">{pct}%</b><small className="fine">{scored}/{test.questions.length}</small></span>
        </div>
        <div className="sum-grid">
          <article className="card sum-tile"><small>{t(locale, 'sum.time')}</small><b>{clock(totalTime)}</b></article>
          <article className="card sum-tile"><small>{t(locale, 'sum.avg')}</small><b>{clock(totalTime / Math.max(1, test.questions.length))}</b></article>
          <article className="card sum-tile"><small>{t(locale, 'sum.wrong')}</small><b>{test.questions.length - scored}</b></article>
        </div>
      </div>
      {test.investigate ? <p>{t(locale, 'sum.eye', { s: test.investigate.spotted, t: test.investigate.total })}</p> : null}
      {scored === test.questions.length ? <p><b>{t(locale, 'sum.perfect')}</b></p> : null}
      {slowSkill && slowest.time >= 0 ? <p className="fine">{t(locale, 'sum.slow')}: {tx(locale, slowSkill.title)} · {clock(slowest.time)}</p> : null}
      <h2 style={{ marginTop: 16 }}>{t(locale, 'sum.subjects')}</h2>
      <div className="list">
        {[...groups.entries()].map(([skillId, row]) => {
          const skill = getSkill(skillId)
          const ratio = row.correct / row.total
          const strong = ratio >= 0.8
          return (
            <article key={skillId} className="card pad">
              <b>{skill ? tx(locale, skill.title) : skillId}</b>
              <div className="bar"><i style={{ width: `${ratio * 100}%` }} /></div>
              <p className="fine">{row.correct}/{row.total} · {clock(row.time / row.total)} · {t(locale, strong ? 'sum.harder' : 'sum.growth')}</p>
              {skill ? (
                <button type="button" className="text-btn" onClick={() => setRoute({ name: 'play', skillId, auto: true, difficulty: strong ? Math.min(5, row.difficulty + 1) : Math.max(1, row.difficulty - 1) })}>
                  {t(locale, strong ? 'sum.harder' : 'sum.practice')}
                </button>
              ) : null}
            </article>
          )
        })}
      </div>
      <h2 style={{ marginTop: 18 }}>{t(locale, 'sum.questions')}</h2>
      <div className="stack">
        {test.questions.map((question, index) => {
          const skill = getSkill(question.skillId)
          return (
            <div key={question.id}>
              <button type="button" className="sum-row" onClick={() => setOpen(open === index ? null : index)}>
                <span>{index + 1}</span>
                <span>{skill ? tx(locale, skill.title) : question.skillId}</span>
                <small>{clock(test.times[index] ?? 0)}</small>
                <b>{test.correct[index] ? '✓' : '×'}</b>
              </button>
              {open === index ? (
                <article className="q-card pad">
                  <p><MathText text={tx(locale, question.prompt)} /></p>
                  <div className="fine">{t(locale, 'sum.your')}</div>
                  <AnswerFace question={question} answer={test.responses[index]} locale={locale} blank={t(locale, 'inv.blank')} />
                  <div className="fine">{t(locale, 'sum.correct')}</div>
                  <AnswerFace question={question} answer={question.answer} locale={locale} blank="" />
                  <ol className="steps">
                    {question.steps.map((step, stepIndex) => <li key={stepIndex}><MathText text={tx(locale, step.text)} /></li>)}
                  </ol>
                </article>
              ) : null}
            </div>
          )
        })}
      </div>
      <div className="row" style={{ marginTop: 16 }}>
        <button type="button" className="primary" onClick={() => requestPrint('teacher', test)}>{t(locale, 'sum.print')}</button>
        <button type="button" className="ghost" onClick={again}>{t(locale, 'sum.again')}</button>
        <button type="button" className="text-btn" onClick={() => setRoute({ name: 'home' })}>{t(locale, 'sum.home')}</button>
      </div>
    </div>
  )
}

function Shared() {
  const { locale, data, setRoute, setActive, flash } = useStore()
  const route = data.route
  if (route.name !== 'shared') return null
  const blueprint = route.blueprint
  const start = () => {
    try {
      const { active } = launchFrom(blueprint, false)
      setActive(active)
      setRoute({ name: 'run' })
      if (location.hash.startsWith('#t=')) history.replaceState(null, '', location.pathname + location.search)
    } catch {
      flash(t(locale, 'shared.bad'))
    }
  }
  return (
    <div>
      <Mascot mood="joy" size={130} />
      <p className="kicker">{t(locale, 'shared.title')}</p>
      <h1>{tx(locale, blueprint.title) || t(locale, 'home.test')}</h1>
      <p className="muted">{t(locale, 'share.note')}</p>
      <div className="list">
        {blueprint.items.map((item, index) => {
          const skill = getSkill(item.skillId)
          return (
            <article key={`${item.skillId}-${index}`} className="card pad">
              <b>{skill ? tx(locale, skill.title) : item.skillId}</b>
              <p className="fine">{t(locale, 'test.tray', { n: item.count })}{skill ? ` · ${t(locale, settingsKey(skill, item.difficulty, item.knobs))}` : ''}</p>
            </article>
          )
        })}
      </div>
      <div className="row" style={{ marginTop: 14 }}>
        <button type="button" className="primary" onClick={start}>{t(locale, 'shared.start')}</button>
        <button type="button" className="ghost" onClick={() => { if (location.hash.startsWith('#t=')) history.replaceState(null, '', location.pathname + location.search); setRoute({ name: 'home' }) }}>{t(locale, 'shared.later')}</button>
      </div>
    </div>
  )
}
