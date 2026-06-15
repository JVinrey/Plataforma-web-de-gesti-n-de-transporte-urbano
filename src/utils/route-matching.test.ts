import { describe, it, expect } from 'vitest'
import type { RouteRow } from '../hooks/use-transit-data'
import {
  availableRoutes,
  fastestRoute,
  filterRoutesByDestination,
  norm,
} from './route-matching'

function route(partial: Partial<RouteRow> & Pick<RouteRow, 'id' | 'code' | 'name'>): RouteRow {
  return {
    origin: null,
    destination: null,
    estimated_time_minutes: 30,
    frequency_minutes: 10,
    cost: 0.35,
    status: 'on_time',
    created_at: '2026-01-01T00:00:00Z',
    ...partial,
  }
}

const ROUTES: RouteRow[] = [
  route({ id: '1', code: 'L1', name: 'Tarqui - Centro', destination: 'Tarqui', estimated_time_minutes: 40 }),
  route({ id: '2', code: 'L2', name: 'Universidad ULEAM', destination: 'ULEAM', estimated_time_minutes: 25 }),
  route({ id: '3', code: 'L3', name: 'Playa El Murciélago', destination: 'Playa', estimated_time_minutes: 35 }),
  route({ id: '4', code: 'L4', name: 'Terminal Terrestre', destination: 'Terminal', status: 'off_line', estimated_time_minutes: 15 }),
]

describe('norm', () => {
  it('pasa a minúsculas y quita acentos', () => {
    expect(norm('Murciélago ÚLeam')).toBe('murcielago uleam')
  })
})

describe('availableRoutes', () => {
  it('excluye las rutas fuera de servicio', () => {
    const result = availableRoutes(ROUTES)
    expect(result).toHaveLength(3)
    expect(result.find((r) => r.id === '4')).toBeUndefined()
  })
})

describe('filterRoutesByDestination', () => {
  it('sin término devuelve todas las disponibles', () => {
    expect(filterRoutesByDestination(ROUTES, '')).toHaveLength(3)
  })

  it('ignora términos demasiado cortos', () => {
    expect(filterRoutesByDestination(ROUTES, 'la')).toHaveLength(3)
  })

  it('coincide por destino sin importar acentos/mayúsculas', () => {
    const result = filterRoutesByDestination(ROUTES, 'Murciélago')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('3')
  })

  it('coincide por nombre de la línea', () => {
    const result = filterRoutesByDestination(ROUTES, 'uleam')
    expect(result.map((r) => r.id)).toEqual(['2'])
  })

  it('nunca incluye una ruta fuera de servicio aunque coincida', () => {
    const result = filterRoutesByDestination(ROUTES, 'terminal')
    expect(result).toHaveLength(0)
  })
})

describe('fastestRoute', () => {
  it('devuelve la de menor tiempo estimado', () => {
    expect(fastestRoute(availableRoutes(ROUTES))?.id).toBe('2')
  })

  it('devuelve null con lista vacía', () => {
    expect(fastestRoute([])).toBeNull()
  })
})
