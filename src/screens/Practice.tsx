import { useEffect, useMemo, useState } from 'react'
import { DOMAIN_COLOR, SKILLS, getSkill } from '../data/skills'
import { statsBySkill } from '../engine/insights'
import type { BlueprintItem, DomainId, Grade } from '../lib/types'
import { DOMAIN_ORDER } from '../lib/types'
import { t, tx } from '../lib/i18n'
import { levelKey, settingsKey } from '../lib/levels'
import { positionDifficulty } from '../lib/math'
import { skillMatches } from '../lib/search'
import { identityPath, knobsForPath, matchesPath, nextLayer, squareIds, unitKey, unitTitle } from '../lib/units'
import { useStore } from '../state'
import { SkillDemo } from '../components/Preview'
import { Icon } from '../components/Icon'
import { UnitSquares } from '../components/UnitSquares'
import { Variables } from '../components/Variables'

const GRADES: Grade[] = [3, 4, 5, 6, 7]

export function Practice() {
  const { locale, data, setRoute, togglePin } = useStore()
  const routed = data.route.name === 'practice' && data.route.skillId ? getSkill(data.route.skillId) : undefined
  const [grade, setGrade] = useState<Grade | 0>(routed?.grade ?? data.profile?.grade ?? 4)
  const [domain, setDomain] = useState<DomainId | null>(routed?.domain ?? null)
  const [query, setQuery] = useState('')
  const [skillId, setSkillId] = useState<string | null>(routed?.id ?? null)
  const [path, setPath] = useState<Record<string, string>>({})
  const [tray, setTray] = useState<BlueprintItem[]>([])
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const stats = useMemo(() => new Map(statsBySkill(data.attempts).map((item) => [item.skillId, item])), [data.attempts])
  const skill = skillId ? getSkill(skillId) : undefined
  const layer = skill ? nextLayer(skill, path) : null
  const total = tray.reduce((sum, item) => sum + item.count, 0)
  useEffect(() => {
    if (openIndex === null) return
    document.querySelector('.tray-more')?.scrollIntoView({ block: 'nearest' })
  }, [openIndex])
  const needle = query.trim()
  const inGrade = SKILLS.filter((item) => !grade || item.grade === grade)
  const strands = DOMAIN_ORDER.filter((item) => inGrade.some((row) => row.domain === item))
  const list = inGrade.filter((item) => {
    if (needle) return skillMatches(item, needle)
    if (domain && item.domain !== domain) return false
    return Boolean(domain)
  })
  const showStrands = !needle && !domain && !skill
  const difficultyFor = data.profile ? positionDifficulty(data.profile.position) : 3

  const addUnit = (id: string, nextPath: Record<string, string>) => {
    const chosen = getSkill(id)
    if (!chosen) return
    const knobs = knobsForPath(chosen, difficultyFor, nextPath)
    setTray((current) => [...current, { skillId: id, count: 4, difficulty: difficultyFor, knobs }])
  }

  const chooseSquare = (id: string, value: string) => {
    if (!skill) return
    const next = { ...path, [id]: value }
    if (nextLayer(skill, next)) setPath(next)
    else addUnit(skill.id, next)
  }

  const openSkill = (id: string) => {
    const chosen = getSkill(id)
    if (!chosen) return
    if (!nextLayer(chosen, {})) {
      addUnit(id, {})
      return
    }
    setSkillId(id)
    setPath({})
    if (!domain) setDomain(chosen.domain)
  }

  const back = () => {
    if (skill && Object.keys(path).length) {
      const keys = Object.keys(path)
      const next = { ...path }
      delete next[keys[keys.length - 1]]
      setPath(next)
      return
    }
    if (skillId) {
      setSkillId(null)
      setPath({})
      return
    }
    setDomain(null)
    setQuery('')
  }

  const setDifficulty = (index: number, difficulty: number) => {
    setTray((current) => current.map((row, itemIndex) => {
      if (itemIndex !== index) return row
      const rowSkill = getSkill(row.skillId)
      if (!rowSkill) return { ...row, difficulty }
      const fixed = identityPath(rowSkill, row.knobs)
      const usual = knobsForPath(rowSkill, row.difficulty, fixed)
      const untouched = JSON.stringify(row.knobs) === JSON.stringify(usual)
      return { ...row, difficulty, knobs: untouched ? knobsForPath(rowSkill, difficulty, fixed) : row.knobs }
    }))
  }

  const crumb = skill ? unitTitle(skill, path) : null
  const start = () => setRoute({ name: 'play', queue: tray.flatMap((item) => Array.from({ length: item.count }, () => ({ ...item, count: 1 }))) })
  return (
    <div>
      <p className="kicker">{t(locale, 'nav.practice')}</p>
      <h1>{skill ? tx(locale, skill.title) : t(locale, 'home.practice')}</h1>
      {skill || domain || needle ? (
        <button type="button" className="text-btn" onClick={back}><Icon name="back" /> {t(locale, skill ? 'on.back' : 'practice.backstrands')}</button>
      ) : null}
      {!skill ? (
        <input className="field" value={query} placeholder={t(locale, 'practice.search')} onChange={(event) => setQuery(event.target.value)} />
      ) : null}
      {!skill ? (
        <div className="segment" style={{ marginTop: 12 }}>
          {GRADES.map((item) => (
            <button key={item} type="button" data-on={grade === item} onClick={() => setGrade(item)}>{item}</button>
          ))}
          <button type="button" data-on={grade === 0} onClick={() => setGrade(0)}>{t(locale, 'practice.all')}</button>
        </div>
      ) : null}
      {tray.length ? (
        <div className="practice-go">
          <button type="button" className="primary wide" onClick={start}>
            <Icon name="forward" /> {t(locale, 'practice.start', { n: total })}
          </button>
        </div>
      ) : null}
      {tray.length ? (
        <div className="tray">
          {tray.map((item, index) => {
            const rowSkill = getSkill(item.skillId)
            if (!rowSkill) return null
            const title = unitTitle(rowSkill, item.knobs)
            const pinned = (data.pins ?? []).some((pin) => unitKey(pin.skillId, pin.knobs, rowSkill) === unitKey(item.skillId, item.knobs, rowSkill))
            const open = openIndex === index
            return (
              <article key={`${item.skillId}-${index}`} className="tray-row" data-open={open}>
                <i style={{ background: DOMAIN_COLOR[rowSkill.domain] }} />
                <div className="tray-body">
                  <div className="tray-copy">
                    <b>{title ? tx(locale, title) : tx(locale, rowSkill.title)}</b>
                    <small>{rowSkill.code} · {item.difficulty} {t(locale, settingsKey(rowSkill, item.difficulty, item.knobs, squareIds(rowSkill)))}</small>
                  </div>
                  <div className="tray-count">
                    <span className="fine">{t(locale, 'tray.questions')}</span>
                    <span className="stepper">
                      <button type="button" aria-label={t(locale, 'tray.fewer')} onClick={() => setTray((current) => current.map((row, itemIndex) => itemIndex === index ? { ...row, count: Math.max(1, row.count - 1) } : row))}>−</button>
                      <b>{item.count}</b>
                      <button type="button" aria-label={t(locale, 'tray.moreQuestions')} onClick={() => setTray((current) => current.map((row, itemIndex) => itemIndex === index ? { ...row, count: row.count + 1 } : row))}>+</button>
                    </span>
                  </div>
                  <div className="tray-tools">
                    <button type="button" className="tray-tool" aria-expanded={open} onClick={() => setOpenIndex(open ? null : index)}>
                      <Icon name="gear" size={16} /> {t(locale, open ? 'tray.done' : 'tray.adjust')}
                    </button>
                    <button type="button" className="tray-tool" aria-pressed={pinned} onClick={() => togglePin(item)}>
                      <Icon name="pin" size={16} /> {t(locale, pinned ? 'work.unpin' : 'work.pin')}
                    </button>
                    <button type="button" className="tray-tool danger" onClick={() => { setTray((current) => current.filter((_, itemIndex) => itemIndex !== index)); setOpenIndex((current) => (current === index ? null : current !== null && current > index ? current - 1 : current)) }}>{t(locale, 'test.remove')}</button>
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
                    <Variables skill={rowSkill} locale={locale} values={item.knobs} resetDifficulty={item.difficulty} hideIds={squareIds(rowSkill)} showIntro={false} onChange={(knobs) => setTray((current) => current.map((row, itemIndex) => itemIndex === index ? { ...row, knobs } : row))} />
                  </div>
                ) : null}
              </article>
            )
          })}
        </div>
      ) : null}
      {skill && layer ? (
        <>
          <p className="kicker" style={{ marginTop: 16 }}>{skill.code}{crumb ? ` · ${tx(locale, crumb)}` : ''}</p>
          <p className="muted">{t(locale, 'practice.pickUnit')}</p>
          <p className="fine">{tx(locale, layer.label)}</p>
          <UnitSquares
            skill={skill}
            path={path}
            locale={locale}
            marked={(value) => tray.reduce((sum, item) => item.skillId === skill.id && matchesPath(item.knobs, { ...path, [layer.id]: value }) ? sum + item.count : sum, 0)}
            onChoose={chooseSquare}
          />
        </>
      ) : null}
      {showStrands ? (
        <>
          <p className="muted" style={{ marginTop: 16 }}>{t(locale, 'practice.pick')}</p>
          <div className="catalog">
            {strands.map((item, index) => {
              const count = inGrade.filter((row) => row.domain === item).length
              return (
                <button key={item} type="button" className="strand-card" style={{ ['--wash' as string]: DOMAIN_COLOR[item], animationDelay: `${index * 40}ms` }} onClick={() => setDomain(item)}>
                  <SkillDemo domain={item} />
                  <b>{t(locale, `domain.${item}`)}</b>
                  <small>{t(locale, 'practice.count', { n: count })}</small>
                </button>
              )
            })}
          </div>
        </>
      ) : null}
      {!skill && !showStrands ? (
        <div className="catalog">
          {list.length === 0 ? <p className="muted">{t(locale, 'practice.empty')}</p> : null}
          {list.map((item, index) => {
            const stat = stats.get(item.id)
            const pips = stat ? Math.round(stat.recent * 5) : 0
            const count = tray.reduce((sum, row) => row.skillId === item.id ? sum + row.count : sum, 0)
            return (
              <button key={item.id} id={`skill-${item.id}`} type="button" className="skill-card" data-here={count > 0} style={{ ['--wash' as string]: DOMAIN_COLOR[item.domain], animationDelay: `${index * 35}ms` }} onClick={() => openSkill(item.id)}>
                <SkillDemo domain={item.domain} skillId={item.id} />
                <small>{item.code}</small>
                <b>{tx(locale, item.title)}</b>
                <span>{count ? t(locale, 'test.tray', { n: count }) : tx(locale, item.blurb)}</span>
                <span className="pips" aria-hidden="true">
                  {[0, 1, 2, 3, 4].map((pip) => <i key={pip} className={pip < pips ? 'pip on' : 'pip'} />)}
                </span>
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
