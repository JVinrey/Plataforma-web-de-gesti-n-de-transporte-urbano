// Lógica determinista compartida: normalización, coincidencia de rutas por
// texto y selección de la ruta más rápida. Se usa tanto para el fallback del
// chat como para detectar la tarjeta de ruta y el fallback de recomendación.
import type { RouteLite } from './types.ts'

const DIACRITICS = /[̀-ͯ]/g

/** minúsculas y sin acentos. */
export function norm(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(DIACRITICS, '')
}

/** Busca la ruta mencionada en un texto libre (código, nombre, origen, destino). */
export function matchRoute(text: string, routes: RouteLite[]): RouteLite | null {
  const q = norm(text)
  const words = q.split(/[\s,]+/).filter((w) => w.length > 3)
  if (words.length === 0) return null
  return (
    routes.find((r) => {
      const hay = norm(`${r.code} ${r.name} ${r.origin ?? ''} ${r.destination ?? ''}`)
      return words.some((w) => hay.includes(w))
    }) ?? null
  )
}

/** Ruta de menor tiempo estimado entre las candidatas. */
export function fastest<T extends { estimated_time_minutes: number }>(
  rows: T[],
): T | null {
  return rows.reduce<T | null>(
    (best, r) =>
      !best || r.estimated_time_minutes < best.estimated_time_minutes ? r : best,
    null,
  )
}
