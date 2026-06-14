import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Tables } from '../types/database'

// =====================================================================
// Capa de datos real (Supabase) para rutas, paradas, vehículos y flota.
// Reemplaza los arrays hardcodeados que antes vivían en las páginas.
// =====================================================================

export type RouteRow = Tables<'routes'>
export type StopRow = Tables<'stops'>
export type DriverRow = Tables<'drivers'>

/** Vehículo con su ruta y conductor resueltos por join. */
export interface VehicleWithRelations extends Tables<'vehicles'> {
  route: Pick<RouteRow, 'code' | 'name'> | null
  driver: Pick<DriverRow, 'full_name' | 'avatar_url'> | null
}

/** Rutas de transporte (información pública). */
export function useRoutes() {
  return useQuery({
    queryKey: ['routes'],
    queryFn: async (): Promise<RouteRow[]> => {
      const { data, error } = await supabase
        .from('routes')
        .select('*')
        .order('code', { ascending: true })
      if (error) throw error
      return data
    },
  })
}

/** Paradas con coordenadas y accesibilidad. */
export function useStops() {
  return useQuery({
    queryKey: ['stops'],
    queryFn: async (): Promise<StopRow[]> => {
      const { data, error } = await supabase
        .from('stops')
        .select('*')
        .order('name', { ascending: true })
      if (error) throw error
      return data
    },
  })
}

/** Vehículos de la flota con ruta y conductor. Usado por el panel de flota. */
export function useVehicles() {
  return useQuery({
    queryKey: ['vehicles'],
    refetchInterval: 10000,
    queryFn: async (): Promise<VehicleWithRelations[]> => {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*, route:routes(code, name), driver:drivers(full_name, avatar_url)')
        .order('plate', { ascending: true })
      if (error) throw error
      return data as unknown as VehicleWithRelations[]
    },
  })
}

/** Parada de una ruta con su posición en el recorrido. */
export interface RouteStop extends StopRow {
  position: number
}

/**
 * Paradas ordenadas de una ruta concreta (route_stops → stops).
 * Devuelve la secuencia real del recorrido para dibujar la polilínea en el mapa.
 */
export function useRouteStops(routeId: string | null | undefined) {
  return useQuery({
    queryKey: ['route-stops', routeId],
    enabled: !!routeId,
    queryFn: async (): Promise<RouteStop[]> => {
      const { data, error } = await supabase
        .from('route_stops')
        .select('position, stop:stops(*)')
        .eq('route_id', routeId!)
        .order('position', { ascending: true })
      if (error) throw error
      return (data ?? []).map((row) => ({
        ...(row.stop as unknown as StopRow),
        position: row.position,
      }))
    },
  })
}

export interface FleetStats {
  total: number
  active: number
  onTime: number
  delayed: number
  maintenance: number
  onTimePercent: number
  avgLoad: number
}

/** Métricas agregadas de la flota, derivadas de los vehículos reales. */
export function useFleetStats() {
  const vehiclesQuery = useVehicles()
  const vehicles = vehiclesQuery.data ?? []

  const stats: FleetStats = {
    total: vehicles.length,
    active: vehicles.filter((v) => v.status !== 'maintenance').length,
    onTime: vehicles.filter((v) => v.status === 'on_time').length,
    delayed: vehicles.filter((v) => v.status === 'delayed').length,
    maintenance: vehicles.filter((v) => v.status === 'maintenance').length,
    onTimePercent: vehicles.length
      ? Math.round(
          (vehicles.filter((v) => v.status === 'on_time').length / vehicles.length) * 100,
        )
      : 0,
    avgLoad: vehicles.length
      ? Math.round(vehicles.reduce((sum, v) => sum + v.load_percent, 0) / vehicles.length)
      : 0,
  }

  return { ...vehiclesQuery, stats }
}
