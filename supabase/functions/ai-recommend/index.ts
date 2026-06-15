// Edge Function: ai-recommend
// Recibe los candidatos deterministas que ya calculó el frontend (rutas que
// coinciden con el destino) y deja que el modelo PRIORICE y JUSTIFIQUE la mejor
// según tiempo, congestión, frecuencia y la preferencia de accesibilidad.
// Si el modelo falla, recomienda la más rápida con una justificación genérica.
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders, json } from '../_shared/cors.ts'
import { hfChat, hfConfigured } from '../_shared/hf.ts'
import type { ChatMessage } from '../_shared/hf.ts'
import type { RecommendRequest, RecommendResponse } from '../_shared/types.ts'

/** Fallback: la candidata de menor duración. */
function fastestFallback(body: RecommendRequest): RecommendResponse {
  const best = body.candidates.reduce(
    (b, c) => (!b || c.durationMin < b.durationMin ? c : b),
    body.candidates[0],
  )
  const lang = body.context?.language === 'en' ? 'en' : 'es'
  const reason =
    lang === 'en'
      ? `Fastest option (${best.durationMin} min) among the matching routes.`
      : `Es la opción más rápida (${best.durationMin} min) entre las rutas que coinciden con tu destino.`
  return { recommendedId: best.id, reason, source: 'fallback' }
}

/** Extrae el primer objeto JSON de un texto del modelo. */
function parseJsonObject(text: string): { recommendedId?: string; reason?: string } | null {
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end <= start) return null
  try {
    return JSON.parse(text.slice(start, end + 1))
  } catch {
    return null
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Método no permitido' }, 405)

  let body: RecommendRequest
  try {
    body = await req.json()
  } catch {
    return json({ error: 'JSON inválido' }, 400)
  }
  if (!Array.isArray(body.candidates) || body.candidates.length === 0) {
    return json({ error: 'Faltan candidatos' }, 400)
  }

  if (!hfConfigured()) {
    return json(fastestFallback(body))
  }

  try {
    const lang = body.context?.language === 'en' ? 'en' : 'es'
    const accNote = body.lowFloorPreferred
      ? 'El usuario prefiere buses de piso bajo accesibles; valóralo positivamente.'
      : ''
    const elderly = body.context?.elderlyMode
      ? 'El usuario está en modo adulto mayor: prioriza comodidad y menor congestión sobre ahorrar pocos minutos.'
      : ''

    const candidatesJson = JSON.stringify(
      body.candidates.map((c) => ({
        id: c.id,
        linea: c.code,
        nombre: c.name,
        minutos: c.durationMin,
        costo: c.cost,
        congestion: c.congestion,
        frecuencia_min: c.frequencyMin,
      })),
    )

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: [
          'Eres un planificador de viajes de transporte público en Manta, Ecuador.',
          'Elige la MEJOR ruta entre las candidatas considerando: menor tiempo, menor congestión, mayor frecuencia y accesibilidad.',
          accNote,
          elderly,
          lang === 'en'
            ? 'Write the "reason" field in English, one short sentence.'
            : 'Escribe el campo "reason" en español, una sola frase corta.',
          'Responde ÚNICAMENTE con JSON válido sin texto extra, con esta forma exacta:',
          '{"recommendedId": "<id de una candidata>", "reason": "<justificación breve>"}',
        ]
          .filter(Boolean)
          .join('\n'),
      },
      {
        role: 'user',
        content: `Origen: ${body.origin ?? 'desconocido'}. Destino: ${body.destination ?? 'desconocido'}.\nCandidatas: ${candidatesJson}`,
      },
    ]

    const raw = await hfChat(messages, { maxTokens: 160, temperature: 0.3 })
    const parsed = parseJsonObject(raw)
    const valid =
      parsed?.recommendedId &&
      body.candidates.some((c) => c.id === parsed.recommendedId)

    if (!valid || !parsed?.reason) {
      return json(fastestFallback(body))
    }
    return json({
      recommendedId: parsed.recommendedId!,
      reason: parsed.reason.trim(),
      source: 'ai',
    } satisfies RecommendResponse)
  } catch (err) {
    console.error('hfChat (recommend) falló, usando fallback', err)
    return json(fastestFallback(body))
  }
})
