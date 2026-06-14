import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { getClientId } from '../utils/client-id'
import type { Tables, TablesInsert } from '../types/database'

// =====================================================================
// Recordatorios / alertas de viaje (página Alertas).
// Datos reales en Supabase, aislados por client_id en modo invitado.
// =====================================================================

export type ReminderRow = Tables<'reminders'>

/** Recordatorio con la ruta asociada resuelta por join. */
export interface ReminderWithRoute extends ReminderRow {
  route: { code: string; name: string } | null
}

/** Recordatorios del dispositivo actual, del más reciente al más antiguo. */
export function useReminders() {
  return useQuery({
    queryKey: ['reminders'],
    queryFn: async (): Promise<ReminderWithRoute[]> => {
      const { data, error } = await supabase
        .from('reminders')
        .select('*, route:routes(code, name)')
        .eq('client_id', getClientId())
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as unknown as ReminderWithRoute[]
    },
  })
}

export interface NewReminder {
  route_id: string
  departure_time: string
  lead_minutes: number
  days: string
}

/** Crea un recordatorio para el dispositivo actual. */
export function useCreateReminder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: NewReminder) => {
      const payload: TablesInsert<'reminders'> = {
        client_id: getClientId(),
        route_id: input.route_id || null,
        departure_time: input.departure_time,
        lead_minutes: input.lead_minutes,
        days: input.days,
      }
      const { data, error } = await supabase.from('reminders').insert(payload).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reminders'] }),
  })
}

/** Activa/desactiva un recordatorio. */
export function useToggleReminder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from('reminders').update({ active }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reminders'] }),
  })
}

/** Elimina un recordatorio. */
export function useDeleteReminder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('reminders').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reminders'] }),
  })
}
