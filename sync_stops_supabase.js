#!/usr/bin/env node
/**
 * Sincroniza el archivo stops_list.json actualizado con Supabase
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Leer variables de entorno del archivo .env
function loadEnv() {
  try {
    const envPath = path.join(__dirname, '.env')
    if (!fs.existsSync(envPath)) {
      console.error('❌ Error: No se encontró archivo .env')
      process.exit(1)
    }
    const content = fs.readFileSync(envPath, 'utf8')
    const env = {}
    content.split('\n').forEach((line) => {
      const [key, value] = line.split('=')
      if (key && value) {
        env[key.trim()] = value.trim()
      }
    })
    return env
  } catch (error) {
    console.error('Error leyendo .env:', error.message)
    process.exit(1)
  }
}

async function syncStops() {
  const env = loadEnv()
  const supabaseUrl = env.VITE_SUPABASE_URL
  const supabaseKey = env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: Faltan credenciales de Supabase en .env')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  // Leer stops actualizados
  const stopsPath = path.join(__dirname, 'stops_list.json')
  const stops = JSON.parse(fs.readFileSync(stopsPath, 'utf8'))

  console.log(`🚀 Sincronizando ${stops.length} paradas con Supabase...\n`)

  let successful = 0
  let failed = 0

  for (let i = 0; i < stops.length; i++) {
    const stop = stops[i]
    console.log(`[${i + 1}/${stops.length}] Actualizando: ${stop.name}...`)

    try {
      // Upsert: insertar o actualizar
      const { error } = await supabase.from('stops').upsert(
        {
          id: stop.id,
          name: stop.name,
          lat: stop.lat,
          lng: stop.lng,
          accessible: stop.accessible,
        },
        { onConflict: 'id' }
      )

      if (error) {
        console.error(`  ✗ Error: ${error.message}`)
        failed++
      } else {
        console.log(`  ✓ Sincronizado`)
        successful++
      }
    } catch (error) {
      console.error(`  ✗ Exception: ${error.message}`)
      failed++
    }

    // Rate limit
    await new Promise((r) => setTimeout(r, 200))
  }

  console.log('\n' + '='.repeat(60))
  console.log(`✅ Sincronización completada`)
  console.log(`Exitosas: ${successful}/${stops.length}`)
  console.log(`Fallidas: ${failed}/${stops.length}`)
  console.log('='.repeat(60))
}

syncStops().catch(console.error)
