import { Languages } from 'lucide-react'
import { useAccessibilityStore } from '../../stores/accessibility-store'
import { getUiCopy } from '../../utils/ui-copy'

export function AccessibilityLanguageButton() {
  const language = useAccessibilityStore((state) => state.preferences.language)
  const toggleLanguage = useAccessibilityStore((state) => state.toggleLanguage)
  const copy = getUiCopy(language).accessibilityMenu

  const nextLanguageLabel = language === 'es' ? 'inglés' : 'español'

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      aria-label={`${copy.languageButtonLabel}: ${nextLanguageLabel}`}
      className="flex min-h-11 items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
      title={`Idioma actual: ${language === 'es' ? 'Español' : 'English'}`}
    >
      <Languages aria-hidden="true" className="size-4" />
      <span>{language === 'es' ? 'ES' : 'EN'}</span>
    </button>
  )
}