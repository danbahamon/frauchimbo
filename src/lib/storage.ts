import type { ActiveTest, Attempt, Profile, Route, TestRecord } from './types'

const KEY = 'frauchimbo.v1'

export interface Persisted {
  v: 1
  profile: Profile | null
  attempts: Attempt[]
  tests: TestRecord[]
  active: ActiveTest | null
  route: Route
}

export const emptyState = (): Persisted => ({
  v: 1,
  profile: null,
  attempts: [],
  tests: [],
  active: null,
  route: { name: 'home' },
})

export function loadState(): Persisted {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return emptyState()
    const data = JSON.parse(raw) as Persisted
    if (!data || data.v !== 1) return emptyState()
    return {
      ...emptyState(),
      ...data,
      attempts: Array.isArray(data.attempts) ? data.attempts.slice(-2000) : [],
      tests: Array.isArray(data.tests) ? data.tests.slice(-12) : [],
    }
  } catch {
    return emptyState()
  }
}

export function saveState(state: Persisted) {
  try {
    const next: Persisted = {
      ...state,
      attempts: state.attempts.slice(-2000),
      tests: state.tests.slice(-12),
    }
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    /* private mode or full storage */
  }
}

export function downloadBackup(state: Persisted) {
  const blob = new Blob([JSON.stringify({ ...state, exportedAt: Date.now() }, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'frauchimbo-backup.json'
  link.click()
  URL.revokeObjectURL(url)
}

export function parseBackup(text: string): Persisted | null {
  try {
    const data = JSON.parse(text) as Persisted
    if (!data || data.v !== 1) return null
    if (data.profile && typeof data.profile.name !== 'string') return null
    if (!Array.isArray(data.attempts) || !Array.isArray(data.tests)) return null
    return {
      v: 1,
      profile: data.profile ?? null,
      attempts: data.attempts.slice(-2000),
      tests: data.tests.slice(-12),
      active: data.active ?? null,
      route: data.route?.name ? data.route : { name: 'home' },
    }
  } catch {
    return null
  }
}
