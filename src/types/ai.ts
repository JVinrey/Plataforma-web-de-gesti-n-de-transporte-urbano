// Contratos del servicio de IA (Edge Functions ai-chat / ai-recommend).
// Espejo de supabase/functions/_shared/types.ts para el lado del cliente.

export type AiLanguage = 'es' | 'en'

export interface AiUserContext {
  language?: AiLanguage
  textSize?: string
  elderlyMode?: boolean
  userType?: string
  name?: string | null
}

export interface ChatTurn {
  from: 'user' | 'bot'
  text: string
}

export interface AiChatRequest {
  message: string
  history?: ChatTurn[]
  context?: AiUserContext
}

export interface AiRouteCard {
  id: string
  code: string
  name: string
}

export interface AiChatResponse {
  reply: string
  routeCard?: AiRouteCard
  source: 'ai' | 'fallback'
}

export interface AiRecommendCandidate {
  id: string
  code: string
  name: string
  durationMin: number
  cost: number
  congestion: string
  frequencyMin: number
}

export interface AiRecommendRequest {
  origin?: string
  destination?: string
  candidates: AiRecommendCandidate[]
  lowFloorPreferred?: boolean
  context?: AiUserContext
}

export interface AiRecommendResponse {
  recommendedId: string
  reason: string
  source: 'ai' | 'fallback'
}
