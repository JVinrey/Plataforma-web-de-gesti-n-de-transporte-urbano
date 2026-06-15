// Fallback local del chat para cuando NI SIQUIERA la Edge Function responde
// (sin red). El backend ya tiene su propio fallback; este es la última red de
// seguridad para que el asistente nunca quede mudo. Reusa la búsqueda de rutas.
import type { RouteRow } from '../hooks/use-transit-data'
import type { AiChatResponse } from '../types/ai'
import { norm } from './route-matching'

function matchRoute(input: string, routes: RouteRow[]): RouteRow | null {
  const q = norm(input)
  const words = q.split(/[\s,]+/).filter((w) => w.length > 3)
  if (words.length === 0) return null
  return (
    routes.find((r) => {
      const hay = norm(`${r.code} ${r.name} ${r.origin ?? ''} ${r.destination ?? ''}`)
      return words.some((w) => hay.includes(w))
    }) ?? null
  )
}

/** Respuesta determinista local (idéntica en espíritu a la del backend). */
export function localChatFallback(input: string, routes: RouteRow[]): AiChatResponse {
  const q = norm(input)
  const available = routes.filter((r) => r.status !== 'off_line')
  const matched = matchRoute(input, routes)

  if (/cuanto|tarifa|precio|cuesta|valor|pasaje/.test(q)) {
    const cost = available[0]?.cost ?? 0.35
    return {
      source: 'fallback',
      reply: `El pasaje urbano en Manta cuesta $${cost.toFixed(2)}. Puedes pagarlo en efectivo o con tu Ticket QR digital desde la app.`,
    }
  }

  if (/horario|frecuencia|cada cuanto|hora|sale|llega/.test(q)) {
    const r = matched ?? available[0]
    if (r) {
      return {
        source: 'fallback',
        reply: `La línea ${r.code} (${r.name}) pasa cada ${r.frequency_minutes} minutos aprox. y el recorrido completo toma unos ${r.estimated_time_minutes} minutos. El servicio opera de 05:30 a 22:00.`,
        routeCard: { id: r.id, code: r.code, name: r.name },
      }
    }
  }

  if (/que rutas|cuales rutas|lineas|rutas hay|listado|lista/.test(q)) {
    const top = available.slice(0, 6).map((r) => `${r.code} (${r.name})`).join(', ')
    return {
      source: 'fallback',
      reply: `Actualmente operan ${available.length} líneas en Manta. Algunas son: ${top}. Escríbeme el nombre de un lugar y te digo qué bus tomar.`,
    }
  }

  if (matched) {
    return {
      source: 'fallback',
      reply: `La mejor opción es la línea ${matched.code} (${matched.name}). El recorrido dura aprox. ${matched.estimated_time_minutes} minutos y pasa cada ${matched.frequency_minutes} minutos. ¿Quieres ver el recorrido en el mapa?`,
      routeCard: { id: matched.id, code: matched.code, name: matched.name },
    }
  }

  return {
    source: 'fallback',
    reply:
      'No encontré una línea para ese destino. Intenta con un punto de referencia conocido (Terminal Terrestre, Playa El Murciélago, ULEAM, Tarqui...) o pregunta "¿Qué rutas hay?".',
  }
}
