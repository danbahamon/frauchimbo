import { DOMAIN_COLOR, getSkill } from '../data/skills'
import { suggest } from '../engine/insights'
import { t, tx } from '../lib/i18n'
import { levelKey } from '../lib/levels'
import { practiceStreak } from '../lib/math'
import { useStore } from '../state'
import { Icon } from '../components/Icon'
import { Mascot } from '../components/Mascot'

function greetKey() {
  const hour = new Date().getHours()
  if (hour < 12) return 'greet.morning'
  if (hour < 17) return 'greet.afternoon'
  return 'greet.evening'
}

export function Home() {
  const { locale, data, setRoute } = useStore()
  const profile = data.profile
  if (!profile) return null
  const streak = practiceStreak(data.attempts.map((item) => item.at))
  const ideas = suggest(data.attempts, profile.grade)
  const lead = ideas[0]
  const skill = lead ? getSkill(lead.skillId) : undefined
  return (
    <div>
      <section className="hero-card">
        <div className="hero-mascot"><Mascot mood={streak ? 'joy' : 'idle'} size={76} /></div>
        <div className="hero-copy">
          <p className="kicker">{t(locale, 'home.standards')}</p>
          <h1>{t(locale, greetKey())}, {profile.name}.</h1>
          <p className="muted">{streak === 1 ? t(locale, 'home.streak.one') : streak ? t(locale, 'home.streak', { n: streak }) : t(locale, 'home.streak.zero')}</p>
        </div>
      </section>
      <div className="hero-actions" style={{ marginTop: 16 }}>
        <button type="button" className="action" onClick={() => setRoute({ name: 'practice' })}>
          <Icon name="practice" size={28} />
          <span><b>{t(locale, 'home.practice')}</b><span>{t(locale, 'home.practice.sub')}</span></span>
        </button>
        <button type="button" className="action" onClick={() => setRoute({ name: 'workout' })}>
          <Icon name="pin" size={28} />
          <span><b>{t(locale, 'home.workout')}</b><span>{t(locale, 'home.workout.sub')}</span></span>
        </button>
        <button type="button" className="action" onClick={() => setRoute({ name: 'test' })}>
          <Icon name="test" size={28} />
          <span><b>{t(locale, 'home.test')}</b><span>{t(locale, 'home.test.sub')}</span></span>
        </button>
        <button type="button" className="action" onClick={() => setRoute({ name: 'stats' })}>
          <Icon name="stats" size={28} />
          <span><b>{t(locale, 'home.stats')}</b><span>{t(locale, 'home.stats.sub')}</span></span>
        </button>
      </div>
      {data.active ? (
        <button type="button" className="text-btn" style={{ marginTop: 14, width: '100%' }} onClick={() => setRoute({ name: 'run' })}>
          {t(locale, 'home.resume')} · {data.active.blueprint.title ? tx(locale, data.active.blueprint.title) : t(locale, 'test.q', { n: data.active.index + 1 })}
        </button>
      ) : null}
      {skill && lead ? (
        <button
          type="button"
          className="skill"
          style={{ marginTop: 16 }}
          onClick={() => setRoute({ name: 'play', skillId: skill.id, auto: true, difficulty: lead.difficulty })}
        >
          <i className="domain" style={{ background: DOMAIN_COLOR[skill.domain] }} />
          <span>
            <small className="kicker">{t(locale, 'home.suggest')}</small>
            <b>{tx(locale, skill.title)}</b>
            <small>{t(locale, `reason.${lead.reason}`)} · {t(locale, levelKey(lead.difficulty))}</small>
          </span>
        </button>
      ) : null}
    </div>
  )
}
