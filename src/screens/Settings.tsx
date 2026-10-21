import { useRef, useState } from 'react'
import type { Grade, Position } from '../lib/types'
import { t } from '../lib/i18n'
import { downloadBackup, parseBackup } from '../lib/storage'
import { useStore } from '../state'

const GRADES: Grade[] = [3, 4, 5, 6, 7]
const POSITIONS: Position[] = ['review', 'onlevel', 'stretch']

export function Settings() {
  const { locale, data, patchProfile, replaceAll, resetProgress, flash } = useStore()
  const profile = data.profile
  const fileRef = useRef<HTMLInputElement>(null)
  const [confirm, setConfirm] = useState(false)
  if (!profile) return null
  return (
    <div>
      <p className="kicker">{t(locale, 'nav.settings')}</p>
      <h1>{t(locale, 'set.title')}</h1>
      <p className="muted">{t(locale, 'set.local')}</p>
      <label className="fine">{t(locale, 'set.name')}</label>
      <input className="field" value={profile.name} onChange={(event) => patchProfile({ name: event.target.value })} />
      <div className="fine" style={{ marginTop: 12 }}>{t(locale, 'set.grade')}</div>
      <div className="row">
        {GRADES.map((grade) => (
          <button key={grade} type="button" className="chip" data-on={profile.grade === grade} onClick={() => patchProfile({ grade })}>{t(locale, 'grade.n', { n: grade })}</button>
        ))}
      </div>
      <div className="fine">{t(locale, 'set.position')}</div>
      <div className="row">
        {POSITIONS.map((position) => (
          <button key={position} type="button" className="chip" data-on={profile.position === position} onClick={() => patchProfile({ position })}>{t(locale, `pos.${position}`)}</button>
        ))}
      </div>
      <div className="fine">{t(locale, 'set.language')}</div>
      <div className="row">
        {(['en', 'de', 'es'] as const).map((item) => (
          <button key={item} type="button" className="chip" data-on={profile.locale === item} onClick={() => patchProfile({ locale: item })}>{t(locale, `lang.${item}`)}</button>
        ))}
      </div>
      <div className="row" style={{ marginTop: 8 }}>
        <button type="button" className="chip" data-on={profile.sound} onClick={() => patchProfile({ sound: !profile.sound })}>{t(locale, 'set.sound')}: {t(locale, profile.sound ? 'on' : 'off')}</button>
        <button type="button" className="chip" data-on={profile.motion} onClick={() => patchProfile({ motion: !profile.motion })}>{t(locale, 'set.motion')}: {t(locale, profile.motion ? 'on' : 'off')}</button>
        <button type="button" className="chip" data-on={profile.theme === 'dusk'} onClick={() => patchProfile({ theme: profile.theme === 'day' ? 'dusk' : 'day' })}>
          {profile.theme === 'day' ? t(locale, 'set.day') : t(locale, 'set.dusk')}
        </button>
      </div>
      <div className="row" style={{ marginTop: 18 }}>
        <button type="button" className="primary" onClick={() => downloadBackup(data)}>{t(locale, 'set.export')}</button>
        <button type="button" className="ghost" onClick={() => fileRef.current?.click()}>{t(locale, 'set.import')}</button>
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
      </div>
      {confirm ? (
        <div className="card pad" style={{ marginTop: 16 }}>
          <p>{t(locale, 'set.reset.confirm')}</p>
          <div className="row">
            <button type="button" className="ghost" onClick={() => setConfirm(false)}>{t(locale, 'cancel')}</button>
            <button type="button" className="primary" onClick={() => { resetProgress(); setConfirm(false) }}>{t(locale, 'set.reset')}</button>
          </div>
        </div>
      ) : (
        <button type="button" className="text-btn" style={{ marginTop: 16 }} onClick={() => setConfirm(true)}>{t(locale, 'set.reset')}</button>
      )}
    </div>
  )
}
