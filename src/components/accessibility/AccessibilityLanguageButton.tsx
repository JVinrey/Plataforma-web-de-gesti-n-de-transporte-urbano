import { useId, useState } from 'react'
import { Languages } from 'lucide-react'
import { useAccessibilityStore } from '../../stores/accessibility-store'
import { getUiCopy } from '../../utils/ui-copy'

export function AccessibilityLanguageButton() {
  const language = useAccessibilityStore((state) => state.preferences.language)
  const toggleLanguage = useAccessibilityStore((state) => state.toggleLanguage)
  const copy = getUiCopy(language).accessibilityMenu

  const nextLanguageLabel = language === 'es' ? 'inglés' : 'español'

  // Tooltip custom (WCAG 1.4.13): descartable con Escape, persistente al pasar
  // el cursor por encima y no intercepta eventos del mouse (pointer-events: none).
  const [showTooltip, setShowTooltip] = useState(false)
  const tooltipId = useId()

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') setShowTooltip(false)
  }

  return (
    <div className="relative">
      {showTooltip && (
        <div
          role="tooltip"
          id={tooltipId}
          className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white shadow"
        >
          <span lang={language === 'es' ? 'es' : 'en'}>
            {language === 'es' ? 'Idioma actual: Español' : 'Current language: English'}
          </span>
        </div>
      )}
      <button
        type="button"
        onClick={toggleLanguage}
        aria-label={`${copy.languageButtonLabel}: ${nextLanguageLabel}`}
        aria-describedby={showTooltip ? tooltipId : undefined}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        onKeyDown={handleKeyDown}
        className="flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
      >
        <Languages aria-hidden="true" className="size-4" />
        <span>{language === 'es' ? 'ES' : 'EN'}</span>
      </button>
    </div>
  )
}
