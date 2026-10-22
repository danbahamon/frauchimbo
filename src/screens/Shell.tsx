import { useEffect, useState } from 'react'
import type { Locale, Route } from '../lib/types'
import { t } from '../lib/i18n'
import { useStore } from '../state'
import { Mascot } from '../components/Mascot'
import { Icon } from '../components/Icon'
import { Home } from './Home'
import { Practice } from './Practice'
import { Play } from './Play'
import { Exam } from './Exam'
import { Stats } from './Stats'
import { Settings } from './Settings'
import { Workout } from './Workout'

const NAV = [
  ['home', 'nav.home', 'home'],
  ['practice', 'nav.practice', 'practice'],
  ['workout', 'nav.workout', 'pin'],
  ['test', 'nav.test', 'test'],
  ['stats', 'nav.stats', 'stats'],
] as const

type TabName = 'home' | 'practice' | 'workout' | 'test' | 'stats'

function Nav({ tab, locale, onPick }: { tab: string; locale: Locale; onPick: (name: TabName) => void }) {
  return (
    <>
      {NAV.map(([name, key, icon]) => (
        <button key={name} type="button" className="nav-btn" data-on={tab === name} aria-current={tab === name ? 'page' : undefined} onClick={() => onPick(name)}>
          <Icon name={icon} />
          <span>{t(locale, key)}</span>
        </button>
      ))}
    </>
  )
}

function tabOf(route: Route) {
  if (route.name === 'practice' || route.name === 'play') return 'practice'
  if (route.name === 'workout') return 'workout'
  if (route.name === 'test' || route.name === 'run' || route.name === 'choose' || route.name === 'investigate' || route.name === 'summary' || route.name === 'shared') return 'test'
  if (route.name === 'stats') return 'stats'
  return 'home'
}

export function Shell() {
  const store = useStore()
  const { locale, data, setRoute, notice } = store
  const stored = data.route
  const [settingsOpen, setSettingsOpen] = useState(stored.name === 'settings')
  useEffect(() => {
    if (stored.name === 'settings') setRoute({ name: 'home' })
  }, [stored.name, setRoute])
  const route: Route = stored.name === 'settings' ? { name: 'home' } : stored
  const tab = tabOf(route)
  const go = (name: TabName) => {
    setSettingsOpen(false)
    setRoute({ name })
  }
  const screenKey = route.name === 'play' ? ('queue' in route ? 'play-queue' : `play-${route.skillId}`) : route.name === 'practice' ? `practice-${route.skillId ?? ''}` : route.name
  return (
    <>
      <aside className="rail">
        <button type="button" className="brand" onClick={() => go('home')}>
          <Mascot size={56} />
          <span><strong>Frau <em>Chimbo</em></strong><small>{t(locale, 'app.tagline')}</small></span>
        </button>
        <Nav tab={tab} locale={locale} onPick={go} />
        <button type="button" className="nav-btn" data-on={settingsOpen} onClick={() => setSettingsOpen((open) => !open)}>
          <Icon name="gear" />
          {t(locale, 'nav.settings')}
        </button>
      </aside>
      <main className="stage">
        <div className="sheet">
          <header className="topbar">
            <button type="button" className="brand" onClick={() => go('home')}>
              <Mascot size={42} />
              <span><strong>Frau <em>Chimbo</em></strong><small>{data.profile?.name}</small></span>
            </button>
            <button type="button" className="icon-btn" aria-label={t(locale, 'nav.settings')} onClick={() => setSettingsOpen((open) => !open)}>
              <Icon name="gear" />
            </button>
          </header>
          {notice ? <p className="notice">{notice === 'link' ? t(locale, 'shared.bad') : notice}</p> : null}
          <div className="rise" key={screenKey}>
            {route.name === 'home' ? <Home /> : null}
            {route.name === 'practice' ? <Practice /> : null}
            {route.name === 'workout' ? <Workout /> : null}
            {route.name === 'play' ? <Play /> : null}
            {route.name === 'test' || route.name === 'run' || route.name === 'choose' || route.name === 'investigate' || route.name === 'summary' || route.name === 'shared' ? <Exam /> : null}
            {route.name === 'stats' ? <Stats /> : null}
          </div>
        </div>
        {settingsOpen ? (
          <div className="modal-back">
            <div className="modal settings-panel">
            <div className="settings-top">
              <button type="button" className="settings-back" onClick={() => setSettingsOpen(false)}>
                <Icon name="back" /> {t(locale, 'set.back')}
              </button>
            </div>
              <Settings />
            </div>
          </div>
        ) : null}
      </main>
      <nav className="dock">
        <Nav tab={tab} locale={locale} onPick={go} />
      </nav>
    </>
  )
}
