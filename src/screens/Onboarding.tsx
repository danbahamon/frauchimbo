import { useState } from 'react'
import type { Grade, Position } from '../lib/types'
import { t } from '../lib/i18n'
import { useStore } from '../state'
import { Mascot } from '../components/Mascot'

const GRADES: Grade[] = [3, 4, 5, 6, 7]
const POSITIONS: Position[] = ['review', 'onlevel', 'stretch']

export function Onboarding() {
  const { setProfile, data } = useStore()
  const [step, setStep] = useState(0)
  const [lang, setLang] = useState(data.profile?.locale ?? 'en' as const)
  const [name, setName] = useState('')
  const [grade, setGrade] = useState<Grade>(4)
  const [position, setPosition] = useState<Position>('onlevel')
  const locale = lang

  const finish = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    setProfile({
      name: trimmed,
      grade,
      position,
      locale,
      sound: true,
      motion: true,
      theme: 'day',
      createdAt: Date.now(),
    })
  }

  return (
    <div className="rise">
      <Mascot mood={step === 3 ? 'joy' : 'idle'} size={140} />
      <p className="kicker">Frau Chimbo</p>
      {step === 0 ? (
        <>
          <h1>{t(locale, 'on.lang')}</h1>
          <div className="stack">
            {(['en', 'de', 'es'] as const).map((item) => (
              <button key={item} type="button" className="action" onClick={() => { setLang(item); setStep(1) }}>
                <b>{t(locale, `lang.${item}`)}</b>
              </button>
            ))}
          </div>
        </>
      ) : null}
      {step === 1 ? (
        <>
          <h1>{t(locale, 'on.name')}</h1>
          <input className="field" value={name} placeholder={t(locale, 'on.name.ph')} onChange={(event) => setName(event.target.value)} autoFocus />
          <div className="row" style={{ marginTop: 12 }}>
            <button type="button" className="ghost" onClick={() => setStep(0)}>{t(locale, 'on.back')}</button>
            <button type="button" className="primary" disabled={!name.trim()} onClick={() => setStep(2)}>{t(locale, 'on.next')}</button>
          </div>
        </>
      ) : null}
      {step === 2 ? (
        <>
          <h1>{t(locale, 'on.grade')}</h1>
          <p className="muted">{t(locale, 'on.grade.sub')}</p>
          <div className="row">
            {GRADES.map((item) => (
              <button key={item} type="button" className="chip" data-on={grade === item} onClick={() => setGrade(item)}>{t(locale, 'grade.n', { n: item })}</button>
            ))}
          </div>
          <div className="row" style={{ marginTop: 12 }}>
            <button type="button" className="ghost" onClick={() => setStep(1)}>{t(locale, 'on.back')}</button>
            <button type="button" className="primary" onClick={() => setStep(3)}>{t(locale, 'on.next')}</button>
          </div>
        </>
      ) : null}
      {step === 3 ? (
        <>
          <h1>{t(locale, 'on.position')}</h1>
          <div className="stack">
            {POSITIONS.map((item) => (
              <button key={item} type="button" className="action" data-on={position === item} onClick={() => setPosition(item)} style={position === item ? { outline: '3px solid var(--teal)' } : undefined}>
                <span>
                  <b>{t(locale, `pos.${item}`)}</b>
                  <span>{t(locale, `pos.${item}.sub`)}</span>
                </span>
              </button>
            ))}
          </div>
          <div className="row" style={{ marginTop: 12 }}>
            <button type="button" className="ghost" onClick={() => setStep(2)}>{t(locale, 'on.back')}</button>
            <button type="button" className="primary" onClick={finish}>{t(locale, 'on.start')}</button>
          </div>
        </>
      ) : null}
    </div>
  )
}
