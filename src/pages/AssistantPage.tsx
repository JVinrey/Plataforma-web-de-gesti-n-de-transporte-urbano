import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { PassengerShell } from '../components/layout/PassengerShell'
import { useDocumentTitle } from '../hooks/use-document-title'
import { useRoutes } from '../hooks/use-transit-data'
import type { RouteRow } from '../hooks/use-transit-data'

// =====================================================================
// AssistantPage — Asistente TransitUrbano (chat).
// Asistente basado en reglas que consulta las RUTAS REALES de Supabase
// para responder sobre líneas, tarifas, horarios y frecuencias en Manta.
// WCAG 2.2 AA: región de log con aria-live, controles etiquetados,
// navegación por teclado y contraste >= 4.5:1.
// =====================================================================

interface ChatMessage {
  id: string
  from: 'bot' | 'user'
  text: string
  /** Tarjeta de ruta opcional adjunta a la respuesta del bot. */
  routeCard?: { code: string; name: string; id: string }
}

const QUICK_REPLIES = ['¿Qué rutas hay?', 'Horarios', '¿Cuánto cuesta?', 'Ayuda']

let counter = 0
const nextId = () => `m${counter++}`

/** Normaliza texto: minúsculas y sin acentos (regex construido en runtime). */
const DIACRITICS = new RegExp('[' + '\u0300' + '-' + '\u036f' + ']', 'g')
function norm(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(DIACRITICS, '')
}

/** Genera la respuesta del asistente a partir de las rutas reales. */
function buildReply(input: string, routes: RouteRow[]): ChatMessage {
  const q = norm(input)

  const available = routes.filter((r) => r.status !== 'off_line')

  // Coincidencia por código de línea o por nombre/destino mencionado.
  const matched = routes.find((r) => {
    const hay = norm(`${r.code} ${r.name} ${r.origin ?? ''} ${r.destination ?? ''}`)
    const words = q.split(/\s+/).filter((w) => w.length > 3)
    return words.some((w) => hay.includes(w))
  })

  if (/cuanto|tarifa|precio|cuesta|valor|pasaje/.test(q)) {
    const cost = available[0]?.cost ?? 0.35
    return {
      id: nextId(),
      from: 'bot',
      text: `El pasaje urbano en Manta cuesta $${cost.toFixed(2)}. Puedes pagarlo en efectivo o con tu Ticket QR digital desde la app.`,
    }
  }

  if (/horario|frecuencia|cada cuanto|hora|sale|llega/.test(q)) {
    const r = matched ?? available[0]
    if (r) {
      return {
        id: nextId(),
        from: 'bot',
        text: `La línea ${r.code} (${r.name}) pasa cada ${r.frequency_minutes} minutos aprox. y el recorrido completo toma unos ${r.estimated_time_minutes} minutos. El servicio opera de 05:30 a 22:00.`,
        routeCard: { code: r.code, name: r.name, id: r.id },
      }
    }
  }

  if (/que rutas|cuales rutas|lineas|rutas hay|listado|lista/.test(q)) {
    const top = available.slice(0, 6).map((r) => `${r.code} (${r.name})`).join(', ')
    return {
      id: nextId(),
      from: 'bot',
      text: `Actualmente operan ${available.length} líneas en Manta. Algunas son: ${top}. Escríbeme el nombre de un lugar y te digo qué bus tomar.`,
    }
  }

  if (/ayuda|help|que puedes|como funciona/.test(q)) {
    return {
      id: nextId(),
      from: 'bot',
      text: 'Puedo ayudarte a encontrar rutas, ver tarifas y horarios. Prueba con: "¿Qué bus me lleva al Terminal Terrestre?", "¿Cuánto cuesta el pasaje?" o "Horarios de la línea L1".',
    }
  }

  if (matched) {
    return {
      id: nextId(),
      from: 'bot',
      text: `La mejor opción es la línea ${matched.code} (${matched.name}). El recorrido dura aprox. ${matched.estimated_time_minutes} minutos y pasa cada ${matched.frequency_minutes} minutos. ¿Quieres ver el recorrido en el mapa?`,
      routeCard: { code: matched.code, name: matched.name, id: matched.id },
    }
  }

  return {
    id: nextId(),
    from: 'bot',
    text: 'No encontré una línea para ese destino. Intenta con un punto de referencia conocido (Terminal Terrestre, Playa El Murciélago, ULEAM, Tarqui...) o pregunta "¿Qué rutas hay?".',
  }
}

export default function AssistantPage() {
  useDocumentTitle('Asistente AI')
  const { data: routes = [] } = useRoutes()
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: nextId(),
      from: 'bot',
      text: '¡Hola! Soy tu asistente de TransitUrbano. ¿En qué puedo ayudarte hoy?',
    },
  ])
  const [draft, setDraft] = useState('')
  const [largeText, setLargeText] = useState(false)
  const logRef = useRef<HTMLDivElement>(null)

  const send = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return
    const userMsg: ChatMessage = { id: nextId(), from: 'user', text: trimmed }
    const reply = buildReply(trimmed, routes)
    setMessages((prev) => [...prev, userMsg, reply])
    setDraft('')
  }

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const textScale = useMemo(() => (largeText ? 'text-lg' : 'font-body-md'), [largeText])

  return (
    <PassengerShell activePath="/asistente" searchPlaceholder="Buscar rutas...">
      <div className="mx-auto flex h-[calc(100vh-7rem)] max-w-3xl flex-col">
        <section
          aria-label="Conversación con el asistente"
          className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-sm"
        >
          {/* Cabecera del chat */}
          <header className="flex items-center justify-between border-b border-outline-variant px-lg py-md">
            <div className="flex items-center gap-sm">
              <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary text-on-primary">
                <span className="material-symbols-outlined">smart_toy</span>
                <span
                  className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-surface-container-lowest bg-secondary"
                  aria-hidden="true"
                />
              </span>
              <div>
                <p className="font-body-md font-bold text-on-surface">Asistente TransitUrbano</p>
                <p className="font-label-md font-semibold text-secondary">En línea</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setLargeText((v) => !v)}
              aria-pressed={largeText}
              className="flex items-center gap-xs rounded-full border border-outline px-3 py-1.5 font-label-lg font-semibold text-on-surface-variant transition-colors hover:bg-surface-container focus-visible:outline-3"
            >
              <span className="material-symbols-outlined text-[18px]">format_size</span>
              Texto grande
            </button>
          </header>

          {/* Mensajes */}
          <div
            ref={logRef}
            role="log"
            aria-live="polite"
            aria-label="Mensajes de la conversación"
            className="flex-1 space-y-md overflow-y-auto px-lg py-lg"
          >
            {messages.map((m) =>
              m.from === 'bot' ? (
                <div key={m.id} className="flex max-w-[85%] items-start gap-sm">
                  <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary">
                    <span className="material-symbols-outlined text-[18px]">smart_toy</span>
                  </span>
                  <div className={`rounded-2xl rounded-tl-sm bg-primary px-4 py-3 text-on-primary ${textScale}`}>
                    <p>{m.text}</p>
                    {m.routeCard && (
                      <Link
                        to="/planificar-viaje"
                        className="mt-sm flex items-center justify-between gap-md rounded-xl bg-surface-bright px-3 py-2 text-on-surface transition-colors hover:bg-surface-container focus-visible:outline-3"
                      >
                        <span className="flex items-center gap-sm">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-container text-on-primary-container">
                            <span className="material-symbols-outlined text-[18px]">map</span>
                          </span>
                          <span className="font-label-lg font-semibold">
                            Mapa de {m.routeCard.code} · {m.routeCard.name}
                          </span>
                        </span>
                        <span className="flex items-center gap-xs font-label-lg font-bold text-primary">
                          VER MAPA
                          <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                        </span>
                      </Link>
                    )}
                  </div>
                </div>
              ) : (
                <div key={m.id} className="flex items-start justify-end gap-sm">
                  <div className={`max-w-[80%] rounded-2xl rounded-tr-sm bg-primary-container px-4 py-3 text-on-primary-container ${textScale}`}>
                    {m.text}
                  </div>
                  <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-variant text-on-surface-variant">
                    <span className="material-symbols-outlined text-[18px]">person</span>
                  </span>
                </div>
              ),
            )}
          </div>

          {/* Sugerencias rápidas */}
          <div className="flex flex-wrap gap-sm border-t border-outline-variant px-lg py-md">
            {QUICK_REPLIES.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => send(q)}
                className="rounded-full bg-primary-container px-4 py-2 font-label-lg font-medium text-on-primary-container transition-opacity hover:opacity-90 focus-visible:outline-3"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Entrada */}
          <form
            className="flex items-center gap-sm border-t border-outline-variant px-lg py-md"
            onSubmit={(e) => {
              e.preventDefault()
              send(draft)
            }}
          >
            <label htmlFor="chat-input" className="sr-only">
              Escribe tu mensaje
            </label>
            <input
              id="chat-input"
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Escribe tu mensaje..."
              className="flex-1 rounded-full border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md text-on-surface focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              className="flex h-11 w-11 items-center justify-center rounded-full text-primary transition-colors hover:bg-surface-container focus-visible:outline-3"
              aria-label="Enviar mensaje"
            >
              <span className="material-symbols-outlined">send</span>
            </button>
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-error text-on-error transition-opacity hover:opacity-90 focus-visible:outline-3"
              aria-label="Hablar con el asistente por voz"
              title="Función de voz (demostración)"
            >
              <span className="material-symbols-outlined">mic</span>
            </button>
          </form>
        </section>
        <p className="mt-sm text-center font-label-lg text-on-surface-variant">
          Pulsa el botón rojo para hablar con el asistente
        </p>
      </div>
    </PassengerShell>
  )
}
