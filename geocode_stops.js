#!/usr/bin/env node
/**
 * Geocodifica todas las paradas usando OpenStreetMap Nominatim
 * Obtiene las coordenadas reales de Manta, Ecuador
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const STOPS = [
  '15 de Septiembre, Manta, Ecuador',
  '20 de Mayo, Manta, Ecuador',
  'Aeropuerto de Manta, Ecuador',
  'Altagracia, Manta, Ecuador',
  'Aurora, Manta, Ecuador',
  'Autoridad Portuaria, Manta, Ecuador',
  'Avenida 113, Manta, Ecuador',
  'Avenida 4 de Noviembre, Manta, Ecuador',
  'Avenida La Cultura, Manta, Ecuador',
  'Barrio La Victoria, Manta, Ecuador',
  'Barrio Santa Ana, Manta, Ecuador',
  'Camal, Manta, Ecuador',
  'Cementerio General, Manta, Ecuador',
  'Colegio 5 de Junio, Manta, Ecuador',
  'Colegio Técnico, Manta, Ecuador',
  'Coliseo, Manta, Ecuador',
  'Cosace, Manta, Ecuador',
  'Costa Azul, Manta, Ecuador',
  'Divino Niño, Manta, Ecuador',
  'El Palmar, Manta, Ecuador',
  'El Prado, Manta, Ecuador',
  'FAE, Manta, Ecuador',
  'Flavio Reyes, Manta, Ecuador',
  'IESS, Manta, Ecuador',
  'Jocay, Manta, Ecuador',
  'La Pradera, Manta, Ecuador',
  'Las Cumbres, Manta, Ecuador',
  'Los Esteros, Manta, Ecuador',
  'Los Gavilanes, Manta, Ecuador',
  'Los Geranios, Manta, Ecuador',
  'Malecón, Manta, Ecuador',
  'Mall del Pacífico, Manta, Ecuador',
  'Manta 2000, Manta, Ecuador',
  'Marbella, Manta, Ecuador',
  'Mercado Central, Manta, Ecuador',
  'Montalván, Manta, Ecuador',
  'Monterrey, Manta, Ecuador',
  'Nuevo Tarqui, Manta, Ecuador',
  'Parque del Recuerdo, Manta, Ecuador',
  'Parroquia Eloy Alfaro, Manta, Ecuador',
  'Picapiedra, Manta, Ecuador',
  'Redondel de los Esteros, Manta, Ecuador',
  'Redondel San Juan, Manta, Ecuador',
  'San Juan, Manta, Ecuador',
  'San Mateo, Manta, Ecuador',
  'San Pedro, Manta, Ecuador',
  'Santa Martha, Manta, Ecuador',
  'Supermaxi, Manta, Ecuador',
  'Tarqui, Manta, Ecuador',
  'Terminal Terrestre, Manta, Ecuador',
  'ULEAM, Manta, Ecuador',
  'Urbirrios, Manta, Ecuador',
  'Villamarina, Manta, Ecuador',
]

const MANTA_BOUNDS = {
  minLat: -0.98,
  maxLat: -0.93,
  minLng: -80.75,
  maxLng: -80.65,
}

async function geocodeLocation(query) {
  try {
    const url = new URL('https://nominatim.openstreetmap.org/search')
    url.searchParams.append('q', query)
    url.searchParams.append('format', 'json')
    url.searchParams.append('limit', '1')

    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'UrbanTransitManta/1.0',
      },
    })

    if (!response.ok) {
      console.error(`HTTP ${response.status} for ${query}`)
      return null
    }

    const data = await response.json()
    if (!data || data.length === 0) {
      console.warn(`No results for: ${query}`)
      return null
    }

    const result = data[0]
    const lat = parseFloat(result.lat)
    const lng = parseFloat(result.lon)

    // Validar que esté en Manta
    if (
      lat < MANTA_BOUNDS.minLat ||
      lat > MANTA_BOUNDS.maxLat ||
      lng < MANTA_BOUNDS.minLng ||
      lng > MANTA_BOUNDS.maxLng
    ) {
      console.warn(`Out of Manta bounds: ${query} (${lat}, ${lng})`)
      return null
    }

    return { lat, lng }
  } catch (error) {
    console.error(`Error geocoding ${query}:`, error.message)
    return null
  }
}

async function main() {
  console.log(`🗺️  Geocodificando ${STOPS.length} paradas en Manta...`)
  console.log('Usando OpenStreetMap Nominatim\n')

  const results = []
  let successful = 0
  let failed = 0

  // Leer datos originales
  const originalStops = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'stops_list.json'), 'utf8')
  )

  const stopsByName = Object.fromEntries(
    originalStops.map((s) => [s.name.toLowerCase(), s])
  )

  for (let i = 0; i < STOPS.length; i++) {
    const query = STOPS[i]
    const locationName = query.split(',')[0]
    const original = stopsByName[locationName.toLowerCase()]

    console.log(`[${i + 1}/${STOPS.length}] Geocodificando: ${locationName}...`)

    const coords = await geocodeLocation(query)

    if (coords) {
      console.log(`  ✓ ${coords.lat}, ${coords.lng}`)
      results.push({
        id: original?.id || `stop-${i + 1}`,
        name: locationName,
        lat: Math.round(coords.lat * 10000) / 10000, // Redondear a 4 decimales
        lng: Math.round(coords.lng * 10000) / 10000,
        accessible: original?.accessible || false,
        created_at: original?.created_at || new Date().toISOString(),
      })
      successful++
    } else {
      console.log(`  ✗ No encontrado`)
      // Mantener el registro original si falla
      if (original) {
        results.push(original)
        console.log(`  → Usando coordenadas originales`)
      }
      failed++
    }

    // Rate limit: 1 request por segundo
    await new Promise((r) => setTimeout(r, 1000))
  }

  // Guardar resultados
  const outputPath = path.join(__dirname, 'stops_list_geocoded.json')
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2))

  console.log('\n' + '='.repeat(60))
  console.log(`✅ Geocodificación completada`)
  console.log(`Exitosas: ${successful}/${STOPS.length}`)
  console.log(`Fallidas: ${failed}/${STOPS.length}`)
  console.log(`Guardado en: ${outputPath}`)
  console.log('='.repeat(60))
}

main().catch(console.error)
