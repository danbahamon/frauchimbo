export function Mascot({ mood = 'idle', size = 72 }: { mood?: 'idle' | 'joy' | 'think'; size?: number }) {
  return (
    <svg className="mascot" width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="24" cy="24" r="20" fill="#ffe7a3" stroke="#1c1712" strokeWidth="2.4" />
      <circle cx="17" cy="20" r="2.1" fill="#1c1712" />
      <circle cx="31" cy="20" r="2.1" fill="#1c1712" />
      {mood === 'joy' ? <path d="M15 27c2.2 5 7.2 7 13 4" fill="none" stroke="#1c1712" strokeWidth="2.2" strokeLinecap="round" /> : null}
      {mood === 'think' ? <path d="M16 30h10" fill="none" stroke="#1c1712" strokeWidth="2.2" strokeLinecap="round" /> : null}
      {mood === 'idle' ? <path d="M16 29c2.4 3.2 8 3.2 11 0" fill="none" stroke="#1c1712" strokeWidth="2.2" strokeLinecap="round" /> : null}
    </svg>
  )
}
