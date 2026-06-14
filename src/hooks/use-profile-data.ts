import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { getClientId } from '../utils/client-id'
import type { Tables } from '../types/database'

// =====================================================================
// Ubicaciones guardadas (perfil) y rutas favoritas. Datos reales en
// Supabase, aislados por client_id en modo invitado.
// =====================================================================

export type SavedLocationRow = Tables<'saved_locations'>

/** Ubicaciones guardadas del dispositivo (Casa, Trabajo, …). */
export function useSavedLocations() {
  return useQuery({
    queryKey: ['saved-locations'],
    queryFn: async (): Promise<SavedLocationRow[]> => {
      const { data, error } = await supabase
        .from('saved_locations')
        .select('*')
        .eq('client_id', getClientId())
        .order('created_at', { ascending: true })
      if (error) throw error
      return data
    },
  })
}

export interface NewLocation {
  label: string
  address: string
  kind?: string
}

/** Añade una ubicación guardada. */
export function useAddLocation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: NewLocation) => {
      const { error } = await supabase.from('saved_locations').insert({
        client_id: getClientId(),
        label: input.label,
        address: input.address,
        kind: input.kind ?? 'other',
      })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['saved-locations'] }),
  })
}

/** Elimina una ubicación guardada. */
export function useDeleteLocation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('saved_locations').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['saved-locations'] }),
  })
}

/** IDs de rutas marcadas como favoritas en este dispositivo. */
export function useFavoriteRoutes() {
  return useQuery({
    queryKey: ['favorite-routes'],
    queryFn: async (): Promise<string[]> => {
      const { data, error } = await supabase
        .from('favorite_routes')
        .select('route_id')
        .eq('client_id', getClientId())
      if (error) throw error
      return (data ?? []).map((r) => r.route_id)
    },
  })
}

/** Marca/desmarca una ruta como favorita. */
export function useToggleFavorite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ routeId, isFavorite }: { routeId: string; isFavorite: boolean }) => {
      const clientId = getClientId()
      if (isFavorite) {
        const { error } = await supabase
          .from('favorite_routes')
          .delete()
          .eq('client_id', clientId)
          .eq('route_id', routeId)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('favorite_routes')
          .insert({ client_id: clientId, route_id: routeId })
        if (error) throw error
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['favorite-routes'] }),
  })
}
