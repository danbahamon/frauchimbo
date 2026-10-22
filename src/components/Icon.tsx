export type IconName =
  | 'home'
  | 'practice'
  | 'test'
  | 'stats'
  | 'gear'
  | 'back'
  | 'spark'
  | 'print'
  | 'share'
  | 'check'
  | 'forward'
  | 'pin'
  | 'user'
  | 'globe'
  | 'volume'
  | 'motion'
  | 'sun'
  | 'moon'
  | 'download'
  | 'upload'
  | 'trash'
  | 'device'

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
      {name === 'user' ? (
        <>
          <circle {...common} cx="12" cy="8" r="3.2" />
          <path {...common} d="M5.2 19.2a6.8 6.8 0 0 1 13.6 0" />
        </>
      ) : null}
      {name === 'globe' ? (
        <>
          <circle {...common} cx="12" cy="12" r="8" />
          <path {...common} d="M4 12h16M12 4c2.4 2.2 3.6 5 3.6 8s-1.2 5.8-3.6 8c-2.4-2.2-3.6-5-3.6-8s1.2-5.8 3.6-8z" />
        </>
      ) : null}
      {name === 'volume' ? <path {...common} d="M4.5 9.5h2.8L11 6.2v11.6L7.3 14.5H4.5zM14.5 9.2a3.8 3.8 0 0 1 0 5.6M16.8 7a6.4 6.4 0 0 1 0 10" /> : null}
      {name === 'motion' ? <path {...common} d="M3.5 9c2.4-3.2 4.6-3.2 7 0s4.6 3.2 7 0M3.5 15c2.4-3.2 4.6-3.2 7 0s4.6 3.2 7 0" /> : null}
      {name === 'sun' ? (
        <>
          <circle {...common} cx="12" cy="12" r="3.4" />
          <path {...common} d="M12 3.2v2.2M12 18.6v2.2M3.2 12h2.2M18.6 12h2.2M5.8 5.8l1.6 1.6M16.6 16.6l1.6 1.6M18.2 5.8l-1.6 1.6M7.4 16.6l-1.6 1.6" />
        </>
      ) : null}
      {name === 'moon' ? <path {...common} d="M15.6 14.8A6.2 6.2 0 0 1 9.2 5.2 6.5 6.5 0 1 0 15.6 14.8z" /> : null}
      {name === 'download' ? <path {...common} d="M12 4v9.5M8.2 10.2 12 14l3.8-3.8M5 19h14" /> : null}
      {name === 'upload' ? <path {...common} d="M12 15.5V6M8.2 9.2 12 5.5l3.8 3.7M5 19h14" /> : null}
      {name === 'trash' ? <path {...common} d="M5 7.5h14M9.5 7.5V5.2h5v2.3M7.2 7.5l.8 12h8l.8-12" /> : null}
      {name === 'device' ? (
        <>
          <rect {...common} x="2.5" y="4" width="13" height="9" rx="1.6" />
          <path {...common} d="M6 16.5h6M9 13v3.5" />
          <rect {...common} x="16.6" y="7.5" width="5" height="9.5" rx="1.2" />
        </>
      ) : null}
    </svg>
  )
}
