# Edge Functions — IA real (asistente y recomendación)

Dos funciones serverless (Deno) que dan IA real a la plataforma usando un modelo
de Hugging Face + datos reales de Supabase. El token de HF vive SOLO aquí, nunca
en el frontend.

| Función | Endpoint | Qué hace |
| --- | --- | --- |
| `ai-chat` | `POST /functions/v1/ai-chat` | Asistente conversacional. Reúne las rutas reales con herramientas internas (`getRoutes`, `getLiveVehicleCounts`) y responde con el modelo. Fallback: regla determinista. |
| `ai-recommend` | `POST /functions/v1/ai-recommend` | Recibe candidatos deterministas del frontend y deja que el modelo priorice/justifique la mejor ruta. Fallback: la más rápida. |

`_shared/` contiene las herramientas internas y utilidades compartidas
(`cors`, `types`, `transit-tools`, `matching`, `hf`, `chat-fallback`).

## Configurar el modelo (paso obligatorio para activar la IA)

Sin `HF_TOKEN` las funciones siguen respondiendo, pero con el **fallback
determinista** (`source: "fallback"`). Para activar el modelo real:

1. Crea un token de lectura en https://huggingface.co/settings/tokens
2. Guárdalo como secret del proyecto (no se versiona):

   ```bash
   supabase secrets set HF_TOKEN=hf_xxx
   # opcional: cambiar el modelo (por defecto Qwen/Qwen2.5-7B-Instruct)
   supabase secrets set HF_MODEL=meta-llama/Llama-3.1-8B-Instruct
   ```

   O desde el dashboard: **Project Settings → Edge Functions → Secrets**.

`SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` ya están disponibles en el runtime
de Edge Functions; no hay que configurarlos.

## Desplegar

```bash
supabase functions deploy ai-chat
supabase functions deploy ai-recommend
```

## Contrato

Los tipos de request/response están en `_shared/types.ts` y se reflejan en el
frontend en `src/types/ai.ts`. El frontend las invoca con
`supabase.functions.invoke('ai-chat' | 'ai-recommend', { body })` desde
`src/hooks/use-ai.ts`.
