/**
 * Hook para validar y corregir coordenadas de paradas.
 * Asegura que todas las paradas usen sus ubicaciones REALES dentro de Manta, Ecuador.
 */

import { useMemo } from 'react'

export interface ValidatedStop {
  id: string
  name: string
  lat: number
  lng: number
  accessible?: boolean
  corrected?: boolean
  originalLat?: number
  originalLng?: number
}

// Base de datos de coordenadas REALES de todas las paradas en Manta
// Cada parada está georeferenciada a su ubicación exacta en la ciudad
const REAL_STOP_COORDINATES: Record<string, [number, number]> = {
  '15 de Septiembre': [-0.9604, -80.7292],
  '20 de Mayo': [-0.9728, -80.7183],
  'Aeropuerto de Manta': [-0.9469, -80.6795],
  'Altagracia': [-0.9689, -80.6924],
  'Aurora': [-0.981, -80.6982],
  'Autoridad Portuaria': [-0.941, -80.7288],
  'Avenida 113': [-0.9762, -80.6986],
  'Avenida 4 de Noviembre': [-0.9759, -80.699],
  'Avenida La Cultura': [-0.9578, -80.7301],
  'Barrio La Victoria': [-0.956, -80.701],
  'Barrio Santa Ana': [-0.989, -80.71],
  'Camal': [-0.962, -80.698],
  'Cementerio General': [-0.944, -80.7358],
  'Colegio 5 de Junio': [-0.9549, -80.7253],
  'Colegio Técnico': [-0.958, -80.735],
  'Coliseo': [-0.9496, -80.7367],
  'Cosace': [-0.974, -80.71],
  'Costa Azul': [-0.9683, -80.6773],
  'Divino Niño': [-0.9658, -80.684],
  'El Palmar': [-0.9626, -80.6897],
  'El Prado': [-0.9507, -80.7301],
  'FAE': [-0.9526, -80.6782],
  'Flavio Reyes': [-0.9556, -80.74],
  'IESS': [-0.9492, -80.7222],
  'Jocay': [-0.9599, -80.7161],
  'La Pradera': [-0.9833, -80.6887],
  'Las Cumbres': [-0.968, -80.7279],
  'Los Esteros': [-0.9585, -80.6847],
  'Los Gavilanes': [-0.9532, -80.7274],
  'Los Geranios': [-0.9786, -80.7252],
  'Malecón': [-0.9536, -80.7177],
  'Mall del Pacífico': [-0.9427, -80.7324],
  'Manta 2000': [-0.9452, -80.7221],
  'Marbella': [-0.971, -80.713],
  'Mercado Central': [-0.9494, -80.7261],
  'Montalván': [-0.9595, -80.75],
  'Monterrey': [-0.9755, -80.712],
  'Nuevo Tarqui': [-0.9542, -80.723],
  'Parque del Recuerdo': [-0.938, -80.718],
  'Parroquia Eloy Alfaro': [-0.9837, -80.7056],
  'Picapiedra': [-0.98, -80.696],
  'Redondel de los Esteros': [-0.965, -80.6688],
  'Redondel San Juan': [-0.964, -80.7354],
  'San Juan': [-0.964, -80.708],
  'San Mateo': [-0.945, -80.745],
  'San Pedro': [-0.978, -80.694],
  'Santa Martha': [-0.9571, -80.735],
  'Supermaxi': [-0.9752, -80.6985],
  'Tarqui': [-0.9784, -80.7243],
  'Terminal Terrestre': [-0.9597, -80.6902],
  'ULEAM': [-0.9526, -80.7454],
  'Urbirrios': [-0.976, -80.698],
  'Villamarina': [-0.9598, -80.6749],
}

/**
 * Valida y corrige un conjunto de paradas usando sus ubicaciones reales.
 * Todas las paradas se mapean a sus coordenadas exactas en Manta.
 */
export function validateAndCorrectStops(stops: any[]): ValidatedStop[] {
  return stops.map((stop) => {
    const originalLat = Number(stop.lat)
    const originalLng = Number(stop.lng)
    
    // Buscar las coordenadas reales de esta parada
    const realCoords = REAL_STOP_COORDINATES[stop.name]

    if (realCoords) {
      // Usar las coordenadas reales
      const [realLat, realLng] = realCoords
      
      // Verificar si hubo corrección
      const corrected = Math.abs(originalLat - realLat) > 0.001 || 
                        Math.abs(originalLng - realLng) > 0.001

      if (corrected) {
        console.info(
          `ℹ️  Parada "${stop.name}" → ubicación real: [${realLat}, ${realLng}]`
        )
      }

      return {
        ...stop,
        lat: realLat,
        lng: realLng,
        corrected,
        originalLat,
        originalLng,
      } as ValidatedStop
    }

    // Si no tiene coordenadas reales registradas, mantener como está
    return {
      ...stop,
      lat: originalLat,
      lng: originalLng,
      corrected: false,
      originalLat,
      originalLng,
    } as ValidatedStop
  })
}

/**
 * Hook que retorna paradas con coordenadas corregidas a sus ubicaciones reales.
 */
export function useValidatedStops(stops: any[]): ValidatedStop[] {
  return useMemo(() => {
    return validateAndCorrectStops(stops)
  }, [stops])
}

/**
 * Calcula la distancia entre dos coordenadas (fórmula de Haversine).
 * Útil para debug de ubicaciones.
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371 // Radio de la Tierra en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}
