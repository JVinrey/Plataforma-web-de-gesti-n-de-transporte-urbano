// Tipos compartidos entre las Edge Functions de IA y el frontend.
// El frontend importa estos mismos contratos desde src/types/ai.ts (copia).

export type Language = 'es' | 'en'

/** Contexto de accesibilidad y perfil que personaliza las respuestas del modelo. */
export interface AiUserContext {
  language?: Language
  /** 'small' | 'normal' | 'large' | 'xlarge' — señal de necesidad de texto simple. */
  textSize?: string
  elderlyMode?: boolean
  /** comun | adulto_mayor | turista | operador | admin */
  userType?: string
  /** Nombre para personalizar el saludo (opcional). */
  name?: string | null
}

/** Una ruta compacta tal como la maneja el modelo. */
export interface RouteLite {
  id: string
  code: string
  name: string
  origin: string | null
  destination: string | null
  estimated_time_minutes: number
  frequency_minutes: number
  cost: number
  status: string
}

// ---------- Chat ----------
export interface ChatTurn {
  from: 'user' | 'bot'
  text: string
}

export interface ChatRequest {
  message: string
  history?: ChatTurn[]
  context?: AiUserContext
}

export interface RouteCard {
  id: string
  code: string
  name: string
}

export interface ChatResponse {
  reply: string
  routeCard?: RouteCard
  /** 'ai' cuando respondió Hugging Face; 'fallback' cuando se usó la regla local. */
  source: 'ai' | 'fallback'
}

// ---------- Recomendación ----------
export interface RecommendCandidate {
  id: string
  code: string
  name: string
  durationMin: number
  cost: number
  /** baja | media | alta */
  congestion: string
  frequencyMin: number
}

export interface RecommendRequest {
  origin?: string
  destination?: string
  candidates: RecommendCandidate[]
  lowFloorPreferred?: boolean
  context?: AiUserContext
}

export interface RecommendResponse {
  recommendedId: string
  reason: string
  source: 'ai' | 'fallback'
}
