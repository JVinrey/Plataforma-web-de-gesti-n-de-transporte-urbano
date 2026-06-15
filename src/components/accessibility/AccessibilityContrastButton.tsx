import { Contrast } from 'lucide-react'
import { useAccessibilityStore } from '../../stores/accessibility-store'
import { getUiCopy } from '../../utils/ui-copy'

export function AccessibilityContrastButton() {
  const language = useAccessibilityStore((state) => state.preferences.language)
  const highContrast = useAccessibilityStore((state) => state.preferences.highContrast)
  const toggleHighContrast = useAccessibilityStore((state) => state.toggleHighContrast)
  const copy = getUiCopy(language).accessibilityMenu

  return (
    <button
      type="button"
      onClick={toggleHighContrast}
      aria-label={copy.contrastButtonLabel}
      aria-pressed={highContrast}
      className={`flex min-h-11 items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold transition-colors ${
        highContrast
          ? 'border-gray-900 bg-gray-900 text-white hover:bg-gray-800'
          : 'border-gray-300 bg-white text-gray-900 hover:bg-gray-50'
      }`}
      title={highContrast ? 'Alto contraste activado' : 'Alto contraste desactivado'}
    >
      <Contrast aria-hidden="true" className="size-4" />
      <span>{highContrast ? 'Contraste ON' : 'Contraste OFF'}</span>
    </button>
  )
}