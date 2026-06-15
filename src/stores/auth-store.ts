import { create } from 'zustand'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Tables } from '../types/database'

export const ADMIN_DEMO = {
  email: 'admin@manta.gov.ec',
  password: 'MantaAdmin2026!',
  fullName: 'Administradora General',
  userType: 'admin' as const,
}

interface AuthResult {
  error: string | null
  userType?: Tables<'profiles'>['user_type'] | null
}

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<AuthResult>
  signUp: (email: string, password: string, fullName: string, userType?: Tables<'profiles'>['user_type']) => Promise<AuthResult>
  resetPassword: (email: string) => Promise<AuthResult>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,

  signIn: async (email, password) => {
    const normalizedEmail = email.trim().toLowerCase()
    const normalizedPassword = password.trim()

    if (normalizedEmail === ADMIN_DEMO.email && normalizedPassword === ADMIN_DEMO.password) {
      const demoUser = {
        id: 'demo-admin',
        app_metadata: { provider: 'email', providers: ['email'] },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        email: ADMIN_DEMO.email,
        phone: '',
        role: 'authenticated',
        updated_at: new Date().toISOString(),
        user_metadata: {
          full_name: ADMIN_DEMO.fullName,
          user_type: ADMIN_DEMO.userType,
          demo_admin: true,
        },
      } as User
      const demoSession = {
        access_token: 'demo-admin-access-token',
        refresh_token: 'demo-admin-refresh-token',
        expires_in: 60 * 60 * 24 * 365,
        expires_at: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365,
        token_type: 'bearer',
        user: demoUser,
      } as Session
      set({ user: demoUser, session: demoSession })
      return { error: null, userType: ADMIN_DEMO.userType }
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message, userType: null }

    const profileType = data.user?.user_metadata?.user_type ?? null
    set({ user: data.user, session: data.session })
    return { error: null, userType: profileType }
  },

  signUp: async (email, password, fullName, userType = 'comun') => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, user_type: userType } },
    })
    if (error) return { error: error.message, userType: null }

    const profileType = data.user?.user_metadata?.user_type ?? userType
    set({ user: data.user, session: data.session })
    return { error: null, userType: profileType }
  },

  resetPassword: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    })
    if (error) return { error: error.message }
    return { error: null }
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, session: null })
  },
}))

supabase.auth.onAuthStateChange((_event, session) => {
  useAuthStore.setState({
    session,
    user: session?.user ?? null,
    loading: false,
  })
})
