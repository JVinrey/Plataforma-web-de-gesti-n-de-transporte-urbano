// Hooks que conectan el frontend con las Edge Functions de IA.
// El contexto de accesibilidad (idioma, tamaño de texto, modo adulto mayor) y
// el perfil del usuario viajan con cada petición para personalizar la respuesta.
import { useMutation } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAccessibilityStore } from '../stores/accessibility-store'
import { useProfile } from './use-profile'
import type {
  AiChatRequest,
  AiChatResponse,
  AiRecommendRequest,
  AiRecommendResponse,
  AiUserContext,
} from '../types/ai'

/** Construye el contexto de personalización desde el store y el perfil. */
export function useAiContext(): AiUserContext {
  const prefs = useAccessibilityStore((s) => s.preferences)
  const { data: profile } = useProfile()
  return {
    language: prefs.language,
    textSize: prefs.textSize,
    elderlyMode: prefs.elderlyMode,
    userType: profile?.user_type,
    name: profile?.full_name ?? null,
  }
}

async function invokeChat(payload: AiChatRequest): Promise<AiChatResponse> {
  const { data, error } = await supabase.functions.invoke<AiChatResponse>('ai-chat', {
    body: payload,
  })
  if (error) throw error
  if (!data) throw new Error('Respuesta vacía del asistente')
  return data
}

async function invokeRecommend(
  payload: AiRecommendRequest,
): Promise<AiRecommendResponse> {
  const { data, error } = await supabase.functions.invoke<AiRecommendResponse>(
    'ai-recommend',
    { body: payload },
  )
  if (error) throw error
  if (!data) throw new Error('Respuesta vacía de la recomendación')
  return data
}

/** Mutación para enviar un mensaje al asistente. */
export function useAiChat() {
  return useMutation({ mutationFn: invokeChat })
}

/** Mutación para pedir la ruta recomendada a partir de candidatos. */
export function useAiRecommend() {
  return useMutation({ mutationFn: invokeRecommend })
}
