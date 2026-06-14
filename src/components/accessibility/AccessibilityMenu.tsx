import { useEffect, useId, useRef, useState } from 'react'
import { PersonStanding, Volume2, X } from 'lucide-react'
import { useAccessibilityStore } from '../../stores/accessibility-store'
import type { AccessibilityPreferences, Language, TextSize } from '../../types'

const TEXT_SIZES: Array<{ value: TextSize; label: string }> = [
  { value: 'small', label: 'Pequeño' },
  { value: 'normal', label: 'Normal' },
  { value: 'large', label: 'Grande' },
  { value: 'xlarge', label: 'Extra grande' },
]

type TogglePreferenceKey = {
  [K in keyof AccessibilityPreferences]: AccessibilityPreferences[K] extends boolean ? K : never
}[keyof AccessibilityPreferences]

const TOGGLES: Array<{ key: TogglePreferenceKey; label: string }> = [
  { key: 'elderlyMode', label: 'Modo adulto mayor' },
  { key: 'highContrast', label: 'Alto contraste' },
  { key: 'increasedSpacing', label: 'Espaciado aumentado' },
  { key: 'dyslexiaFont', label: 'Fuente para dislexia' },
  { key: 'reduceMotion', label: 'Reducir animaciones' },
  { key: 'narrator', label: 'Narrador / texto a voz' },
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

  const speakCurrentView = () => {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const title = document.title || 'Manta Transit'
    const heading = document.querySelector('h1')?.textContent ?? ''
    const text = `Estas en ${title}. ${heading}`
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
              Accesibilidad
            </h2>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false)
                triggerRef.current?.focus()
              }}
              aria-label="Cerrar menú de accesibilidad"
              className="rounded-md p-1 text-gray-700 hover:bg-gray-100"
            >
              <X aria-hidden="true" className="size-5" />
            </button>
          </div>

          <ul className="flex flex-col gap-2">
            {TOGGLES.map(({ key, label }) => (
              <li key={key}>
                <label className="flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-md px-2 py-2 hover:bg-gray-50">
                  <span>{label}</span>
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
              Leer pantalla actual
            </button>
          )}

          <fieldset className="mt-3 border-t border-gray-200 pt-3">
            <legend className="float-left mb-2 font-medium">Tamaño de texto</legend>
            <div className="clear-both grid grid-cols-2 gap-1">
              {TEXT_SIZES.map(({ value, label }) => (
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
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="mt-3 flex flex-col gap-1 border-t border-gray-200 pt-3">
            <label htmlFor="a11y-language" className="font-medium">
              Idioma
            </label>
            <select
              id="a11y-language"
              value={preferences.language}
              onChange={(event) => setPreference('language', event.target.value as Language)}
              className="rounded-md border-2 border-gray-500 px-2 py-1.5"
            >
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          </div>

          <button
            type="button"
            onClick={resetPreferences}
            className="mt-3 w-full rounded-md border border-gray-400 px-3 py-2 text-gray-900 hover:bg-gray-100"
          >
            Restablecer valores
          </button>
        </div>
      )}

      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-label={isOpen ? 'Cerrar menú de accesibilidad' : 'Abrir menú de accesibilidad'}
        className="flex size-14 items-center justify-center rounded-full bg-blue-700 text-white shadow-lg hover:bg-blue-800"
      >
        <PersonStanding aria-hidden="true" className="size-7" />
      </button>
    </div>
  )
}
