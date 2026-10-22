import { useEffect, useState } from 'react'

type InstallChoice = { outcome: 'accepted' | 'dismissed' }

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<InstallChoice>
}

type InstallWindow = Window & {
  __frauchimboInstall?: BeforeInstallPromptEvent | null
  __frauchimboInstallBound?: boolean
}

function installWindow() {
  return window as InstallWindow
}

export function isInstalledApp() {
  const nav = navigator as Navigator & { standalone?: boolean }
  if (nav.standalone) return true
  return window.matchMedia('(display-mode: standalone)').matches || window.matchMedia('(display-mode: fullscreen)').matches
}

export function isIosDevice() {
  const ua = navigator.userAgent
  const iPadOs = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1
  return /iPad|iPhone|iPod/.test(ua) || iPadOs
}

if (typeof window !== 'undefined' && !installWindow().__frauchimboInstallBound) {
  installWindow().__frauchimboInstallBound = true
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault()
    installWindow().__frauchimboInstall = event as BeforeInstallPromptEvent
    window.dispatchEvent(new Event('frauchimbo-installable'))
  })
  window.addEventListener('appinstalled', () => {
    installWindow().__frauchimboInstall = null
    window.dispatchEvent(new Event('frauchimbo-installed'))
  })
}

export function useInstall() {
  const [installed, setInstalled] = useState(isInstalledApp)
  const [canPrompt, setCanPrompt] = useState(() => Boolean(installWindow().__frauchimboInstall))
  const [ios] = useState(isIosDevice)
  const [help, setHelp] = useState(false)

  useEffect(() => {
    const sync = () => {
      setInstalled(isInstalledApp())
      setCanPrompt(Boolean(installWindow().__frauchimboInstall))
    }
    const onInstalled = () => {
      setInstalled(true)
      setCanPrompt(false)
      setHelp(false)
    }
    window.addEventListener('frauchimbo-installable', sync)
    window.addEventListener('frauchimbo-installed', onInstalled)
    const queries = ['(display-mode: standalone)', '(display-mode: fullscreen)'].map((query) => window.matchMedia(query))
    for (const query of queries) query.addEventListener('change', sync)
    return () => {
      window.removeEventListener('frauchimbo-installable', sync)
      window.removeEventListener('frauchimbo-installed', onInstalled)
      for (const query of queries) query.removeEventListener('change', sync)
    }
  }, [])

  async function install() {
    const event = installWindow().__frauchimboInstall
    if (!event) {
      setHelp(true)
      return
    }
    try {
      await event.prompt()
      const choice = await event.userChoice
      installWindow().__frauchimboInstall = null
      setCanPrompt(false)
      if (choice.outcome === 'accepted') {
        setInstalled(true)
        setHelp(false)
      } else {
        setHelp(true)
      }
    } catch {
      installWindow().__frauchimboInstall = null
      setCanPrompt(false)
      setHelp(true)
    }
  }

  return { installed, canPrompt, ios, help, install }
}
