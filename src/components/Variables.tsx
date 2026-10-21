import { defaultKnobs } from '../data/skills'
import { t, tx } from '../lib/i18n'
import type { KnobValues, Locale, Skill } from '../lib/types'

// The things a problem type can change: ranges, switches, and choices, each with a short hint.
// A row that does nothing for the chosen problem type stays hidden, so only real choices show.
export function Variables({ skill, values, locale, onChange }: { skill: Skill; values: KnobValues; locale: Locale; onChange: (next: KnobValues) => void }) {
  const visible = skill.knobs.filter((knob) => {
    if (knob.kind === 'select' && knob.options.length < 2) return false
    if (!knob.when) return true
    return knob.when.in.includes(String(values[knob.when.id]))
  })
  return (
    <div className="variables">
      <p className="fine variables-sub">{t(locale, 'vars.sub')}</p>
      {visible.length === 0 ? <p className="muted">{t(locale, 'vars.none')}</p> : null}
      {visible.map((knob) => {
        const label = tx(locale, knob.label)
        const hint = tx(locale, knob.hint)
        if (knob.kind === 'range') {
          const value = Number(values[knob.id] ?? knob.min)
          return (
            <div className="variable" key={knob.id}>
              <div className="variable-head">
                <span>{label}</span>
                <b className="variable-value">{value}</b>
              </div>
              <input
                type="range"
                min={knob.min}
                max={knob.max}
                step={knob.step}
                value={value}
                aria-label={label}
                onChange={(event) => onChange({ ...values, [knob.id]: Number(event.target.value) })}
              />
              <div className="variable-foot">
                <small className="fine">{hint}</small>
                <small className="fine">{knob.min}–{knob.max}</small>
              </div>
            </div>
          )
        }
        if (knob.kind === 'toggle') {
          const on = values[knob.id] === true
          return (
            <div className="variable variable-switch" key={knob.id}>
              <div className="variable-head">
                <span>{label}</span>
                <button type="button" role="switch" aria-checked={on} aria-label={label} className="switch" data-on={on} onClick={() => onChange({ ...values, [knob.id]: !on })}>
                  <i />
                </button>
              </div>
              <small className="fine">{hint}</small>
            </div>
          )
        }
        const current = String(values[knob.id] ?? knob.options[0]?.value ?? '')
        return (
          <div className="variable" key={knob.id}>
            <div className="variable-head">
              <span>{label}</span>
            </div>
            <div className="segment wrap" role="radiogroup" aria-label={label}>
              {knob.options.map((option) => (
                <button key={option.value} type="button" role="radio" aria-checked={current === option.value} data-on={current === option.value} onClick={() => onChange({ ...values, [knob.id]: option.value })}>
                  {tx(locale, option.label)}
                </button>
              ))}
            </div>
            <small className="fine">{hint}</small>
          </div>
        )
      })}
      <div className="row">
        <button type="button" className="text-btn" onClick={() => onChange(defaultKnobs(skill, 3))}>{t(locale, 'vars.reset')}</button>
      </div>
    </div>
  )
}
