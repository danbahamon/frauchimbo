import { useRef, useState } from 'react'
import type { Grade, Position } from '../lib/types'
import type { IconName } from '../components/Icon'
import { Icon } from '../components/Icon'
import { t } from '../lib/i18n'
import { useInstall } from '../lib/install'
import { downloadBackup, parseBackup } from '../lib/storage'
import { useStore } from '../state'

const GRADES: Grade[] = [3, 4, 5, 6, 7]
const POSITIONS: Position[] = ['review', 'onlevel', 'stretch']
const LOCALES = ['en', 'de', 'es'] as const

function Toggle({ on, label, hint, icon, onToggle }: { on: boolean; label: string; hint: string; icon: IconName; onToggle: () => void }) {
  return (
    <div className="set-line">
      <span className="set-ico"><Icon name={icon} /></span>
      <span className="set-copy">
        <b>{label}</b>
        <small>{hint}</small>
      </span>
      <button type="button" className="switch" role="switch" aria-checked={on} aria-label={label} data-on={on} onClick={onToggle} />
    </div>
  )
}

export function Settings() {
  const { locale, data, patchProfile, replaceAll, resetProgress, flash } = useStore()
  const profile = data.profile
  const fileRef = useRef<HTMLInputElement>(null)
  const [confirm, setConfirm] = useState(false)
  const { installed, canPrompt, ios, help, install } = useInstall()
  if (!profile) return null
  const installSteps = ios
    ? ['set.install.ios1', 'set.install.ios2', 'set.install.ios3']
    : ['set.install.menu1', 'set.install.menu2']
  return (
    <div className="settings">
      <div>
        <p className="kicker">{t(locale, 'nav.settings')}</p>
        <h1>{t(locale, 'set.title')}</h1>
        <p className="muted lead">{t(locale, 'set.local')}</p>
      </div>

      {installed ? null : (
        <section className="set-install" aria-labelledby="install-title">
          <span className="set-ico"><Icon name="device" size={22} /></span>
          <div>
            <h2 id="install-title">{t(locale, 'set.install.title')}</h2>
            <p>{t(locale, 'set.install.body')}</p>
          </div>
          <button type="button" className="primary wide" onClick={() => void install()} aria-expanded={canPrompt ? undefined : help}>
            <Icon name="download" />
            {t(locale, ios && !canPrompt ? 'set.install.iosBtn' : 'set.install.action')}
          </button>
          {help && !canPrompt ? (
            <div className="set-help">
              <b>{t(locale, 'set.install.help')}</b>
              <ol>
                {installSteps.map((key) => <li key={key}>{t(locale, key)}</li>)}
              </ol>
              <p>{t(locale, 'set.install.already')}</p>
            </div>
          ) : null}
        </section>
      )}

      <section className="set-section">
        <h2>{t(locale, 'set.group.learner')}</h2>
        <div className="set-card">
          <label className="set-field" htmlFor="studio-name">
            <span className="set-label"><span className="set-ico"><Icon name="user" /></span>{t(locale, 'set.name')}</span>
            <input id="studio-name" className="field" autoComplete="name" value={profile.name} onChange={(event) => patchProfile({ name: event.target.value })} />
          </label>
          <div className="set-field">
            <div className="set-label" id="grade-label">{t(locale, 'set.grade')}</div>
            <div className="grade-grid" role="group" aria-labelledby="grade-label">
              {GRADES.map((grade) => (
                <button key={grade} type="button" aria-pressed={profile.grade === grade} aria-label={t(locale, 'grade.n', { n: grade })} data-on={profile.grade === grade} onClick={() => patchProfile({ grade })}>
                  {grade}
                </button>
              ))}
            </div>
            <p className="fine">{t(locale, 'on.grade.sub')}</p>
          </div>
          <div className="set-field">
            <div className="set-label" id="position-label">{t(locale, 'set.position')}</div>
            <div className="set-choices" role="group" aria-labelledby="position-label">
              {POSITIONS.map((position) => (
                <button key={position} type="button" className="set-choice" aria-pressed={profile.position === position} data-on={profile.position === position} onClick={() => patchProfile({ position })}>
                  <span className="set-choice-top">
                    <b>{t(locale, `pos.${position}`)}</b>
                    {profile.position === position ? <Icon name="check" size={16} /> : <span className="set-choice-gap" />}
                  </span>
                  <small>{t(locale, `pos.${position}.sub`)}</small>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="set-section">
        <h2>{t(locale, 'set.group.prefs')}</h2>
        <div className="set-card">
          <div className="set-line stack">
            <span className="set-ico"><Icon name="globe" /></span>
            <div className="set-copy">
              <b id="lang-label">{t(locale, 'set.language')}</b>
              <div className="segment" role="group" aria-labelledby="lang-label">
                {LOCALES.map((item) => (
                  <button key={item} type="button" aria-pressed={profile.locale === item} data-on={profile.locale === item} onClick={() => patchProfile({ locale: item })}>
                    {t(locale, `lang.${item}`)}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <Toggle on={profile.sound} label={t(locale, 'set.sound')} hint={t(locale, 'set.sound.sub')} icon="volume" onToggle={() => patchProfile({ sound: !profile.sound })} />
          <Toggle on={profile.motion} label={t(locale, 'set.motion')} hint={t(locale, 'set.motion.sub')} icon="motion" onToggle={() => patchProfile({ motion: !profile.motion })} />
          <div className="set-line stack">
            <span className="set-ico"><Icon name={profile.theme === 'day' ? 'sun' : 'moon'} /></span>
            <div className="set-copy">
              <b id="theme-label">{t(locale, 'set.theme')}</b>
              <div className="segment" role="group" aria-labelledby="theme-label">
                <button type="button" aria-pressed={profile.theme === 'day'} data-on={profile.theme === 'day'} onClick={() => patchProfile({ theme: 'day' })}>
                  <Icon name="sun" size={16} /> {t(locale, 'set.day')}
                </button>
                <button type="button" aria-pressed={profile.theme === 'dusk'} data-on={profile.theme === 'dusk'} onClick={() => patchProfile({ theme: 'dusk' })}>
                  <Icon name="moon" size={16} /> {t(locale, 'set.dusk')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="set-section">
        <h2>{t(locale, 'set.group.data')}</h2>
        <div className="set-card">
          <button type="button" className="set-line" onClick={() => downloadBackup(data)}>
            <span className="set-ico"><Icon name="download" /></span>
            <span className="set-copy">
              <b>{t(locale, 'set.export')}</b>
              <small>{t(locale, 'set.export.sub')}</small>
            </span>
            <Icon name="forward" />
          </button>
          <button type="button" className="set-line" onClick={() => fileRef.current?.click()}>
            <span className="set-ico"><Icon name="upload" /></span>
            <span className="set-copy">
              <b>{t(locale, 'set.import')}</b>
              <small>{t(locale, 'set.import.sub')}</small>
            </span>
            <Icon name="forward" />
          </button>
          <input
            ref={fileRef}
            hidden
            type="file"
            accept="application/json"
            onChange={(event) => {
              const file = event.target.files?.[0]
              event.target.value = ''
              if (!file) return
              void file.text().then((text) => {
                const next = parseBackup(text)
                if (!next) {
                  flash(t(locale, 'set.import.bad'))
                  return
                }
                replaceAll(next)
                flash(t(locale, 'set.import.ok'))
              })
            }}
          />
          {confirm ? (
            <div className="set-confirm">
              <p>{t(locale, 'set.reset.confirm')}</p>
              <div className="row">
                <button type="button" className="ghost" onClick={() => setConfirm(false)}>{t(locale, 'cancel')}</button>
                <button type="button" className="primary warm" onClick={() => { resetProgress(); setConfirm(false) }}>{t(locale, 'set.reset')}</button>
              </div>
            </div>
          ) : (
            <button type="button" className="set-line danger" onClick={() => setConfirm(true)}>
              <span className="set-ico"><Icon name="trash" /></span>
              <span className="set-copy">
                <b>{t(locale, 'set.reset')}</b>
                <small>{t(locale, 'set.reset.sub')}</small>
              </span>
            </button>
          )}
        </div>
      </section>
    </div>
  )
}
