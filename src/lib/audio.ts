let ctx: AudioContext | null = null

function context() {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    ctx = new Ctor()
  }
  return ctx
}

function tone(frequency: number, when: number, duration: number, gain = 0.05) {
  const audio = context()
  if (!audio) return
  const osc = audio.createOscillator()
  const amp = audio.createGain()
  osc.type = 'sine'
  osc.frequency.value = frequency
  amp.gain.setValueAtTime(0.0001, when)
  amp.gain.exponentialRampToValueAtTime(gain, when + 0.02)
  amp.gain.exponentialRampToValueAtTime(0.0001, when + duration)
  osc.connect(amp)
  amp.connect(audio.destination)
  osc.start(when)
  osc.stop(when + duration + 0.02)
}

export function playFeedback(ok: boolean, sound: boolean) {
  if (sound) {
    const audio = context()
    if (audio) {
      const now = audio.currentTime
      if (ok) {
        tone(523.25, now, 0.12, 0.04)
        tone(659.25, now + 0.09, 0.12, 0.04)
        tone(783.99, now + 0.18, 0.18, 0.045)
      } else {
        tone(311.13, now, 0.16, 0.03)
        tone(233.08, now + 0.1, 0.18, 0.025)
      }
    }
  }
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    navigator.vibrate(ok ? [12, 28, 12] : 18)
  }
}
