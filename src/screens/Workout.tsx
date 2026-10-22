import { DOMAIN_COLOR, getSkill } from '../data/skills'
import { t, tx } from '../lib/i18n'
import { positionDifficulty } from '../lib/math'
import { heatFor, knobsForPath, identityPath, unitKey, unitTitle, unitVariant } from '../lib/units'
import { useStore } from '../state'
import { Icon } from '../components/Icon'

export function Workout() {
  const { locale, data, setRoute, togglePin } = useStore()
  const profile = data.profile
  const pins = data.pins ?? []
  const difficulty = profile ? positionDifficulty(profile.position) : 3
  return (
    <div>
      <p className="kicker">{t(locale, 'nav.workout')}</p>
      <h1>{t(locale, 'work.title')}</h1>
      <p className="muted">{t(locale, 'work.sub')}</p>
      <p className="fine">{t(locale, 'work.legend')}</p>
      {pins.length === 0 ? <p className="muted" style={{ marginTop: 16 }}>{t(locale, 'work.empty')}</p> : null}
      <div className="catalog">
        {pins.map((pin) => {
          const skill = getSkill(pin.skillId)
          if (!skill) return null
          const title = unitTitle(skill, pin.knobs)
          const heat = heatFor(data.attempts, pin.skillId, unitVariant(skill, pin.knobs))
          const key = unitKey(pin.skillId, pin.knobs, skill)
          return (
            <article key={key} className="skill-card unit-card" data-heat={heat.heat} style={{ ['--wash' as string]: DOMAIN_COLOR[skill.domain] }}>
              <small>{skill.code}</small>
              <b>{title ? tx(locale, title) : tx(locale, skill.title)}</b>
              <span>{heat.rate == null ? t(locale, 'work.fresh') : t(locale, 'work.rate', { n: Math.round(heat.rate * 100), m: heat.seen })}</span>
              <div className="row">
                <button
                  type="button"
                  className="primary"
                  onClick={() => {
                    const knobs = knobsForPath(skill, difficulty, identityPath(skill, pin.knobs))
                    setRoute({ name: 'play', skillId: skill.id, auto: true, difficulty, knobs })
                  }}
                >
                  <Icon name="forward" /> {t(locale, 'play.begin')}
                </button>
                <button type="button" className="text-btn" onClick={() => togglePin(pin)}>{t(locale, 'work.unpin')}</button>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
