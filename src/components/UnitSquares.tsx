import { DOMAIN_COLOR } from '../data/skills'
import { t, tx } from '../lib/i18n'
import type { Locale, Skill } from '../lib/types'
import { nextLayer } from '../lib/units'
import { unitPicture } from './UnitArt'

export function UnitSquares({ skill, path, locale, marked, onChoose }: { skill: Skill; path: Record<string, string>; locale: Locale; marked: (value: string) => number; onChoose: (id: string, value: string) => void }) {
  const layer = nextLayer(skill, path)
  if (!layer) return null
  return (
    <div className="catalog">
      {layer.options.map((option, index) => {
        const count = marked(option.value)
        return (
          <button key={option.value} type="button" className="skill-card unit-card unit-square" data-here={count > 0} style={{ ['--wash' as string]: DOMAIN_COLOR[skill.domain], animationDelay: `${Math.min(index, 8) * 30}ms` }} onClick={() => onChoose(layer.id, option.value)}>
            <div className="demo art" aria-hidden="true">{unitPicture(skill.id, option.value)}</div>
            <small>{skill.code}</small>
            <b>{tx(locale, option.label)}</b>
            <span>{count ? t(locale, 'test.tray', { n: count }) : t(locale, 'test.add')}</span>
          </button>
        )
      })}
    </div>
  )
}
