import { useEffect, useMemo, useRef, useState } from 'react'
import { DOMAIN_COLOR, SKILLS, getSkill } from '../data/skills'
import { CHECK_MONTHS, materialize, presetFor, standardsBlueprint, TEST_CAP } from '../data/pacing'
import { TOPICS, topicBlueprint, topicById } from '../data/topics'
import { mistakeBlueprint } from '../lib/mistakes'
import { generateTest } from '../engine'
import { gradeAnswer, isCorrect } from '../lib/grade'
import { levelKey, settingsKey } from '../lib/levels'
import { attemptDetail } from '../lib/review'
import type { ActiveTest, Answer, Blueprint, BlueprintItem, DomainId, Grade, KnobValues, Locale, Skill, TestRecord } from '../lib/types'
import { DOMAIN_ORDER } from '../lib/types'
import { monthName, t, tx } from '../lib/i18n'
import { monthIndex, uid } from '../lib/math'
import { skillMatches } from '../lib/search'
import { identityPath, knobsForPath, matchesPath, nextLayer, squareIds, unitKey, unitTitle, unitVariant } from '../lib/units'
import { useStore } from '../state'
import { Variables } from '../components/Variables'
import { AnswerWidget } from '../components/widgets'
import { AnswerFace, QuestionStem, StimulusView, groupBySkill } from '../components/visuals'
import { MathText } from '../components/MathText'
import { Mascot } from '../components/Mascot'
import { SkillDemo } from '../components/Preview'
import { Icon } from '../components/Icon'
import { UnitSquares } from '../components/UnitSquares'

const GRADES: Grade[] = [3, 4, 5, 6, 7]
const CAP = TEST_CAP

function kindLabel(skill: Skill, knobs: KnobValues, locale: Locale) {
  const title = unitTitle(skill, knobs)
  return title ? tx(locale, title) : ''
}

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
  const { locale, data, setActive, setRoute, openShare, requestPrint, flash, togglePin } = useStore()
  const profile = data.profile
  const [grade, setGrade] = useState<Grade>(profile?.grade ?? 4)
  const [title, setTitle] = useState('')
  const [tray, setTray] = useState<BlueprintItem[]>([])
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [panel, setPanel] = useState<'choose' | 'month' | 'compose' | 'topic' | 'progress'>('choose')
  const [span, setSpan] = useState<'month' | 'half' | 'year'>('month')
  const [topicId, setTopicId] = useState<string | null>(null)
  const [mistakeCount, setMistakeCount] = useState(10)
  const [strand, setStrand] = useState<DomainId | null>(null)
  const [everyGrade, setEveryGrade] = useState(false)
  const [query, setQuery] = useState('')
  const [monthAt, setMonthAt] = useState(0)
  const [focusId, setFocusId] = useState<string | null>(null)
  const [path, setPath] = useState<Record<string, string>>({})
  const total = tray.reduce((sum, item) => sum + item.count, 0)
  useEffect(() => {
    if (openIndex === null) return
    document.querySelector('.tray-more')?.scrollIntoView({ block: 'nearest' })
  }, [openIndex])
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

  const addUnit = (skillId: string, nextPath: Record<string, string>) => {
    const skill = getSkill(skillId)
    if (!skill) return
    const difficulty = profile ? (profile.position === 'review' ? 2 : profile.position === 'stretch' ? 4 : 3) : 3
    const used = tray.reduce((sum, item) => sum + item.count, 0)
    if (used >= CAP) return
    setTray([...tray, { skillId, count: 2, difficulty, knobs: knobsForPath(skill, difficulty, nextPath) }])
  }

  const openCategory = (skillId: string) => {
    const skill = getSkill(skillId)
    if (!skill) return
    if (!nextLayer(skill, {})) {
      addUnit(skillId, {})
      return
    }
    setFocusId(skillId)
    setPath({})
  }

  const chooseSquare = (id: string, value: string) => {
    const skill = focusId ? getSkill(focusId) : undefined
    if (!skill) return
    const next = { ...path, [id]: value }
    if (nextLayer(skill, next)) setPath(next)
    else addUnit(skill.id, next)
  }

  const move = (index: number, delta: number) => {
    const next = index + delta
    if (next < 0 || next >= tray.length) return
    const copy = tray.slice()
    const [row] = copy.splice(index, 1)
    if (!row) return
    copy.splice(next, 0, row)
    setTray(copy)
    setOpenIndex((open) => (open === index ? next : open === next ? index : open))
  }

  const setDifficulty = (index: number, difficulty: number) => {
    setTray((current) => current.map((row, itemIndex) => {
      if (itemIndex !== index) return row
      const skill = getSkill(row.skillId)
      if (!skill) return { ...row, difficulty }
      const fixed = identityPath(skill, row.knobs)
      const untouched = JSON.stringify(row.knobs) === JSON.stringify(knobsForPath(skill, row.difficulty, fixed))
      return { ...row, difficulty, knobs: untouched ? knobsForPath(skill, difficulty, fixed) : row.knobs }
    }))
  }

  const removeAt = (index: number) => {
    setTray((current) => current.filter((_, itemIndex) => itemIndex !== index))
    setOpenIndex((open) => (open === index ? null : open !== null && open > index ? open - 1 : open))
  }

  const preset = month ? presetFor(grade, month) : undefined
  const openTray = (next: Blueprint) => {
    setTray(next.items)
    setTitle(tx(locale, next.title) ?? '')
    setPanel('compose')
  }
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
          <button type="button" className="strand-card" style={{ ['--wash' as string]: '#0f766e' }} onClick={() => { setMonthAt(Math.max(0, months.indexOf(reached))); setSpan('month'); setPanel('month') }}>
            <SkillDemo domain="MD" />
            <b>{t(locale, 'test.mode.month')}</b>
            <small>{t(locale, 'test.mode.month.sub')}</small>
          </button>
          <button type="button" className="strand-card" style={{ ['--wash' as string]: '#7c4a7a' }} onClick={() => { setTopicId(null); setPanel('topic') }}>
            <SkillDemo domain="NF" />
            <b>{t(locale, 'test.mode.topic')}</b>
            <small>{t(locale, 'test.mode.topic.sub')}</small>
          </button>
          <button type="button" className="strand-card" style={{ ['--wash' as string]: '#c4841d' }} onClick={() => setPanel('progress')}>
            <SkillDemo domain="SP" />
            <b>{t(locale, 'test.mode.progress')}</b>
            <small>{t(locale, 'test.mode.progress.sub')}</small>
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

  const spanChoices = (
    <div className="segment wrap" style={{ marginTop: 12 }}>
      {(['month', 'half', 'year'] as const).map((item) => (
        <button key={item} type="button" data-on={span === item} onClick={() => setSpan(item)}>{t(locale, `test.span.${item}`)}</button>
      ))}
    </div>
  )

  if (panel === 'month') {
    const wide = span === 'month' ? null : standardsBlueprint(grade, span)
    const wideCount = wide ? wide.items.reduce((sum, item) => sum + item.count, 0) : 0
    return (
      <div className="swap">
        <button type="button" className="text-btn" onClick={() => setPanel('choose')}><Icon name="back" /> {t(locale, 'on.back')}</button>
        <p className="kicker">{span === 'month' && month === reached ? t(locale, 'test.thisMonth') : t(locale, 'nav.test')}</p>
        <h1>{wide ? tx(locale, wide.title) : preset ? tx(locale, preset.title) : t(locale, 'nav.test')}</h1>
        {gradeRow}
        {spanChoices}
        {wide ? (
          <article className="month-stage">
            <p className="muted">{t(locale, span === 'half' ? 'test.half.note' : 'test.year.note')}</p>
            <p className="fine">{t(locale, 'test.tray', { n: wideCount })}</p>
            <button type="button" className="primary" onClick={() => go(wide)}>{t(locale, 'test.startCheck')}</button>
            <button type="button" className="text-btn" onClick={() => openTray(wide)}>{t(locale, 'test.customize')}</button>
          </article>
        ) : preset && month ? (
          <article className="month-stage" data-now={month === reached}>
            <div className="month-nav">
              <button type="button" className="icon-btn" aria-label={t(locale, 'on.back')} disabled={monthAt <= 0} onClick={() => setMonthAt((value) => Math.max(0, value - 1))}><Icon name="back" /></button>
              <b>{monthName(locale, month)}</b>
              <button type="button" className="icon-btn" aria-label={t(locale, 'play.next')} disabled={monthAt >= months.length - 1} onClick={() => setMonthAt((value) => Math.min(months.length - 1, value + 1))}><span className="flip"><Icon name="back" /></span></button>
            </div>
            <p className="muted">{tx(locale, preset.note)}</p>
            <button type="button" className="primary" onClick={() => go(materialize(preset))}>{t(locale, 'test.startCheck')}</button>
            <button type="button" className="text-btn" onClick={() => openTray(materialize(preset))}>{t(locale, 'test.customize')}</button>
          </article>
        ) : null}
      </div>
    )
  }

  if (panel === 'topic') {
    const topic = topicId ? topicById(topicId) : null
    if (!topic) {
      return (
        <div className="swap">
          <button type="button" className="text-btn" onClick={() => setPanel('choose')}><Icon name="back" /> {t(locale, 'on.back')}</button>
          <p className="kicker">{t(locale, 'nav.test')}</p>
          <h1>{t(locale, 'test.topic.pick')}</h1>
          <p className="muted">{t(locale, 'test.mode.topic.sub')}</p>
          <div className="catalog">
            {TOPICS.map((item, index) => {
              const preview = topicBlueprint(item)
              const grades = preview.items.map((row) => getSkill(row.skillId)?.grade).filter((value): value is Grade => value != null)
              const count = preview.items.reduce((sum, row) => sum + row.count, 0)
              const low = grades.length ? Math.min(...grades) : 3
              const high = grades.length ? Math.max(...grades) : 7
              return (
                <button key={item.id} type="button" className="strand-card" style={{ ['--wash' as string]: DOMAIN_COLOR[item.domain], animationDelay: `${index * 40}ms` }} onClick={() => setTopicId(item.id)}>
                  <SkillDemo domain={item.domain} />
                  <b>{tx(locale, item.title)}</b>
                  <small>{t(locale, 'test.topic.span', { a: low, b: high, n: count })}</small>
                </button>
              )
            })}
          </div>
        </div>
      )
    }
    const blueprint = topicBlueprint(topic)
    const covered: { id: string; grade: number; title: string }[] = []
    for (const item of blueprint.items) {
      if (covered.some((row) => row.id === item.skillId)) continue
      const skill = getSkill(item.skillId)
      if (!skill) continue
      covered.push({ id: skill.id, grade: skill.grade, title: tx(locale, skill.title) })
    }
    const grades = covered.map((row) => row.grade)
    const low = grades.length ? Math.min(...grades) : grade
    const high = grades.length ? Math.max(...grades) : grade
    const count = blueprint.items.reduce((sum, item) => sum + item.count, 0)
    return (
      <div className="swap">
        <button type="button" className="text-btn" onClick={() => setTopicId(null)}><Icon name="back" /> {t(locale, 'on.back')}</button>
        <p className="kicker">{t(locale, 'test.mode.topic')}</p>
        <h1>{tx(locale, topic.title)}</h1>
        <p className="muted">{tx(locale, topic.note)}</p>
        <p className="fine">{t(locale, 'test.topic.span', { a: low, b: high, n: count })}</p>
        <div className="list">
          {covered.map((row) => (
            <p key={row.id} className="fine">{t(locale, 'grade.n', { n: row.grade })} · {row.title}</p>
          ))}
        </div>
        <div className="row" style={{ marginTop: 14 }}>
          <button type="button" className="primary" onClick={() => go(blueprint)}>{t(locale, 'test.startCheck')}</button>
          <button type="button" className="text-btn" onClick={() => openTray(blueprint)}>{t(locale, 'test.customize')}</button>
        </div>
      </div>
    )
  }

  if (panel === 'progress') {
    const recorded = data.attempts.filter((item) => !item.correct).length
    const chosen = Math.min(mistakeCount, recorded, CAP)
    const blueprint = chosen > 0 ? mistakeBlueprint(data.attempts, chosen) : null
    const rows = blueprint?.items ?? []
    const shown = rows.slice(0, 8)
    return (
      <div className="swap">
        <button type="button" className="text-btn" onClick={() => setPanel('choose')}><Icon name="back" /> {t(locale, 'on.back')}</button>
        <p className="kicker">{t(locale, 'test.mode.progress')}</p>
        <h1>{t(locale, 'test.progress.pick')}</h1>
        <p className="muted">{t(locale, 'test.mode.progress.sub')}</p>
        {recorded ? (
          <>
            <p className="fine">{t(locale, 'test.progress.have', { n: recorded })}</p>
            <div className="segment wrap" style={{ marginTop: 12 }}>
              {[5, 10, 15, 20, 30].filter((item) => item <= recorded).map((item) => (
                <button key={item} type="button" data-on={chosen === item} onClick={() => setMistakeCount(item)}>{item}</button>
              ))}
            </div>
            <p className="fine" style={{ marginTop: 12 }}>
              <span className="stepper">
                <button type="button" disabled={chosen <= 1} onClick={() => setMistakeCount(Math.max(1, chosen - 1))}>−</button>
                {chosen}
                <button type="button" disabled={chosen >= Math.min(recorded, CAP)} onClick={() => setMistakeCount(Math.min(CAP, chosen + 1))}>+</button>
              </span>
            </p>
            <p className="muted">{t(locale, 'test.progress.using', { n: chosen })}</p>
            <div className="list">
              {shown.map((item, index) => {
                const skill = getSkill(item.skillId)
                const kind = skill ? kindLabel(skill, item.knobs, locale) : ''
                return (
                  <p key={`${item.skillId}-${index}`} className="fine">
                    <b>{kind || (skill ? tx(locale, skill.title) : item.skillId)}</b>
                    {kind && skill ? ` · ${tx(locale, skill.title)}` : ''} · {t(locale, 'test.tray', { n: item.count })}
                  </p>
                )
              })}
              {rows.length > shown.length ? <p className="fine">{t(locale, 'test.progress.more', { n: rows.length - shown.length })}</p> : null}
            </div>
            {blueprint ? (
              <div className="row" style={{ marginTop: 14 }}>
                <button type="button" className="primary" onClick={() => go(blueprint)}>{t(locale, 'test.startCheck')}</button>
                <button type="button" className="text-btn" onClick={() => openTray(blueprint)}>{t(locale, 'test.customize')}</button>
              </div>
            ) : null}
          </>
        ) : (
          <article className="month-stage">
            <Mascot mood="think" size={72} />
            <p>{t(locale, 'test.progress.none')}</p>
          </article>
        )}
      </div>
    )
  }

  const pool = SKILLS.filter((skill) => everyGrade || skill.grade === grade)
  const strands = DOMAIN_ORDER.filter((item) => pool.some((skill) => skill.domain === item))
  const needle = query.trim()
  const skills = pool.filter((skill) => {
    if (needle) return skillMatches(skill, needle)
    if (strand && skill.domain !== strand) return false
    return Boolean(strand)
  })
  const focused = focusId ? getSkill(focusId) : undefined
  const layer = focused ? nextLayer(focused, path) : null
  const crumb = focused ? unitTitle(focused, path) : null
  const questionsFor = (skillId: string) => tray.reduce((sum, item) => item.skillId === skillId ? sum + item.count : sum, 0)
  const stepBack = () => {
    if (focused && Object.keys(path).length) {
      const keys = Object.keys(path)
      const next = { ...path }
      delete next[keys[keys.length - 1]]
      setPath(next)
      return
    }
    if (focusId) {
      setFocusId(null)
      setPath({})
      return
    }
    if (strand && !needle) {
      setStrand(null)
      return
    }
    setQuery('')
    setStrand(null)
    setPanel('choose')
  }
  return (
    <div className="swap">
      <button type="button" className="text-btn" onClick={stepBack}><Icon name="back" /> {t(locale, 'on.back')}</button>
      <p className="kicker">{t(locale, 'test.build')}</p>
      <h1>{t(locale, 'test.mode.compose')}</h1>
      <div className="segment">
        {GRADES.map((item) => (
          <button key={item} type="button" data-on={!everyGrade && grade === item} onClick={() => { setGrade(item); setEveryGrade(false); setMonthAt(0) }}>{item}</button>
        ))}
        <button type="button" data-on={everyGrade} onClick={() => setEveryGrade(true)}>{t(locale, 'test.allGrades')}</button>
      </div>
      <input className="field" style={{ marginTop: 12 }} value={title} placeholder={t(locale, 'test.title.ph')} onChange={(event) => setTitle(event.target.value)} />
      <p className="fine">{t(locale, 'test.tray', { n: total })}</p>
      {tray.length ? (
        <div className="tray">
          {tray.map((item, index) => {
            const skill = getSkill(item.skillId)
            if (!skill) return null
            const kind = kindLabel(skill, item.knobs, locale)
            const pinned = (data.pins ?? []).some((pin) => unitKey(pin.skillId, pin.knobs, skill) === unitKey(item.skillId, item.knobs, skill))
            const open = openIndex === index
            return (
              <article key={`${item.skillId}-${String(item.knobs.mode ?? '')}-${index}`} className="tray-row" data-open={open}>
                <div className="tray-order">
                  <button type="button" className="tray-mini icon" disabled={index === 0} aria-label={t(locale, 'test.up')} onClick={() => move(index, -1)}>↑</button>
                  <button type="button" className="tray-mini icon" disabled={index === tray.length - 1} aria-label={t(locale, 'test.down')} onClick={() => move(index, 1)}>↓</button>
                </div>
                <i style={{ background: DOMAIN_COLOR[skill.domain] }} />
                <div className="tray-body">
                <div className="tray-copy">
                  <b>{kind || tx(locale, skill.title)}</b>
                  <small>{skill.code}{kind ? ` · ${tx(locale, skill.title)}` : ''} · {item.difficulty} {t(locale, settingsKey(skill, item.difficulty, item.knobs, squareIds(skill)))}{everyGrade || skill.grade !== grade ? ` · ${t(locale, 'grade.n', { n: skill.grade })}` : ''}</small>
                </div>
                <div className="tray-count">
                  <span className="fine">{t(locale, 'tray.questions')}</span>
                  <span className="stepper">
                    <button type="button" aria-label={t(locale, 'tray.fewer')} onClick={() => setTray((current) => current.map((row, itemIndex) => itemIndex === index ? { ...row, count: Math.max(1, row.count - 1) } : row))}>−</button>
                    <b>{item.count}</b>
                    <button type="button" aria-label={t(locale, 'tray.moreQuestions')} onClick={() => setTray((current) => current.map((row, itemIndex) => itemIndex === index && total < CAP ? { ...row, count: row.count + 1 } : row))}>+</button>
                  </span>
                </div>
                <div className="tray-tools">
                  <button type="button" className="tray-tool" aria-expanded={open} onClick={() => setOpenIndex(open ? null : index)}>
                    <Icon name="gear" size={16} /> {t(locale, open ? 'tray.done' : 'tray.adjust')}
                  </button>
                  <button type="button" className="tray-tool" aria-pressed={pinned} onClick={() => togglePin(item)}>
                    <Icon name="pin" size={16} /> {t(locale, pinned ? 'work.unpin' : 'work.pin')}
                  </button>
                  <button type="button" className="tray-tool danger" onClick={() => removeAt(index)}>{t(locale, 'test.remove')}</button>
                </div>
                </div>
                {open ? (
                  <div className="tray-more">
                    <p className="fine">{t(locale, 'tray.note')}</p>
                    <div className="variable">
                      <div className="variable-head"><span>{t(locale, 'test.difficulty')}</span></div>
                      <div className="segment wrap" role="radiogroup" aria-label={t(locale, 'test.difficulty')}>
                        {[1, 2, 3, 4, 5].map((level) => (
                          <button key={level} type="button" role="radio" aria-checked={item.difficulty === level} data-on={item.difficulty === level} onClick={() => setDifficulty(index, level)}>
                            {level} · {t(locale, levelKey(level))}
                          </button>
                        ))}
                      </div>
                    </div>
                    <Variables skill={skill} locale={locale} values={item.knobs} resetDifficulty={item.difficulty} hideIds={squareIds(skill)} showIntro={false} onChange={(knobs) => setTray((current) => current.map((row, itemIndex) => itemIndex === index ? { ...row, knobs } : row))} />
                  </div>
                ) : null}
              </article>
            )
          })}
        </div>
      ) : null}
      <div className="picker">
        {focused && layer ? (
          <div className="kind-stage">
            <p className="kicker">{everyGrade || focused.grade !== grade ? `${t(locale, 'grade.n', { n: focused.grade })} · ${focused.code}` : focused.code}{crumb ? ` · ${tx(locale, crumb)}` : ''}</p>
            <h2>{tx(locale, focused.title)}</h2>
            <p className="fine">{tx(locale, layer.label)}</p>
            <p className="fine">{t(locale, 'test.kindNote')}</p>
            <UnitSquares
              skill={focused}
              path={path}
              locale={locale}
              marked={(value) => tray.reduce((sum, item) => item.skillId === focused.id && matchesPath(item.knobs, { ...path, [layer.id]: value }) ? sum + item.count : sum, 0)}
              onChoose={chooseSquare}
            />
          </div>
        ) : !needle && !strand ? (
          <>
            <p className="muted">{t(locale, 'practice.pick')}</p>
            <div className="catalog">
              {strands.map((item, index) => {
                const count = pool.filter((skill) => skill.domain === item).length
                return (
                  <button key={item} type="button" className="strand-card" style={{ ['--wash' as string]: DOMAIN_COLOR[item], animationDelay: `${index * 40}ms` }} onClick={() => setStrand(item)}>
                    <SkillDemo domain={item} />
                    <b>{t(locale, `domain.${item}`)}</b>
                    <small>{t(locale, 'practice.count', { n: count })}</small>
                  </button>
                )
              })}
            </div>
          </>
        ) : (
          <>
            <input className="field" value={query} aria-label={t(locale, 'practice.search')} placeholder={t(locale, 'practice.search')} onChange={(event) => setQuery(event.target.value)} />
            <div className="catalog">
              {skills.length === 0 ? <p className="muted">{t(locale, 'practice.empty')}</p> : null}
              {skills.map((skill, index) => {
                const count = questionsFor(skill.id)
                return (
                  <button key={skill.id} type="button" className="skill-card" data-here={count > 0} style={{ ['--wash' as string]: DOMAIN_COLOR[skill.domain], animationDelay: `${Math.min(index, 8) * 30}ms` }} onClick={() => openCategory(skill.id)}>
                    <SkillDemo domain={skill.domain} skillId={skill.id} />
                    <small>{everyGrade ? `${t(locale, 'grade.n', { n: skill.grade })} · ${skill.code}` : skill.code}</small>
                    <b>{tx(locale, skill.title)}</b>
                    <span>{count ? t(locale, 'test.tray', { n: count }) : t(locale, 'test.pickKind')}</span>
                  </button>
                )
              })}
            </div>
          </>
        )}
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
    const variants = stamped.blueprint.items.flatMap((item) => {
      const skill = getSkill(item.skillId)
      const variant = skill ? unitVariant(skill, item.knobs) : undefined
      return Array.from({ length: item.count }, () => variant)
    })
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
  const { locale, data, setRoute, setActive, requestPrint, togglePin } = useStore()
  const route = data.route
  const test = route.name === 'summary' ? data.tests.find((item) => item.id === route.id) : undefined
  const [open, setOpen] = useState<number | null>(null)
  if (!test) return null
  const scored = test.correct.filter(Boolean).length
  const pct = test.questions.length ? Math.round((scored / test.questions.length) * 100) : 0
  const totalTime = test.times.reduce((sum, item) => sum + item, 0)
  const expanded = test.blueprint.items.flatMap((item) => Array.from({ length: item.count }, () => item))
  const groups = new Map<string, { skillId: string; knobs: KnobValues; correct: number; total: number; time: number; difficulty: number }>()
  let slowest = { skillId: '', time: -1 }
  test.questions.forEach((question, index) => {
    const spent = test.times[index] ?? 0
    const source = expanded[index]
    const skillId = source?.skillId ?? question.skillId
    const knobs = source?.knobs ?? {}
    const skill = getSkill(skillId)
    const key = skill ? unitKey(skillId, knobs, skill) : skillId
    const row = groups.get(key) ?? { skillId, knobs, correct: 0, total: 0, time: 0, difficulty: question.difficulty }
    row.total += 1
    row.time += spent
    if (test.correct[index]) row.correct += 1
    row.difficulty = Math.max(row.difficulty, question.difficulty)
    groups.set(key, row)
    if (spent > slowest.time) slowest = { skillId, time: spent }
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
        {[...groups.entries()].map(([key, row]) => {
          const skill = getSkill(row.skillId)
          const ratio = row.correct / row.total
          const strong = ratio >= 0.8
          const title = skill ? unitTitle(skill, row.knobs) : null
          const pinned = skill ? (data.pins ?? []).some((pin) => unitKey(pin.skillId, pin.knobs, skill) === key) : false
          return (
            <article key={key} className="card pad">
              <b>{title ? tx(locale, title) : skill ? tx(locale, skill.title) : row.skillId}</b>
              <div className="bar"><i style={{ width: `${ratio * 100}%` }} /></div>
              <p className="fine">{row.correct}/{row.total} · {clock(row.time / row.total)} · {t(locale, strong ? 'sum.harder' : 'sum.growth')}</p>
              {skill ? (
                <div className="row">
                  <button type="button" className="text-btn" onClick={() => setRoute({ name: 'play', skillId: row.skillId, auto: true, difficulty: strong ? Math.min(5, row.difficulty + 1) : Math.max(1, row.difficulty - 1), knobs: row.knobs })}>
                    {t(locale, strong ? 'sum.harder' : 'sum.practice')}
                  </button>
                  <button type="button" className="text-btn" onClick={() => togglePin({ skillId: row.skillId, knobs: row.knobs })}>
                    <Icon name="pin" /> {t(locale, pinned ? 'work.unpin' : 'work.pin')}
                  </button>
                </div>
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
          const kind = skill ? kindLabel(skill, item.knobs, locale) : ''
          return (
            <article key={`${item.skillId}-${index}`} className="card pad">
              <b>{kind || (skill ? tx(locale, skill.title) : item.skillId)}</b>
              <p className="fine">{skill && kind ? `${tx(locale, skill.title)} · ` : ''}{t(locale, 'test.tray', { n: item.count })}{skill ? ` · ${t(locale, settingsKey(skill, item.difficulty, item.knobs, squareIds(skill)))}` : ''}</p>
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
