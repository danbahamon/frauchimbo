import { t } from '../lib/i18n'
import type { Locale } from '../lib/types'

// One shaded picture. A single row is one continuous bar cut into equal sections; a grid is one sheet.
// Sections colour in from the left and share their edges, so the result reads as one whole being split,
// not as separate tiles. Pass onToggle to make the parts tappable; without it the picture is read-only.
export function ShadeBar({ rows, cols, on, locale, onToggle }: { rows: number; cols: number; on: boolean[]; locale: Locale; onToggle?: (index: number) => void }) {
  const total = rows * cols
  const interactive = onToggle !== undefined
  if (rows === 1) {
    return (
      <div className="frac-bar" data-static={!interactive}>
        {Array.from({ length: total }, (_, index) => {
          const filled = on[index] === true
          return interactive ? (
            <button key={index} type="button" className="frac-part" data-on={filled} aria-pressed={filled} aria-label={t(locale, 'widget.part', { n: index + 1 })} onClick={() => onToggle?.(index)}>
              <span className="frac-fill" aria-hidden />
            </button>
          ) : (
            <span key={index} className="frac-part" data-on={filled}>
              <span className="frac-fill" aria-hidden />
            </span>
          )
        })}
      </div>
    )
  }
  return (
    <div className="grid-shade" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {Array.from({ length: total }, (_, index) => {
        const filled = on[index] === true
        return interactive ? (
          <button key={index} type="button" className={filled ? 'cell on' : 'cell'} aria-pressed={filled} aria-label={t(locale, 'widget.part', { n: index + 1 })} onClick={() => onToggle?.(index)} />
        ) : (
          <div key={index} className={filled ? 'cell on' : 'cell'} />
        )
      })}
    </div>
  )
}
