import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDocumentTitle } from '../hooks/use-document-title'
import { useRoutes } from '../hooks/use-transit-data'
import { useAiChat, useAiContext } from '../hooks/use-ai'
import { localChatFallback } from '../utils/chat-reply'
import type { ChatTurn } from '../types/ai'

// =====================================================================
// AssistantPage — Asistente TransitUrbano (chat).
// Asistente con IA REAL: envía el mensaje a la Edge Function `ai-chat`
// (Hugging Face + datos reales de Supabase) y muestra la respuesta. Si el
// backend no responde, cae a una respuesta determinista local.
// WCAG 2.2 AA: región de log con aria-live, estado "escribiendo" anunciado,
// controles etiquetados, navegación por teclado y contraste >= 4.5:1.
// =====================================================================

interface ChatMessage {
  id: string
  from: 'bot' | 'user'
  text: string
  time: string
  /** Tarjeta de ruta opcional adjunta a la respuesta del bot. */
  routeCard?: { code: string; name: string; id: string }
}

const QUICK_REPLIES = ['¿Qué rutas hay?', 'Horarios', '¿Cuánto cuesta?', 'Ayuda']

let counter = 0
const nextId = () => `m${counter++}`
const nowTime = () => new Date().toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })

export default function AssistantPage() {
  useDocumentTitle('Asistente AI')
  const { data: routes = [] } = useRoutes()
  const chat = useAiChat()
  const context = useAiContext()
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: nextId(),
      from: 'bot',
      text: '¡Hola! Soy tu Asistente de TransitUrbano. ¿En qué puedo ayudarte con tu ruta hoy?',
      time: nowTime(),
    },
  ])
  const [draft, setDraft] = useState('')
  const [largeText, setLargeText] = useState(false)
  const logRef = useRef<HTMLDivElement>(null)
  const pending = chat.isPending

  const send = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || pending) return
    const userMsg: ChatMessage = { id: nextId(), from: 'user', text: trimmed, time: nowTime() }
    // Historial previo (sin el mensaje recién agregado) para dar contexto al modelo.
    const history: ChatTurn[] = messages
      .slice(-6)
      .map((m) => ({ from: m.from, text: m.text }))
    setMessages((prev) => [...prev, userMsg])
    setDraft('')

    try {
      const res = await chat.mutateAsync({ message: trimmed, history, context })
      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          from: 'bot',
          text: res.reply,
          time: nowTime(),
          routeCard: res.routeCard
            ? { code: res.routeCard.code, name: res.routeCard.name, id: res.routeCard.id }
            : undefined,
        },
      ])
    } catch {
      // Última red de seguridad: respuesta local determinista.
      const fb = localChatFallback(trimmed, routes)
      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          from: 'bot',
          text: fb.reply,
          time: nowTime(),
          routeCard: fb.routeCard
            ? { code: fb.routeCard.code, name: fb.routeCard.name, id: fb.routeCard.id }
            : undefined,
        },
      ])
    }
  }

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, pending])

  const textScale = useMemo(() => (largeText ? 'text-lg' : 'font-body-md'), [largeText])
  const lastUserIndex = useMemo(() => messages.map((m) => m.from).lastIndexOf('user'), [messages])

  return (
    <div className="mx-auto flex h-[calc(100vh-9rem)] max-w-3xl flex-col">
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
                <p className="font-label-md font-semibold uppercase tracking-wide text-secondary">
                  {pending ? 'Escribiendo…' : 'En línea'}
                </p>
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
            {/* Marca de tiempo de inicio de la conversación */}
            <div className="flex justify-center">
              <span className="rounded-full bg-surface-container px-3 py-1 font-label-md text-on-surface-variant">
                Hoy, {messages[0]?.time}
              </span>
            </div>
            {messages.map((m, i) =>
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
                <div key={m.id} className="flex flex-col items-end">
                  <div className="flex items-start justify-end gap-sm">
                    <div className={`max-w-[80%] rounded-2xl rounded-tr-sm bg-primary-container px-4 py-3 text-on-primary-container ${textScale}`}>
                      {m.text}
                    </div>
                    <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-variant text-on-surface-variant">
                      <span className="material-symbols-outlined text-[18px]">person</span>
                    </span>
                  </div>
                  {/* Acuse de lectura en el último mensaje del usuario */}
                  {i === lastUserIndex && (
                    <span className="mr-11 mt-xs font-label-md text-on-surface-variant">Visto {m.time}</span>
                  )}
                </div>
              ),
            )}
            {/* Indicador "escribiendo" mientras el asistente responde */}
            {pending && (
              <div className="flex max-w-[85%] items-start gap-sm" aria-hidden="true">
                <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary">
                  <span className="material-symbols-outlined text-[18px]">smart_toy</span>
                </span>
                <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-primary px-4 py-3 text-on-primary">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-on-primary [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-on-primary [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-on-primary" />
                </div>
              </div>
            )}
          </div>

          {/* Sugerencias rápidas */}
          <div className="flex flex-wrap gap-sm border-t border-outline-variant px-lg py-md">
            {QUICK_REPLIES.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => send(q)}
                disabled={pending}
                className="rounded-full bg-primary-container px-4 py-2 font-label-lg font-medium text-on-primary-container transition-opacity hover:opacity-90 focus-visible:outline-3 disabled:opacity-50"
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
              disabled={pending}
              className="flex h-11 w-11 items-center justify-center rounded-full text-primary transition-colors hover:bg-surface-container focus-visible:outline-3 disabled:opacity-50"
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
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-outline-variant text-on-surface-variant transition-colors hover:bg-surface-container focus-visible:outline-3"
              aria-label="Adjuntar archivo"
              title="Adjuntar archivo (demostración)"
            >
              <span className="material-symbols-outlined">attach_file</span>
            </button>
          </form>
        </section>
        <p className="mt-sm text-center font-label-lg text-on-surface-variant">
          Pulsa el botón rojo para hablar con el asistente
        </p>
    </div>
  )
}
