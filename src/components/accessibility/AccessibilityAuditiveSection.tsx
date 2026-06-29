import { useEffect, useState } from 'react'
import { useAccessibilityStore } from '../../stores/accessibility-store'

export function AccessibilityAuditiveSection() {
  const { preferences, setPreference } = useAccessibilityStore()
  const [hasMedia, setHasMedia] = useState(false)
  const lang = preferences.language

  useEffect(() => {
    const check = () => {
      setHasMedia(document.querySelectorAll('video, audio').length > 0)
    }
    check()
    // Re-chequea si el DOM cambia (navegación SPA)
    const observer = new MutationObserver(check)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  if (!hasMedia) return null

  const labels = {
    es: {
      title: 'Accesibilidad Auditiva',
      muteAll: 'Silenciar todo el audio',
      showSubtitles: 'Activar subtítulos',
      showAudioDescription: 'Activar audiodescripción',
      showTranscripts: 'Mostrar transcripciones',
      liveBadge: 'Subtítulos en vivo: no disponibles en esta vista',
    },
    en: {
      title: 'Hearing Accessibility',
      muteAll: 'Mute all audio',
      showSubtitles: 'Enable captions',
      showAudioDescription: 'Enable audio description',
      showTranscripts: 'Show transcripts',
      liveBadge: 'Live captions: not available in this view',
    },
  }
  const t = labels[lang as 'es' | 'en'] ?? labels.es

  const items: Array<{ key: 'muteAll' | 'showSubtitles' | 'showAudioDescription' | 'showTranscripts'; label: string }> = [
    { key: 'muteAll', label: t.muteAll },
    { key: 'showSubtitles', label: t.showSubtitles },
    { key: 'showAudioDescription', label: t.showAudioDescription },
    { key: 'showTranscripts', label: t.showTranscripts },
  ]

  return (
    <fieldset className="mt-3 border-t border-gray-200 pt-3">
      <legend className="mb-2 font-medium text-gray-900">{t.title}</legend>
      <ul className="flex flex-col gap-2">
        {items.map(({ key, label }) => (
          <li key={key}>
            <label className="flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-md px-2 py-2 hover:bg-gray-50">
              <span className="text-sm">{label}</span>
              <input
                type="checkbox"
                checked={preferences[key] as boolean}
                onChange={(e) => setPreference(key, e.target.checked)}
                className="size-5 accent-blue-700"
              />
            </label>
          </li>
        ))}
      </ul>
      {/* 1.2.4 — Indicador de subtítulos en directo */}
      <p className="mt-2 flex items-center gap-2 rounded-md bg-gray-100 px-2 py-1.5 text-xs text-gray-600">
        <span aria-hidden="true">📡</span>
        {t.liveBadge}
      </p>
    </fieldset>
  )
}
