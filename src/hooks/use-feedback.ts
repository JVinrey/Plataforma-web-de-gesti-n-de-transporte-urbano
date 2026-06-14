import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/auth-store'
import type { Tables, TablesInsert } from '../types/database'

// =====================================================================
// Calificación de viajes (página ¿Cómo fue tu viaje?).
// Escribe en la tabla `feedback` real de Supabase.
// =====================================================================

export type FeedbackRow = Tables<'feedback'>

export interface FeedbackWithRoute extends FeedbackRow {
  route: { code: string; name: string } | null
}

/** Últimas calificaciones publicadas (lectura pública). */
export function useRecentFeedback(limit = 8) {
  return useQuery({
    queryKey: ['feedback', limit],
    queryFn: async (): Promise<FeedbackWithRoute[]> => {
      const { data, error } = await supabase
        .from('feedback')
        .select('*, route:routes(code, name)')
        .order('created_at', { ascending: false })
        .limit(limit)
      if (error) throw error
      return data as unknown as FeedbackWithRoute[]
    },
  })
}

export interface NewFeedback {
  route_id: string
  rating: number
  punctuality: number
  comfort: number
  safety: number
  driver_rating: number
  comment: string
  duration_minutes?: number
  vehicle_code?: string
  vehicle_type?: string
}

/** Envía una calificación de viaje (anónima en modo invitado). */
export function useSubmitFeedback() {
  const qc = useQueryClient()
  const user = useAuthStore((s) => s.user)
  return useMutation({
    mutationFn: async (input: NewFeedback) => {
      const payload: TablesInsert<'feedback'> = {
        route_id: input.route_id || null,
        user_id: user?.id ?? null,
        rating: input.rating,
        punctuality: input.punctuality || null,
        comfort: input.comfort || null,
        safety: input.safety || null,
        driver_rating: input.driver_rating || null,
        comment: input.comment.trim() || null,
        duration_minutes: input.duration_minutes ?? null,
        vehicle_code: input.vehicle_code ?? null,
        vehicle_type: input.vehicle_type ?? null,
      }
      const { data, error } = await supabase.from('feedback').insert(payload).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['feedback'] }),
  })
}
