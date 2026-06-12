import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Combina clases de Tailwind resolviendo conflictos (p. ej. `p-2` vs `p-4`). */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
