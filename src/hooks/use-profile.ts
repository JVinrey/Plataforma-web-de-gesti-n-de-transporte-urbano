import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/auth-store'
import type { Tables } from '../types/database'

export type ProfileRow = Tables<'profiles'>

/**
 * Perfil extendido del usuario autenticado (tabla profiles).
 * Devuelve `null` data cuando no hay sesión activa.
 */
export function useProfile() {
  const userId = useAuthStore((state) => state.user?.id)

  return useQuery({
    queryKey: ['profile', userId],
    enabled: Boolean(userId),
    queryFn: async (): Promise<ProfileRow | null> => {
      if (!userId) return null
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()
      if (error) throw error
      return data
    },
  })
}
