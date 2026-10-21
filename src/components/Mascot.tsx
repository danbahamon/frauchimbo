const INK = '#1c1712'

// The shell spiral, traced from the centre of the shell outward.
const SPIRAL = 'M17.9 22.0 L18.0 22.1 L18.1 22.3 L18.1 22.4 L18.1 22.6 L18.1 22.8 L18.1 23.0 L18.1 23.2 L18.0 23.4 L17.9 23.5 L17.7 23.7 L17.5 23.9 L17.3 24.0 L17.1 24.2 L16.8 24.2 L16.5 24.3 L16.2 24.3 L15.9 24.3 L15.6 24.3 L15.3 24.1 L15.0 24.0 L14.7 23.8 L14.4 23.6 L14.2 23.3 L13.9 23.0 L13.7 22.6 L13.6 22.3 L13.5 21.9 L13.4 21.4 L13.4 21.0 L13.5 20.5 L13.6 20.1 L13.8 19.7 L14.0 19.2 L14.3 18.8 L14.6 18.4 L15.0 18.1 L15.5 17.8 L15.9 17.6 L16.5 17.4 L17.0 17.2 L17.6 17.2 L18.2 17.2 L18.7 17.3 L19.3 17.4 L19.9 17.6 L20.5 17.9 L21.0 18.3 L21.5 18.7 L21.9 19.2 L22.3 19.8 L22.6 20.4 L22.9 21.1 L23.0 21.8 L23.1 22.5 L23.1 23.2 L23.0 23.9 L22.8 24.7 L22.5 25.4 L22.2 26.1 L21.7 26.7 L21.2 27.3 L20.6 27.9 L19.9 28.3 L19.2 28.7'

// A simple snail: a coral shell with a spiral, a yellow body, and a round head on two eye stalks.
// The face is the only part that changes with the mood. Decorative, so it is hidden from screen readers.
export function Mascot({ mood = 'idle', size = 72 }: { mood?: 'idle' | 'joy' | 'think'; size?: number }) {
  const pupil = mood === 'think' ? { dx: -0.9, dy: -0.9 } : { dx: 0, dy: 0 }
  const pupilR = mood === 'joy' ? 1.6 : 1.3
  return (
    <svg className="mascot" width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" data-mood={mood}>
      <ellipse cx="24" cy="41.6" rx="17" ry="1.9" fill={INK} opacity="0.13" />
      <rect x="5" y="30" width="34" height="8.6" rx="4.3" fill="#ffe7a3" stroke={INK} strokeWidth="2.2" />
      <circle cx="17" cy="22" r="11.2" fill="#e25b45" stroke={INK} strokeWidth="2.2" />
      <path d={SPIRAL} fill="none" stroke="#fff3e0" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="36" cy="31" r="6.6" fill="#ffe7a3" stroke={INK} strokeWidth="2.2" />
      <path d="M33.4 25.6 32.4 14.2M38.6 25.6 40.6 14.2" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" />
      <g className="snail-eye">
        <circle cx="32.4" cy="14.2" r="3" fill="#fff" stroke={INK} strokeWidth="1.8" />
        <circle cx={32.6 + pupil.dx} cy={14.4 + pupil.dy} r={pupilR} fill={INK} />
      </g>
      <g className="snail-eye">
        <circle cx="40.6" cy="14.2" r="3" fill="#fff" stroke={INK} strokeWidth="1.8" />
        <circle cx={40.8 + pupil.dx} cy={14.4 + pupil.dy} r={pupilR} fill={INK} />
      </g>
      <circle cx="32.6" cy="34.4" r="1.5" fill="#f28c78" opacity="0.8" />
      <circle cx="39.4" cy="34.4" r="1.5" fill="#f28c78" opacity="0.8" />
      {mood === 'joy' ? (
        <>
          <path d="M32.6 32.8h6.8c-.3 2.7-2.2 4.3-3.4 4.3s-3.1-1.6-3.4-4.3z" fill={INK} />
          <path d="M34.7 36.3c.7-.7 2-.7 2.6 0-.6.6-1.9.6-2.6 0z" fill="#e25b45" />
        </>
      ) : null}
      {mood === 'think' ? (
        <>
          <path d="M34.2 34.2h3.8" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" />
          <circle cx="44.2" cy="7.2" r="1" fill={INK} opacity="0.45" />
          <circle cx="46.6" cy="4.2" r="1.5" fill={INK} opacity="0.45" />
        </>
      ) : null}
      {mood === 'idle' ? <path d="M33.2 33.6c1.5 1.9 4.1 1.9 5.6 0" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" /> : null}
    </svg>
  )
}
