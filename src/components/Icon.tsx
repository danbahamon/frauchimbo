export type IconName = 'home' | 'practice' | 'test' | 'stats' | 'gear' | 'back' | 'spark' | 'print' | 'share' | 'check' | 'forward' | 'pin'

export function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ flex: 'none' }}>
      {name === 'home' ? <path {...common} d="M4 11.5 12 4l8 7.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z" /> : null}
      {name === 'practice' ? <path {...common} d="M5 19V5h9l5 5v9H5zM14 5v5h5M8 13h8M8 16h5" /> : null}
      {name === 'test' ? <path {...common} d="M8 4h8v3a4 4 0 0 1-8 0zM8 6H6v14h12V6h-2M9 13l2 2 4-4" /> : null}
      {name === 'stats' ? <path {...common} d="M5 19V10M12 19V5M19 19v-7" /> : null}
      {name === 'gear' ? <path {...common} d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4zM12 3.5v2.2M12 18.3V20.5M4.8 6.6l1.6 1.6M17.6 15.8l1.6 1.6M3.5 12h2.2M18.3 12h2.2M4.8 17.4l1.6-1.6M17.6 8.2l1.6-1.6" /> : null}
      {name === 'back' ? <path {...common} d="M15 5 8 12l7 7" /> : null}
      {name === 'forward' ? <path {...common} d="M9 5l7 7-7 7" /> : null}
      {name === 'spark' ? <path {...common} d="M12 3.5 13.6 9 19 10.5 13.6 12 12 17.5 10.4 12 5 10.5 10.4 9z" /> : null}
      {name === 'print' ? <path {...common} d="M7 9V4h10v5M6 9h12a2 2 0 0 1 2 2v5h-4v-3H8v3H4v-5a2 2 0 0 1 2-2zM8 17h8v4H8z" /> : null}
      {name === 'share' ? <path {...common} d="M12 3.5v11.5M7.5 8 12 3.5 16.5 8M5 13.5V19a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 19v-5.5" /> : null}
      {name === 'check' ? <path {...common} d="M5 12.5 10 17.5 19 7" /> : null}
      {name === 'pin' ? <path {...common} d="M9 3.5h6l-1 6h3l-5 5.2V21M12 14.7V21" /> : null}
    </svg>
  )
}
