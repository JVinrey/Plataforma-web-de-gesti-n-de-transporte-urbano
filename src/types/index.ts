export type Language = 'es' | 'en'

export type TextSize = 'small' | 'normal' | 'large' | 'xlarge'

export type UserType = 'comun' | 'adulto_mayor' | 'turista'

export type TripStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled'

export interface AccessibilityPreferences {
  highContrast: boolean
  textSize: TextSize
  increasedSpacing: boolean
  dyslexiaFont: boolean
  reduceMotion: boolean
  elderlyMode: boolean
  narrator: boolean
  language: Language
}

export interface User {
  id: string
  email: string
  fullName: string
  userType: UserType
  accessibilityPreferences: AccessibilityPreferences
  createdAt: string
}

export interface Stop {
  id: string
  name: string
  lat: number
  lng: number
  /** Indica si la parada cuenta con infraestructura accesible (rampas, piso táctil) */
  accessible: boolean
}

export interface Route {
  id: string
  code: string
  name: string
  stops: Stop[]
  estimatedTimeMinutes: number
  cost: number
}

export interface Vehicle {
  id: string
  routeId: string
  plate: string
  lat: number
  lng: number
  updatedAt: string
}

export interface Trip {
  id: string
  userId: string
  routeId: string
  originStopId: string
  destinationStopId: string
  status: TripStatus
  scheduledAt: string
}
