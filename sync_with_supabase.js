#!/usr/bin/env node
/**
 * Ejecuta el SQL update directamente en Supabase para sincronizar todas las paradas
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Leer variables de entorno
function loadEnv() {
  try {
    const envPath = path.join(__dirname, '.env')
    if (!fs.existsSync(envPath)) {
      throw new Error('No se encontró archivo .env')
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
    console.error('❌ Error leyendo .env:', error.message)
    process.exit(1)
  }
}

async function executeSQLUpdate() {
  const env = loadEnv()
  const supabaseUrl = env.VITE_SUPABASE_URL
  const supabaseKey = env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Faltan credenciales de Supabase en .env')
    console.error('   Asegúrate de tener VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  // Leer stops actualizados localmente
  const stopsPath = path.join(__dirname, 'stops_list.json')
  const stops = JSON.parse(fs.readFileSync(stopsPath, 'utf8'))

  console.log('🚀 Sincronizando coordenadas con Supabase...\n')
  console.log(`Total de paradas: ${stops.length}`)
  console.log('Usando método: UPDATE por nombre\n')

  let successful = 0
  let failed = 0
  const errors = []

  for (let i = 0; i < stops.length; i++) {
    const stop = stops[i]
    console.log(`[${i + 1}/${stops.length}] ${stop.name}...`)

    try {
      // Actualizar por nombre (más seguro que por ID)
      const { error } = await supabase
        .from('stops')
        .update({
          lat: stop.lat,
          lng: stop.lng,
        })
        .eq('name', stop.name)

      if (error) {
        console.error(`  ✗ ${error.message}`)
        errors.push({ name: stop.name, error: error.message })
        failed++
      } else {
        console.log(`  ✓ Actualizado: (${stop.lat}, ${stop.lng})`)
        successful++
      }
    } catch (error) {
      console.error(`  ✗ ${error.message}`)
      errors.push({ name: stop.name, error: error.message })
      failed++
    }

    // Rate limit
    await new Promise((r) => setTimeout(r, 100))
  }

  console.log('\n' + '='.repeat(70))
  console.log(`✅ Sincronización completada`)
  console.log(`Exitosas: ${successful}/${stops.length}`)
  console.log(`Fallidas: ${failed}/${stops.length}`)
  console.log('='.repeat(70))

  if (errors.length > 0) {
    console.log('\n⚠️ Errores encontrados:')
    errors.slice(0, 5).forEach((e) => {
      console.log(`  - ${e.name}: ${e.error}`)
    })
    if (errors.length > 5) {
      console.log(`  ... y ${errors.length - 5} más`)
    }
  }

  if (successful === stops.length) {
    console.log('\n🎉 ¡Todas las paradas fueron sincronizadas correctamente!')
    console.log('Los mapas (/rutas, /planificar-viaje) se actualizarán automáticamente.')
  }
}

executeSQLUpdate().catch((error) => {
  console.error('❌ Error fatal:', error.message)
  process.exit(1)
})
