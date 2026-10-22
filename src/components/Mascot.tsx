import type { CSSProperties } from 'react'
import idleBody from '../assets/mascot/idle-body.png'
import idleAnt0 from '../assets/mascot/idle-ant0.png'
import idleAnt1 from '../assets/mascot/idle-ant1.png'
import joyBody from '../assets/mascot/joy-body.png'
import joyAnt0 from '../assets/mascot/joy-ant0.png'
import joyAnt1 from '../assets/mascot/joy-ant1.png'
import thinkBody from '../assets/mascot/think-body.png'
import thinkAnt0 from '../assets/mascot/think-ant0.png'
import thinkAnt1 from '../assets/mascot/think-ant1.png'

export type MascotMood = 'idle' | 'joy' | 'think'

// Pivot points are fractions of each pose's square canvas, at the base of an eyestalk.
const POSES: Record<MascotMood, { body: string; antennae: { src: string; x: number; y: number }[] }> = {
  idle: {
    body: idleBody,
    antennae: [
      { src: idleAnt0, x: 0.5641, y: 0.2783 },
      { src: idleAnt1, x: 0.6857, y: 0.2783 },
    ],
  },
  joy: {
    body: joyBody,
    antennae: [
      { src: joyAnt0, x: 0.4557, y: 0.3293 },
      { src: joyAnt1, x: 0.5836, y: 0.3293 },
    ],
  },
  think: {
    body: thinkBody,
    antennae: [
      { src: thinkAnt0, x: 0.4657, y: 0.3143 },
      { src: thinkAnt1, x: 0.6285, y: 0.3143 },
    ],
  },
}

// Eyes on the idle pose, as percentages of the square canvas. The lids close over them.
const IDLE_EYES = [
  { x: 51.7, y: 37.9, w: 16.7, h: 12.6 },
  { x: 76.1, y: 32.3, w: 8.8, h: 12.7 },
]

// The teal-shelled snail. The face swaps with the mood; the eyestalks and body keep moving.
export function Mascot({ mood = 'idle', size = 72 }: { mood?: MascotMood; size?: number }) {
  const pose = POSES[mood]
  return (
    <span className="mascot" data-mood={mood} style={{ '--mascot': `${size}px` } as CSSProperties} aria-hidden="true">
      <span className="snail-pop" key={mood}>
        <span className="snail-rig">
          <img className="snail-part" src={pose.body} alt="" draggable={false} />
          {mood === 'idle'
            ? IDLE_EYES.map((eye) => (
                <span
                  key={`${eye.x}-${eye.y}`}
                  className="snail-lid"
                  style={{ left: `${eye.x}%`, top: `${eye.y}%`, width: `${eye.w}%`, height: `${eye.h}%` }}
                />
              ))
            : null}
          {pose.antennae.map((stalk, index) => (
            <img
              key={stalk.src}
              className={index === 0 ? 'snail-part snail-ant' : 'snail-part snail-ant alt'}
              src={stalk.src}
              alt=""
              draggable={false}
              style={{ transformOrigin: `${stalk.x * 100}% ${stalk.y * 100}%` }}
            />
          ))}
        </span>
      </span>
    </span>
  )
}
