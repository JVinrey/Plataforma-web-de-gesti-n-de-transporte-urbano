import { useEffect, useId, useRef, useState } from 'react'
import { PersonStanding, Volume2, X } from 'lucide-react'
import { useAccessibilityStore } from '../../stores/accessibility-store'
import type { AccessibilityPreferences, TextSize } from '../../types'
import { AccessibilityContrastButton } from './AccessibilityContrastButton'
import { AccessibilityLanguageButton } from './AccessibilityLanguageButton'
import { getUiCopy } from '../../utils/ui-copy'

const TEXT_SIZES: Array<{ value: TextSize }> = [
  { value: 'small' },
  { value: 'normal' },
  { value: 'large' },
  { value: 'xlarge' },
]

type TogglePreferenceKey = {
  [K in keyof AccessibilityPreferences]: AccessibilityPreferences[K] extends boolean ? K : never
}[keyof AccessibilityPreferences]

const TOGGLES: Array<{ key: TogglePreferenceKey }> = [
  { key: 'elderlyMode' },
  { key: 'highContrast' },
  { key: 'increasedSpacing' },
  { key: 'dyslexiaFont' },
  { key: 'reduceMotion' },
  { key: 'narrator' },
]

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function AccessibilityMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelId = useId()
  const titleId = useId()
  const { preferences, setPreference, resetPreferences } = useAccessibilityStore()
  const copy = getUiCopy(preferences.language).accessibilityMenu

  const speakCurrentView = () => {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const title = document.title || 'Manta Transit'
    const heading = document.querySelector('h1')?.textContent ?? ''
    const text = preferences.language === 'es' ? `Estas en ${title}. ${heading}` : `You are on ${title}. ${heading}`
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(text))
  }

  useEffect(() => {
    if (!isOpen) return

    const panel = panelRef.current
    panel?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      // Cierra con Escape y devuelve el foco al botón que lo abrió
      if (event.key === 'Escape') {
        setIsOpen(false)
        triggerRef.current?.focus()
        return
      }
      // Foco atrapado dentro del panel mientras está abierto (WCAG 2.1.2)
      if (event.key !== 'Tab' || !panel) return
      const focusables = panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      if (focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  useEffect(() => {
    function isEditableTarget(target: EventTarget | null) {
      return target instanceof HTMLElement && target.closest('input, textarea, select, [contenteditable="true"]')
    }

    function handleShortcut(event: KeyboardEvent) {
      if (isEditableTarget(event.target)) return

      const modifierPressed = event.ctrlKey || event.metaKey
      if (!modifierPressed || !event.altKey) return

      if (event.key.toLowerCase() === 'l') {
        event.preventDefault()
        useAccessibilityStore.getState().toggleLanguage()
        return
      }

      if (event.key.toLowerCase() === 'c') {
        event.preventDefault()
        useAccessibilityStore.getState().toggleHighContrast()
      }
    }

    document.addEventListener('keydown', handleShortcut)
    return () => document.removeEventListener('keydown', handleShortcut)
  }, [])

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {isOpen && (
        <div
          ref={panelRef}
          id={panelId}
          role="dialog"
          aria-labelledby={titleId}
          className="absolute bottom-16 right-0 w-80 rounded-lg border border-gray-300 bg-white p-4 shadow-xl"
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 id={titleId} className="text-lg font-bold text-gray-900">
              {copy.title}
            </h2>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false)
                triggerRef.current?.focus()
              }}
              aria-label={copy.closeLabel}
              className="rounded-md p-1 text-gray-700 hover:bg-gray-100"
            >
              <X aria-hidden="true" className="size-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <AccessibilityLanguageButton />
            <AccessibilityContrastButton />
          </div>

          <p className="mt-3 text-xs text-gray-600">
            {copy.shortcutHint}
          </p>

          <ul className="mt-3 flex flex-col gap-2">
            {TOGGLES.map(({ key }) => (
              <li key={key}>
                <label className="flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-md px-2 py-2 hover:bg-gray-50">
                  <span>{copy.toggleLabels[key]}</span>
                  <input
                    type="checkbox"
                    checked={preferences[key] as boolean}
                    onChange={(event) => {
                      setPreference(key, event.target.checked)
                      if (key === 'narrator' && event.target.checked) speakCurrentView()
                    }}
                    className="size-5 accent-blue-700"
                  />
                </label>
              </li>
            ))}
          </ul>

          {preferences.narrator && (
            <button
              type="button"
              onClick={speakCurrentView}
              className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-blue-700 px-3 py-2 font-semibold text-white hover:bg-blue-800"
            >
              <Volume2 aria-hidden="true" className="size-5" />
              {copy.narratorAction}
            </button>
          )}

          <fieldset className="mt-3 border-t border-gray-200 pt-3">
            <legend className="float-left mb-2 font-medium">{copy.textSizeLabel}</legend>
            <div className="clear-both grid grid-cols-2 gap-1">
              {TEXT_SIZES.map(({ value }) => (
                <label
                  key={value}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-gray-50"
                >
                  <input
                    type="radio"
                    name="text-size"
                    value={value}
                    checked={preferences.textSize === value}
                    onChange={() => setPreference('textSize', value)}
                    className="accent-blue-700"
                  />
                  <span>{copy.textSizes[value]}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="mt-3 rounded-md border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
            {copy.currentLanguageLabel}:{' '}
            <strong lang={preferences.language === 'es' ? 'es' : 'en'}>
              {preferences.language === 'es' ? 'Español' : 'English'}
            </strong>
          </div>

          <button
            type="button"
            onClick={resetPreferences}
            className="mt-3 w-full rounded-md border border-gray-400 px-3 py-2 text-gray-900 hover:bg-gray-100"
          >
            {copy.resetLabel}
          </button>
        </div>
      )}

      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-label={isOpen ? copy.closeLabel : copy.openLabel}
        className="flex size-14 items-center justify-center rounded-full bg-blue-700 text-white shadow-lg hover:bg-blue-800"
      >
        <PersonStanding aria-hidden="true" className="size-7" />
      </button>
    </div>
  )
}
