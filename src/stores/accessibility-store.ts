import { create } from 'zustand'
import type { AccessibilityPreferences } from '../types'

const STORAGE_KEY = 'accessibility-preferences'

export const defaultPreferences: AccessibilityPreferences = {
  highContrast: false,
  textSize: 'normal',
  increasedSpacing: false,
  dyslexiaFont: false,
  reduceMotion: false,
  elderlyMode: false,
  narrator: false,
  language: 'es',
}

function loadPreferences(): AccessibilityPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      return { ...defaultPreferences, ...(JSON.parse(raw) as Partial<AccessibilityPreferences>) }
    }
  } catch {
    // localStorage no disponible o JSON corrupto: usar valores por defecto
  }
  return defaultPreferences
}

const TEXT_SIZE_CLASSES = [
  'text-size-small',
  'text-size-normal',
  'text-size-large',
  'text-size-xlarge',
] as const

/** Aplica las preferencias como clases CSS sobre <html>. */
export function applyPreferencesToDocument(prefs: AccessibilityPreferences): void {
  const root = document.documentElement
  root.classList.toggle('high-contrast', prefs.highContrast)
  root.classList.remove(...TEXT_SIZE_CLASSES)
  root.classList.add(`text-size-${prefs.textSize}`)
  root.classList.toggle('increased-spacing', prefs.increasedSpacing)
  root.classList.toggle('dyslexia-font', prefs.dyslexiaFont)
  root.classList.toggle('reduce-motion', prefs.reduceMotion)
  root.classList.toggle('elderly-mode', prefs.elderlyMode)
  root.lang = prefs.language
}

interface AccessibilityState {
  preferences: AccessibilityPreferences
  setPreference: <K extends keyof AccessibilityPreferences>(
    key: K,
    value: AccessibilityPreferences[K],
  ) => void
  resetPreferences: () => void
}

export const useAccessibilityStore = create<AccessibilityState>((set, get) => ({
  preferences: loadPreferences(),
  setPreference: (key, value) => {
    const preferences = { ...get().preferences, [key]: value }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
    } catch {
      // localStorage no disponible: la preferencia solo dura la sesión
    }
    applyPreferencesToDocument(preferences)
    set({ preferences })
  },
  resetPreferences: () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // localStorage no disponible
    }
    applyPreferencesToDocument(defaultPreferences)
    set({ preferences: defaultPreferences })
  },
}))
