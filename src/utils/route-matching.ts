// Lógica determinista de búsqueda de rutas, extraída de TripPlannerPage para
// poder reutilizarla (al armar los candidatos que se envían a la IA) y testearla.
import type { RouteRow } from '../hooks/use-transit-data'

const DIACRITICS = new RegExp('[' + '̀' + '-' + 'ͯ' + ']', 'g')

/** minúsculas y sin acentos. */
export function norm(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(DIACRITICS, '')
}

/** Rutas operativas (excluye las fuera de servicio). */
export function availableRoutes(routes: RouteRow[]): RouteRow[] {
  return routes.filter((r) => r.status !== 'off_line')
}

/**
 * Filtra las rutas disponibles por el destino escrito. Sin término de búsqueda
 * (o términos demasiado cortos) devuelve todas las disponibles.
 */
export function filterRoutesByDestination(
  routes: RouteRow[],
  destination: string,
): RouteRow[] {
  const available = availableRoutes(routes)
  const terms = norm(destination)
    .split(/[\s,]+/)
    .filter((w) => w.length > 2)
  if (terms.length === 0) return available
  return available.filter((r) => {
    const hay = norm(`${r.code} ${r.name} ${r.origin ?? ''} ${r.destination ?? ''}`)
    return terms.some((w) => hay.includes(w))
  })
}

/** Ruta de menor tiempo estimado, o null si la lista está vacía. */
export function fastestRoute(routes: RouteRow[]): RouteRow | null {
  return routes.reduce<RouteRow | null>(
    (best, r) =>
      !best || r.estimated_time_minutes < best.estimated_time_minutes ? r : best,
    null,
  )
}
