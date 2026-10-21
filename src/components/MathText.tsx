import type { Locale, Localized, MathPart } from '../lib/types'
import { tx } from '../lib/i18n'

export function MathText({ text }: { text: string }) {
  const parts = text.split(/(\[\[[^\]]+\]\])/g)
  return (
    <span className="mathtext">
      {parts.map((part, index) => {
        const match = part.match(/^\[\[(-?\d+)\s*\/\s*(\d+)\]\]$/)
        if (!match) return <span key={index}>{part}</span>
        return (
          <span className="frac" key={index}>
            <b>{match[1]}</b>
            <i>{match[2]}</i>
          </span>
        )
      })}
    </span>
  )
}

export function Tx({ locale, value }: { locale: Locale; value?: Localized }) {
  return <MathText text={tx(locale, value)} />
}

export function Expr({ parts }: { parts: MathPart[] }) {
  return (
    <div className="expr">
      {parts.map((part, index) => {
        if (part.t === 'frac') {
          return (
            <span className="frac" key={index}>
              <b>{part.n}</b>
              <i>{part.d}</i>
            </span>
          )
        }
        return <span key={index}>{part.v}</span>
      })}
    </div>
  )
}
