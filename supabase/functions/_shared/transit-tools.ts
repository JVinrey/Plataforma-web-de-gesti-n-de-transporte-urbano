// Herramientas internas de datos (no es un servidor MCP: son funciones que el
// backend llama directo). Consultan Supabase con la SERVICE ROLE para darle al
// modelo contexto real de la red de Manta. La cache evita reconsultar la red
// completa en cada request del chat.
import { createClient } from 'jsr:@supabase/supabase-js@2'
import type { RouteLite } from './types.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

const admin = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false },
})

const CACHE_TTL_MS = 30_000
let routesCache: { at: number; data: RouteLite[] } | null = null

/** Herramienta: rutas de la red (cacheadas 30s). */
export async function getRoutes(): Promise<RouteLite[]> {
  if (routesCache && Date.now() - routesCache.at < CACHE_TTL_MS) {
    return routesCache.data
  }
  const { data, error } = await admin
    .from('routes')
    .select(
      'id, code, name, origin, destination, estimated_time_minutes, frequency_minutes, cost, status',
    )
    .order('code', { ascending: true })
  if (error) throw error
  const rows = (data ?? []) as RouteLite[]
  routesCache = { at: Date.now(), data: rows }
  return rows
}

/** Herramienta: cuántos vehículos están en vivo por línea (resumen ligero). */
export async function getLiveVehicleCounts(): Promise<Record<string, number>> {
  const { data, error } = await admin
    .from('vehicles')
    .select('route_id, status')
    .neq('status', 'maintenance')
  if (error) throw error
  const counts: Record<string, number> = {}
  for (const v of data ?? []) {
    const id = (v as { route_id: string | null }).route_id
    if (id) counts[id] = (counts[id] ?? 0) + 1
  }
  return counts
}
