// Cliente de Hugging Face. Usa el router compatible con OpenAI
// (/v1/chat/completions) para hablar con un modelo instruct de alta calidad.
// El token vive SOLO en el servidor (secret HF_TOKEN). Timeout corto para no
// colgar la UI: si el modelo está frío o falla, el llamador cae al fallback.

const HF_URL = 'https://router.huggingface.co/v1/chat/completions'
const DEFAULT_MODEL = 'Qwen/Qwen2.5-7B-Instruct'
const TIMEOUT_MS = 9_000

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

/** ¿Está configurado el token? Si no, ni intentamos llamar al modelo. */
export function hfConfigured(): boolean {
  return Boolean(Deno.env.get('HF_TOKEN'))
}

/**
 * Pide una completion al modelo. Lanza si no hay token, si responde mal o si se
 * agota el tiempo: el llamador debe capturar y usar su fallback determinista.
 */
export async function hfChat(
  messages: ChatMessage[],
  opts: { maxTokens?: number; temperature?: number } = {},
): Promise<string> {
  const token = Deno.env.get('HF_TOKEN')
  if (!token) throw new Error('HF_TOKEN no configurado')
  const model = Deno.env.get('HF_MODEL') || DEFAULT_MODEL

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(HF_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: opts.maxTokens ?? 320,
        temperature: opts.temperature ?? 0.4,
      }),
      signal: controller.signal,
    })
    if (!res.ok) {
      throw new Error(`HF respondió ${res.status}: ${await res.text()}`)
    }
    const data = await res.json()
    const content: string | undefined = data?.choices?.[0]?.message?.content
    if (!content) throw new Error('HF sin contenido')
    return content.trim()
  } finally {
    clearTimeout(timer)
  }
}
