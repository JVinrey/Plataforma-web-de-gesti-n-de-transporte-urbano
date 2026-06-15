import { useId, useState } from 'react'
import { Contrast } from 'lucide-react'
import { useAccessibilityStore } from '../../stores/accessibility-store'
import { getUiCopy } from '../../utils/ui-copy'

export function AccessibilityContrastButton() {
  const language = useAccessibilityStore((state) => state.preferences.language)
  const highContrast = useAccessibilityStore((state) => state.preferences.highContrast)
  const toggleHighContrast = useAccessibilityStore((state) => state.toggleHighContrast)
  const copy = getUiCopy(language).accessibilityMenu

  // Tooltip custom (WCAG 1.4.13): descartable con Escape, persistente al pasar
  // el cursor por encima y no intercepta eventos del mouse (pointer-events: none).
  const [showTooltip, setShowTooltip] = useState(false)
  const tooltipId = useId()

  const tooltipText = highContrast
    ? language === 'es'
      ? 'Alto contraste activado'
      : 'High contrast on'
    : language === 'es'
      ? 'Alto contraste desactivado'
      : 'High contrast off'

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
          {tooltipText}
        </div>
      )}
      <button
        type="button"
        onClick={toggleHighContrast}
        aria-label={copy.contrastButtonLabel}
        aria-pressed={highContrast}
        aria-describedby={showTooltip ? tooltipId : undefined}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        onKeyDown={handleKeyDown}
        className={`flex min-h-11 w-full items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold transition-colors ${
          highContrast
            ? 'border-gray-900 bg-gray-900 text-white hover:bg-gray-800'
            : 'border-gray-300 bg-white text-gray-900 hover:bg-gray-50'
        }`}
      >
        <Contrast aria-hidden="true" className="size-4" />
        <span>{highContrast ? 'Contraste ON' : 'Contraste OFF'}</span>
      </button>
    </div>
  )
}
