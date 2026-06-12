import type { InputHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** id obligatorio: asocia el label con el input (WCAG 1.3.1 / 3.3.2) */
  id: string
  label: string
  error?: string
  /** Texto de ayuda opcional, anunciado vía aria-describedby */
  hint?: string
}

export function Input({ id, label, error, hint, className, ...rest }: InputProps) {
  const errorId = `${id}-error`
  const hintId = `${id}-hint`
  const describedBy =
    [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="font-medium text-gray-900">
        {label}
      </label>
      {hint && (
        <span id={hintId} className="text-sm text-gray-700">
          {hint}
        </span>
      )}
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          'rounded-md border-2 border-gray-500 px-3 py-2',
          'focus-visible:border-blue-700',
          error && 'border-red-700',
          className,
        )}
        {...rest}
      />
      {error && (
        <span id={errorId} role="alert" aria-live="polite" className="text-sm text-red-700">
          {error}
        </span>
      )}
    </div>
  )
}
