import { describe, it, expect } from 'vitest'
import type { RouteRow } from '../hooks/use-transit-data'
import { localChatFallback } from './chat-reply'

function route(partial: Partial<RouteRow> & Pick<RouteRow, 'id' | 'code' | 'name'>): RouteRow {
  return {
    origin: null,
    destination: null,
    estimated_time_minutes: 30,
    frequency_minutes: 10,
    cost: 0.35,
    status: 'on_time',
    created_at: '2026-01-01T00:00:00Z',
    ...partial,
  }
}

const ROUTES: RouteRow[] = [
  route({ id: '1', code: 'L1', name: 'Tarqui - Centro', destination: 'Tarqui' }),
  route({ id: '2', code: 'L2', name: 'Universidad ULEAM', destination: 'ULEAM', frequency_minutes: 12 }),
]

describe('localChatFallback', () => {
  it('responde la tarifa ante una pregunta de precio', () => {
    const res = localChatFallback('¿cuánto cuesta el pasaje?', ROUTES)
    expect(res.source).toBe('fallback')
    expect(res.reply).toContain('$0.35')
  })

  it('responde con horario y adjunta la tarjeta de la ruta mencionada', () => {
    const res = localChatFallback('horarios de la ULEAM', ROUTES)
    expect(res.reply).toContain('L2')
    expect(res.routeCard?.id).toBe('2')
  })

  it('lista las rutas disponibles', () => {
    const res = localChatFallback('¿qué rutas hay?', ROUTES)
    expect(res.reply).toContain('2 líneas')
  })

  it('adjunta tarjeta al reconocer un destino concreto', () => {
    const res = localChatFallback('quiero ir a Tarqui', ROUTES)
    expect(res.routeCard?.code).toBe('L1')
  })

  it('da una respuesta de ayuda cuando no reconoce el destino', () => {
    const res = localChatFallback('blablabla xyz', ROUTES)
    expect(res.routeCard).toBeUndefined()
    expect(res.reply).toContain('No encontré')
  })
})
