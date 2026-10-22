import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { ActiveTest, Attempt, Blueprint, Locale, Pin, Profile, Route, TestRecord } from './lib/types'
import { getSkill } from './data/skills'
import { identityKnobs, unitKey } from './lib/units'
import { decodeShare } from './lib/i18n'
import { emptyState, loadState, saveState, type Persisted } from './lib/storage'
import { uid } from './lib/math'

interface PrintJob {
  id: string
  kind: 'blank' | 'teacher' | 'stats'
  test: TestRecord | null
}

interface Store {
  data: Persisted
  locale: Locale
  notice: string | null
  printJob: PrintJob | null
  share: Blueprint | null
  setRoute: (route: Route) => void
  setProfile: (profile: Profile) => void
  patchProfile: (patch: Partial<Profile>) => void
  logAttempt: (attempt: Omit<Attempt, 'id' | 'at'>) => void
  togglePin: (pin: Pin) => void
  setActive: (active: ActiveTest | null) => void
  patchActive: (patch: Partial<ActiveTest>) => void
  saveTest: (test: TestRecord) => void
  patchTest: (id: string, patch: Partial<TestRecord>) => void
  replaceAll: (next: Persisted) => void
  resetProgress: () => void
  flash: (message: string) => void
  requestPrint: (kind: 'blank' | 'teacher', test: TestRecord) => void
  requestStatsPrint: () => void
  clearPrint: () => void
  openShare: (blueprint: Blueprint) => void
  closeShare: () => void
}

const Ctx = createContext<Store | null>(null)

export function Provider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Persisted>(() => loadState())
  const [notice, setNotice] = useState<string | null>(null)
  const [printJob, setPrintJob] = useState<PrintJob | null>(null)
  const [share, setShare] = useState<Blueprint | null>(null)

  useEffect(() => {
    saveState(data)
  }, [data])

  useEffect(() => {
    const read = () => {
      if (!location.hash.startsWith('#t=')) return
      const blueprint = decodeShare(decodeURIComponent(location.hash.slice(3)))
      if (!blueprint) {
        setNotice('link')
        return
      }
      setData((current) => ({ ...current, route: { name: 'shared', blueprint } }))
    }
    read()
    window.addEventListener('hashchange', read)
    return () => window.removeEventListener('hashchange', read)
  }, [])

  useEffect(() => {
    document.documentElement.lang = data.profile?.locale ?? 'en'
    document.documentElement.dataset.theme = data.profile?.theme ?? 'day'
    document.documentElement.dataset.motion = data.profile?.motion === false ? 'off' : 'on'
  }, [data.profile])

  const api = useMemo<Store>(() => {
    const locale = data.profile?.locale ?? 'en'
    return {
      data,
      locale,
      notice,
      printJob,
      share,
      setRoute: (route) => setData((current) => ({ ...current, route })),
      setProfile: (profile) => setData((current) => ({ ...current, profile })),
      patchProfile: (patch) =>
        setData((current) => ({ ...current, profile: current.profile ? { ...current.profile, ...patch } : current.profile })),
      logAttempt: (attempt) =>
        setData((current) => ({
          ...current,
          attempts: [...current.attempts, { ...attempt, id: uid('a'), at: Date.now() }].slice(-2000),
        })),
      togglePin: (pin) =>
        setData((current) => {
          const pins = current.pins ?? []
          const skill = getSkill(pin.skillId)
          const key = unitKey(pin.skillId, pin.knobs, skill)
          const has = pins.some((item) => unitKey(item.skillId, item.knobs, getSkill(item.skillId)) === key)
          const next = skill ? { skillId: pin.skillId, knobs: identityKnobs(skill, pin.knobs) } : pin
          return { ...current, pins: has ? pins.filter((item) => unitKey(item.skillId, item.knobs, getSkill(item.skillId)) !== key) : [...pins, next] }
        }),
      setActive: (active) => setData((current) => ({ ...current, active })),
      patchActive: (patch) =>
        setData((current) => ({ ...current, active: current.active ? { ...current.active, ...patch } : current.active })),
      saveTest: (test) =>
        setData((current) => ({
          ...current,
          active: null,
          tests: [...current.tests.filter((item) => item.id !== test.id), test].slice(-12),
        })),
      patchTest: (id, patch) =>
        setData((current) => ({
          ...current,
          tests: current.tests.map((test) => (test.id === id ? { ...test, ...patch } : test)),
        })),
      replaceAll: (next) => setData(next),
      resetProgress: () =>
        setData((current) => ({ ...current, attempts: [], tests: [], active: null, pins: [], route: { name: 'home' } })),
      flash: (message) => {
        setNotice(message)
        window.setTimeout(() => setNotice((current) => (current === message ? null : current)), 2800)
      },
      requestPrint: (kind, test) => setPrintJob({ id: uid('p'), kind, test }),
      requestStatsPrint: () => setPrintJob({ id: uid('p'), kind: 'stats', test: null }),
      clearPrint: () => setPrintJob(null),
      openShare: (blueprint) => setShare(blueprint),
      closeShare: () => setShare(null),
    }
  }, [data, notice, printJob, share])

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}

export function useStore() {
  const store = useContext(Ctx)
  if (!store) throw new Error('store')
  return store
}

export function freshState() {
  return emptyState()
}
