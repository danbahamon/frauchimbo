import { useEffect, useMemo, useState } from 'react'
import { DOMAIN_COLOR, SKILLS, getSkill } from '../data/skills'
import { statsBySkill } from '../engine/insights'
import type { DomainId, Grade } from '../lib/types'
import { DOMAIN_ORDER } from '../lib/types'
import { t, tx } from '../lib/i18n'
import { useStore } from '../state'
import { SkillDemo } from '../components/Preview'
import { Icon } from '../components/Icon'

const GRADES: Grade[] = [3, 4, 5, 6, 7]

export function Practice() {
  const { locale, data, setRoute } = useStore()
  const focusId = data.route.name === 'practice' ? data.route.skillId : undefined
  const focused = focusId ? getSkill(focusId) : undefined
  const [grade, setGrade] = useState<Grade | 0>(focused?.grade ?? data.profile?.grade ?? 4)
  const [domain, setDomain] = useState<DomainId | null>(focused?.domain ?? null)
  const [query, setQuery] = useState('')
  const stats = useMemo(() => new Map(statsBySkill(data.attempts).map((item) => [item.skillId, item])), [data.attempts])
  useEffect(() => {
    if (!focusId) return
    document.getElementById(`skill-${focusId}`)?.scrollIntoView({ block: 'center' })
  }, [focusId, domain])
  const needle = query.trim().toLowerCase()
  const inGrade = SKILLS.filter((skill) => !grade || skill.grade === grade)
  const strands = DOMAIN_ORDER.filter((item) => inGrade.some((skill) => skill.domain === item))
  const list = inGrade.filter((skill) => {
    if (!needle && domain && skill.domain !== domain) return false
    if (!needle) return Boolean(domain)
    return `${skill.code} ${tx(locale, skill.title)} ${tx(locale, skill.blurb)}`.toLowerCase().includes(needle)
  })
  const showStrands = !needle && !domain
  return (
    <div>
      <p className="kicker">{t(locale, 'nav.practice')}</p>
      <h1>{t(locale, 'home.practice')}</h1>
      <input className="field" value={query} placeholder={t(locale, 'practice.search')} onChange={(event) => setQuery(event.target.value)} />
      <div className="segment" style={{ marginTop: 12 }}>
        {GRADES.map((item) => (
          <button key={item} type="button" data-on={grade === item} onClick={() => setGrade(item)}>{item}</button>
        ))}
        <button type="button" data-on={grade === 0} onClick={() => setGrade(0)}>{t(locale, 'practice.all')}</button>
      </div>
      {showStrands ? (
        <>
          <p className="muted" style={{ marginTop: 16 }}>{t(locale, 'practice.pick')}</p>
          <div className="catalog">
            {strands.map((item, index) => {
              const count = inGrade.filter((skill) => skill.domain === item).length
              return (
                <button
                  key={item}
                  type="button"
                  className="strand-card"
                  style={{ ['--wash' as string]: DOMAIN_COLOR[item], animationDelay: `${index * 40}ms` }}
                  onClick={() => setDomain(item)}
                >
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
          <button type="button" className="text-btn" style={{ marginTop: 8 }} onClick={() => { setDomain(null); setQuery('') }}>
            <Icon name="back" /> {t(locale, 'practice.backstrands')}
          </button>
          <div className="catalog">
            {list.length === 0 ? <p className="muted">{t(locale, 'practice.empty')}</p> : null}
            {list.map((skill, index) => {
              const stat = stats.get(skill.id)
              const pips = stat ? Math.round(stat.recent * 5) : 0
              return (
                <button
                  key={skill.id}
                  id={`skill-${skill.id}`}
                  type="button"
                  className="skill-card"
                  data-here={skill.id === focusId}
                  style={{ ['--wash' as string]: DOMAIN_COLOR[skill.domain], animationDelay: `${index * 35}ms` }}
                  onClick={() => setRoute({ name: 'play', skillId: skill.id })}
                >
                  <SkillDemo domain={skill.domain} />
                  <small>{skill.code}</small>
                  <b>{tx(locale, skill.title)}</b>
                  <span>{tx(locale, skill.blurb)}</span>
                  <span className="pips" aria-hidden="true">
                    {[0, 1, 2, 3, 4].map((pip) => <i key={pip} className={pip < pips ? 'pip on' : 'pip'} />)}
                  </span>
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
