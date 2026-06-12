import { cn } from '../../utils/cn'

export interface SpinnerProps {
  /** Texto anunciado por lectores de pantalla */
  label?: string
  className?: string
}

export function Spinner({ label = 'Cargando…', className }: SpinnerProps) {
  return (
    <div role="status" aria-label={label} className={cn('inline-flex', className)}>
      <svg
        aria-hidden="true"
        className="size-6 animate-spin text-blue-700"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      >
        <circle cx="12" cy="12" r="9" strokeOpacity="0.25" />
        <path d="M21 12a9 9 0 0 0-9-9" strokeLinecap="round" />
      </svg>
      <span className="sr-only">{label}</span>
    </div>
  )
}
