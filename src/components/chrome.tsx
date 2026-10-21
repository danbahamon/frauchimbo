import { useEffect, useState } from 'react'
import { getSkill } from '../data/skills'
import { statsBySkill, strandAccuracy } from '../engine/insights'
import type { Answer, DomainId, KnobValues, Locale, Question, Skill } from '../lib/types'
import { encodeShare, t, tx } from '../lib/i18n'
import { localeTag } from '../lib/math'
import { useStore } from '../state'
import { QuestionStem, groupBySkill } from './visuals'
import { MathText } from './MathText'

export function KnobEditor({ skill, values, locale, onChange }: { skill: Skill; values: KnobValues; locale: Locale; onChange: (next: KnobValues) => void }) {
  return (
    <div className="stack">
      {skill.knobs.map((knob) => {
        if (knob.kind === 'range') {
          const value = Number(values[knob.id] ?? knob.min)
          return (
            <div className="row" key={knob.id}>
              <span className="fine">{tx(locale, knob.label)}</span>
              <button type="button" className="icon-btn" onClick={() => onChange({ ...values, [knob.id]: Math.max(knob.min, Number((value - knob.step).toFixed(4))) })}>−</button>
              <b>{value}</b>
              <button type="button" className="icon-btn" onClick={() => onChange({ ...values, [knob.id]: Math.min(knob.max, Number((value + knob.step).toFixed(4))) })}>+</button>
            </div>
          )
        }
        if (knob.kind === 'toggle') {
          const on = Boolean(values[knob.id])
          return (
            <button key={knob.id} type="button" className="chip" data-on={on} onClick={() => onChange({ ...values, [knob.id]: !on })}>
              {tx(locale, knob.label)}: {t(locale, on ? 'on' : 'off')}
            </button>
          )
        }
        const current = String(values[knob.id] ?? knob.options[0]?.value ?? '')
        return (
          <div key={knob.id}>
            <div className="fine">{tx(locale, knob.label)}</div>
            <div className="row">
              {knob.options.map((option) => (
                <button key={option.value} type="button" className="chip" data-on={current === option.value} onClick={() => onChange({ ...values, [knob.id]: option.value })}>
                  {tx(locale, option.label)}
                </button>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function DiffPips({ value, locale, onChange }: { value: number; locale: Locale; onChange: (next: number) => void }) {
  return (
    <div className="row">
      <span className="fine">{t(locale, 'play.level')}</span>
      {[1, 2, 3, 4, 5].map((level) => (
        <button key={level} type="button" className="chip" data-on={value === level} onClick={() => onChange(level)}>
          {t(locale, `diff.${level}`)}
        </button>
      ))}
    </div>
  )
}

function clock(ms: number) {
  const total = Math.max(0, Math.round(ms / 1000))
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}

function brief(question: Question, answer: Answer | null, locale: Locale, blank: string) {
  if (!answer) return blank
  if (answer.kind === 'number') return String(answer.value)
  if (answer.kind === 'fraction') return `${answer.whole ? `${answer.whole} ` : ''}${answer.n}/${answer.d}`
  if (answer.kind === 'compare') return answer.sign
  if (answer.kind === 'choice' && question.response.type === 'choice') {
    const option = question.response.options.find((item) => item.id === answer.id)
    return option ? tx(locale, option.label) : answer.id
  }
  if (answer.kind === 'points') return answer.points.map((point) => `(${point.x}, ${point.y})`).join(' ')
  if (answer.kind === 'clock') return `${answer.h}:${String(answer.m).padStart(2, '0')}`
  if (answer.kind === 'ratio') return `${answer.a}:${answer.b}`
  if (answer.kind === 'digits') return answer.digits.join('')
  if (answer.kind === 'shade') return String(answer.count)
  if (answer.kind === 'angle') return `${answer.degrees}°`
  if (answer.kind === 'chart') return answer.values.join(', ')
  if (answer.kind === 'order') return answer.ids.join(' → ')
  if (answer.kind === 'multi') return Object.entries(answer.parts).map(([key, value]) => `${key} ${value}`).join(' · ')
  return blank
}

export function PrintSheet() {
  const { printJob, clearPrint, locale, data } = useStore()
  useEffect(() => {
    if (!printJob) return
    const timer = window.setTimeout(() => window.print(), 160)
    const done = () => clearPrint()
    window.addEventListener('afterprint', done)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('afterprint', done)
    }
  }, [printJob, clearPrint])
  if (!printJob) return null
  if (printJob.kind === 'stats') {
    const profile = data.profile
    const recent = data.attempts.slice(-30)
    const accuracy = recent.length ? Math.round((recent.filter((item) => item.correct).length / recent.length) * 100) : 0
    const strands = strandAccuracy(data.attempts)
    const stats = statsBySkill(data.attempts)
    const strengths = stats.filter((item) => item.attempts >= 4 && item.recent >= 0.85).slice(0, 4)
    const growth = stats.filter((item) => item.attempts >= 3 && item.recent < 0.7).slice(0, 4)
    return (
      <div className="print-root">
        <article className="print-sheet">
          <p className="kicker">Frau Chimbo</p>
          <h1>{t(locale, 'stats.report')}</h1>
          <p>{profile?.name} · {t(locale, 'print.date')}: {new Date().toLocaleDateString(localeTag(locale))} · {profile ? t(locale, 'grade.n', { n: profile.grade }) : ''}</p>
          <div className="print-tiles">
            <span><b>{accuracy}%</b> {t(locale, 'stats.accuracy')}</span>
            <span><b>{data.attempts.length}</b> {t(locale, 'stats.attempts', { n: data.attempts.length })}</span>
            <span><b>{data.tests.length}</b> {t(locale, 'stats.tests')}</span>
          </div>
          {strands.map((strand) => (
            <p key={strand.domain}>{t(locale, `domain.${strand.domain as DomainId}`)} · {Math.round(strand.accuracy * 100)}% · {strand.total}</p>
          ))}
          {strengths.length ? <h2>{t(locale, 'stats.strengths')}</h2> : null}
          {strengths.map((item) => <p key={item.skillId}>{getSkill(item.skillId) ? tx(locale, getSkill(item.skillId)?.title) : item.skillId} · {Math.round(item.recent * 100)}%</p>)}
          {growth.length ? <h2>{t(locale, 'stats.growth')}</h2> : null}
          {growth.map((item) => <p key={item.skillId}>{getSkill(item.skillId) ? tx(locale, getSkill(item.skillId)?.title) : item.skillId} · {Math.round(item.recent * 100)}%</p>)}
          <h2>{t(locale, 'stats.tests')}</h2>
          {[...data.tests].reverse().slice(0, 8).map((item) => (
            <p key={item.id}>{tx(locale, item.blueprint.title) || t(locale, 'home.test')} · {item.correct.filter(Boolean).length}/{item.questions.length} · {clock(item.times.reduce((sum, time) => sum + time, 0))}</p>
          ))}
        </article>
      </div>
    )
  }
  const test = printJob.test
  if (!test) return null
  const title = tx(locale, test.blueprint.title) || t(locale, printJob.kind === 'teacher' ? 'print.teacher' : 'print.blank')
  const scored = test.correct.filter(Boolean).length
  const groups = new Map<string, { correct: number; total: number }>()
  test.questions.forEach((question, index) => {
    const row = groups.get(question.skillId) ?? { correct: 0, total: 0 }
    row.total += 1
    if (test.correct[index]) row.correct += 1
    groups.set(question.skillId, row)
  })
  return (
    <div className="print-root">
      <article className="print-sheet">
        <p className="kicker">Frau Chimbo</p>
        <h1>{title}</h1>
        <p>
          {t(locale, 'print.name')}: {data.profile?.name || '____________'} · {t(locale, 'print.date')}: {new Date(test.finishedAt || Date.now()).toLocaleDateString(localeTag(locale))}
        </p>
        {printJob.kind === 'teacher' ? (
          <>
            <div className="print-tiles">
              <span><b>{scored}/{test.questions.length}</b> {t(locale, 'sum.score')}</span>
              <span><b>{clock(test.times.reduce((sum, item) => sum + item, 0))}</b> {t(locale, 'sum.time')}</span>
              <span><b>{test.questions.length - scored}</b> {t(locale, 'sum.wrong')}</span>
            </div>
            {[...groups.entries()].map(([skillId, row]) => (
              <p key={skillId}>{getSkill(skillId) ? tx(locale, getSkill(skillId)?.title) : skillId} · {row.correct}/{row.total}</p>
            ))}
          </>
        ) : null}
        <div className="print-stack">
          {groupBySkill(test.questions).map((section) => {
            const skill = getSkill(section.skillId)
            return (
              <section key={`${section.skillId}-${section.items[0]?.index}`} className="print-section">
                <h2>{skill ? `${skill.code} · ${tx(locale, skill.title)}` : section.skillId}</h2>
                <div className="print-grid">
                  {section.items.map(({ question, index }) => {
                    const miss = printJob.kind === 'teacher' && !test.correct[index]
                    return (
                      <div className={miss ? 'print-q print-miss' : 'print-q'} key={question.id}>
                        <b>{index + 1}</b>
                        <QuestionStem question={question} locale={locale} />
                        {printJob.kind === 'blank' ? (question.response.type === 'coordinate' ? null : <div className="write-line">&nbsp;</div>) : (
                          <p>
                            {test.correct[index] ? '✓' : '×'} {clock(test.times[index] ?? 0)} · {brief(question, test.responses[index], locale, t(locale, 'inv.blank'))}
                            {miss ? ` → ${brief(question, question.answer, locale, '')}` : ''}
                          </p>
                        )}
                        {miss ? (
                          <ol className="steps">
                            {question.steps.slice(0, 2).map((step, stepIndex) => <li key={stepIndex}><MathText text={tx(locale, step.text)} /></li>)}
                          </ol>
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>
      </article>
    </div>
  )
}

export function ShareModal() {
  const { share, closeShare, locale, flash } = useStore()
  const [link, setLink] = useState('')
  const [qr, setQr] = useState('')
  useEffect(() => {
    if (!share) return
    const next = `${location.origin}${location.pathname}${location.search}#t=${encodeShare(share)}`
    setLink(next)
    let live = true
    void import('qrcode').then((mod) => mod.toDataURL(next, { margin: 1, width: 320, color: { dark: '#1c1712', light: '#fffaf3' } })).then((src) => {
      if (live) setQr(src)
    })
    return () => { live = false }
  }, [share])
  if (!share) return null
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link)
      flash(t(locale, 'share.copied'))
    } catch {
      flash(link)
    }
  }
  const native = async () => {
    if (!navigator.share) return
    try { await navigator.share({ title: 'Frau Chimbo', url: link }) } catch { /* dismissed */ }
  }
  return (
    <div className="modal-back" onClick={closeShare}>
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <p className="kicker">{t(locale, 'share.title')}</p>
        <h2>{tx(locale, share.title) || t(locale, 'share.title')}</h2>
        <p className="muted">{t(locale, 'share.note')}</p>
        {qr ? <img className="qr" src={qr} alt="" /> : null}
        <p className="fine" style={{ wordBreak: 'break-all' }}>{link}</p>
        <div className="row">
          <button type="button" className="primary" onClick={() => void copy()}>{t(locale, 'share.copy')}</button>
          {typeof navigator.share === 'function' ? <button type="button" className="ghost" onClick={() => void native()}>{t(locale, 'share.native')}</button> : null}
          <button type="button" className="text-btn" onClick={closeShare}>{t(locale, 'share.close')}</button>
        </div>
      </div>
    </div>
  )
}
