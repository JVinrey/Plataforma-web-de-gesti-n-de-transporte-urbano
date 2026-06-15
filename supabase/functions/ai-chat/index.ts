// Edge Function: ai-chat
// Asistente conversacional real. Reúne contexto de la red de Manta con las
// herramientas internas (getRoutes / getLiveVehicleCounts), arma un prompt con
// las preferencias de accesibilidad del usuario y responde con Hugging Face.
// Si el modelo no está disponible, cae a la regla determinista (ruleReply).
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders, json } from '../_shared/cors.ts'
import { getLiveVehicleCounts, getRoutes } from '../_shared/transit-tools.ts'
import { hfChat, hfConfigured } from '../_shared/hf.ts'
import { ruleReply } from '../_shared/chat-fallback.ts'
import { matchRoute } from '../_shared/matching.ts'
import type { ChatMessage } from '../_shared/hf.ts'
import type { ChatRequest, ChatResponse, RouteLite } from '../_shared/types.ts'

function systemPrompt(routes: RouteLite[], ctx: ChatRequest['context']): string {
  const lang = ctx?.language === 'en' ? 'en' : 'es'
  const simple = ctx?.elderlyMode || ctx?.textSize === 'large' || ctx?.textSize === 'xlarge'
  const lines = routes
    .filter((r) => r.status !== 'off_line')
    .slice(0, 24)
    .map(
      (r) =>
        `- ${r.code} "${r.name}" (${r.origin ?? '?'} → ${r.destination ?? '?'}), ${r.estimated_time_minutes} min, cada ${r.frequency_minutes} min, $${r.cost.toFixed(2)}`,
    )
    .join('\n')

  const langRule =
    lang === 'en'
      ? 'Always answer in English.'
      : 'Responde siempre en español neutro (Ecuador).'
  const styleRule = simple
    ? 'Use frases muy cortas, claras y un solo paso a la vez (el usuario prefiere lectura simple).'
    : 'Sé claro y conciso (2-4 frases).'

  return [
    'Eres el asistente de TransitUrbano, la plataforma de transporte público urbano de Manta, Ecuador.',
    'Ayudas a pasajeros a encontrar rutas, tarifas, horarios y frecuencias. El servicio opera de 05:30 a 22:00.',
    'Usa EXCLUSIVAMENTE las líneas reales de abajo; no inventes líneas, precios ni destinos.',
    'Si no hay una línea adecuada, dilo y sugiere un punto de referencia conocido.',
    langRule,
    styleRule,
    'No uses markdown ni listas con asteriscos; texto plano.',
    '',
    'Líneas disponibles:',
    lines,
  ].join('\n')
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Método no permitido' }, 405)

  let body: ChatRequest
  try {
    body = await req.json()
  } catch {
    return json({ error: 'JSON inválido' }, 400)
  }
  const message = (body.message ?? '').trim()
  if (!message) return json({ error: 'Falta el mensaje' }, 400)

  let routes: RouteLite[] = []
  try {
    routes = await getRoutes()
  } catch (err) {
    console.error('getRoutes falló', err)
  }

  // La tarjeta de ruta se decide de forma determinista a partir del mensaje.
  const matched = matchRoute(message, routes)
  const routeCard = matched
    ? { id: matched.id, code: matched.code, name: matched.name }
    : undefined

  // Sin token o sin datos: respuesta por regla local.
  if (!hfConfigured() || routes.length === 0) {
    return json(ruleReply(message, routes) satisfies ChatResponse)
  }

  try {
    // Contexto de vehículos en vivo (best-effort) para enriquecer la respuesta.
    let liveNote = ''
    try {
      const counts = await getLiveVehicleCounts()
      if (matched && counts[matched.id]) {
        liveNote = `\nDato en vivo: la línea ${matched.code} tiene ${counts[matched.id]} unidad(es) circulando ahora.`
      }
    } catch (_e) {
      // sin datos en vivo, no es crítico
    }

    const history = (body.history ?? []).slice(-6)
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt(routes, body.context) + liveNote },
      ...history.map((t) => ({
        role: (t.from === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: t.text,
      })),
      { role: 'user', content: message },
    ]

    const reply = await hfChat(messages, { maxTokens: 280, temperature: 0.4 })
    return json({ reply, routeCard, source: 'ai' } satisfies ChatResponse)
  } catch (err) {
    console.error('hfChat falló, usando fallback', err)
    return json(ruleReply(message, routes) satisfies ChatResponse)
  }
})
