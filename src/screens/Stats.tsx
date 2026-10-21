import { DOMAIN_COLOR, getSkill } from '../data/skills'
import { statsBySkill, strandAccuracy, suggest } from '../engine/insights'
import type { DomainId, Locale } from '../lib/types'
import { t, tx } from '../lib/i18n'
import { localeTag } from '../lib/math'
import { useStore } from '../state'

function clock(ms: number) {
  const total = Math.max(0, Math.round(ms / 1000))
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}

export function Stats() {
  const { locale, data, setRoute, requestStatsPrint } = useStore()
  const profile = data.profile
  if (!profile) return null
  const stats = statsBySkill(data.attempts)
  const recent = data.attempts.slice(-30)
  const accuracy = recent.length ? recent.filter((item) => item.correct).length / recent.length : 0
  const strengths = stats.filter((item) => item.attempts >= 4 && item.recent >= 0.85).sort((a, b) => b.recent - a.recent).slice(0, 3)
  const growth = stats.filter((item) => item.attempts >= 3 && item.recent < 0.7).sort((a, b) => a.recent - b.recent).slice(0, 3)
  const ideas = suggest(data.attempts, profile.grade).slice(0, 2)
  const strands = strandAccuracy(data.attempts)
  const time = data.attempts.reduce((sum, item) => sum + item.timeMs, 0)
  if (!data.attempts.length && !data.tests.length) {
    return (
      <div>
        <h1>{t(locale, 'nav.stats')}</h1>
        <p className="muted">{t(locale, 'stats.empty')}</p>
        <button type="button" className="primary" onClick={() => setRoute({ name: 'practice' })}>{t(locale, 'home.practice')}</button>
      </div>
    )
  }
  return (
    <div>
      <div className="page-head">
        <div>
          <p className="kicker">{profile.name}</p>
          <h1>{t(locale, 'stats.report')}</h1>
        </div>
        <button type="button" className="ghost" onClick={() => requestStatsPrint()}>{t(locale, 'stats.print')}</button>
      </div>
      <div className="sum-grid">
        <article className="card sum-tile"><small>{t(locale, 'stats.accuracy')}</small><b>{Math.round(accuracy * 100)}%</b><span className="fine">{t(locale, 'stats.attempts', { n: recent.length })}</span></article>
        <article className="card sum-tile"><small>{t(locale, 'sum.time')}</small><b>{clock(time)}</b></article>
        <article className="card sum-tile"><small>{t(locale, 'stats.tests')}</small><b>{data.tests.length}</b></article>
      </div>
      {strands.length ? (
        <section className="card pad" style={{ marginTop: 14 }}>
          <h2>{t(locale, 'stats.strands')}</h2>
          {strands.map((strand) => (
            <div key={strand.domain} className="strand-line">
              <span>{t(locale, `domain.${strand.domain as DomainId}`)}</span>
              <div className="bar"><i style={{ width: `${strand.accuracy * 100}%`, background: DOMAIN_COLOR[strand.domain as DomainId] }} /></div>
              <b>{Math.round(strand.accuracy * 100)}%</b>
            </div>
          ))}
        </section>
      ) : null}
      <div className="split" style={{ marginTop: 14 }}>
        <section>
          <h2>{t(locale, 'stats.strengths')}</h2>
          <SkillList ids={strengths.map((item) => item.skillId)} empty={t(locale, 'stats.none')} locale={locale} onOpen={(skillId) => setRoute({ name: 'play', skillId, auto: true, difficulty: 5 })} />
        </section>
        <section>
          <h2>{t(locale, 'stats.growth')}</h2>
          <SkillList ids={growth.map((item) => item.skillId)} empty={t(locale, 'stats.none')} locale={locale} onOpen={(skillId) => setRoute({ name: 'play', skillId, auto: true, difficulty: 2 })} />
        </section>
      </div>
      {ideas.length ? (
        <section style={{ marginTop: 8 }}>
          <h2>{t(locale, 'stats.next')}</h2>
          <div className="catalog">
            {ideas.map((idea) => {
              const skill = getSkill(idea.skillId)
              if (!skill) return null
              return (
                <button key={idea.skillId + idea.reason} type="button" className="skill-card" style={{ ['--wash' as string]: DOMAIN_COLOR[skill.domain] }} onClick={() => setRoute({ name: 'play', skillId: skill.id, auto: true, difficulty: idea.difficulty })}>
                  <small>{t(locale, `reason.${idea.reason}`)}</small>
                  <b>{tx(locale, skill.title)}</b>
                  <span>{t(locale, `diff.${idea.difficulty}`)}</span>
                </button>
              )
            })}
          </div>
        </section>
      ) : null}
      <h2 style={{ marginTop: 16 }}>{t(locale, 'stats.tests')}</h2>
      {data.tests.length === 0 ? <p className="muted">{t(locale, 'stats.none')}</p> : null}
      <div className="stack">
        {[...data.tests].reverse().slice(0, 6).map((test) => {
          const scored = test.correct.filter(Boolean).length
          return (
            <button key={test.id} type="button" className="sum-row" onClick={() => setRoute({ name: 'summary', id: test.id })}>
              <span>{scored}/{test.questions.length}</span>
              <span>{tx(locale, test.blueprint.title) || t(locale, 'home.test')}</span>
              <small>{new Date(test.finishedAt).toLocaleDateString(localeTag(locale))}</small>
              <small>{clock(test.times.reduce((sum, item) => sum + item, 0))}</small>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function SkillList({ ids, empty, locale, onOpen }: { ids: string[]; empty: string; locale: Locale; onOpen: (id: string) => void }) {
  if (!ids.length) return <p className="muted">{empty}</p>
  return (
    <div className="stack">
      {ids.map((id) => {
        const skill = getSkill(id)
        if (!skill) return null
        return (
          <button key={id} type="button" className="sum-row slim" onClick={() => onOpen(id)}>
            <i className="dot" style={{ background: DOMAIN_COLOR[skill.domain] }} />
            <span>{tx(locale, skill.title)}</span>
            <small>{skill.code}</small>
          </button>
        )
      })}
    </div>
  )
}
