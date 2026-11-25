import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { t } from '../lib/i18n'
import type { Locale } from '../lib/types'

export function Scratchpad({ locale, resetKey }: { locale: Locale; resetKey: string }) {
  const [open, setOpen] = useState(false)
  const [hasInk, setHasInk] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const drawing = useRef(false)
  const last = useRef<{ x: number; y: number } | null>(null)

  const clear = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasInk(false)
  }

  useEffect(() => {
    clear()
  }, [resetKey])

  useEffect(() => {
    if (!open) return
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const rect = canvas.getBoundingClientRect()
    const w = Math.max(260, Math.round(rect.width))
    const h = Math.max(150, Math.round(rect.height))
    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr
      canvas.height = h * dpr
      const ctx = canvas.getContext('2d')
      if (ctx) ctx.scale(dpr, dpr)
    }
  }, [open])

  const pointOf = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    return { x: event.clientX - rect.left, y: event.clientY - rect.top }
  }

  const down = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    drawing.current = true
    last.current = pointOf(event)
  }

  const move = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx || !last.current) return
    const next = pointOf(event)
    const ink = getComputedStyle(canvas).color || '#1c1712'
    ctx.strokeStyle = ink
    ctx.lineWidth = 2.4
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    ctx.moveTo(last.current.x, last.current.y)
    ctx.lineTo(next.x, next.y)
    ctx.stroke()
    last.current = next
    if (!hasInk) setHasInk(true)
  }

  const up = () => {
    drawing.current = false
    last.current = null
  }

  return (
    <div className="scratch-wrap">
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <button type="button" className="text-btn scratch-toggle" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
          ✎ {t(locale, open ? 'scratch.close' : 'scratch.open')}
        </button>
        {open && hasInk ? (
          <button type="button" className="text-btn" onClick={clear}>{t(locale, 'scratch.clear')}</button>
        ) : null}
      </div>
      {open ? (
        <div className="scratch-pad">
          {!hasInk ? <span className="scratch-hint">{t(locale, 'scratch.hint')}</span> : null}
          <canvas
            ref={canvasRef}
            className="scratch-canvas"
            onPointerDown={down}
            onPointerMove={move}
            onPointerUp={up}
            onPointerCancel={up}
          />
        </div>
      ) : null}
    </div>
  )
}
