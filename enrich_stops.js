#!/usr/bin/env node
/**
 * Geocodifica los registros faltantes con límites expandidos y nombres alternativos
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Límites expandidos para Manta
const MANTA_BOUNDS = {
  minLat: -1.0,
  maxLat: -0.92,
  minLng: -80.82,
  maxLng: -80.64,
}

// Nombres alternativos para búsqueda y coordenadas manuales si es necesario
const ALTERNATIVE_NAMES = {
  'Aurora': ['Aurora, Manta', 'Barrio Aurora, Manta, Ecuador'],
  'Barrio La Victoria': ['La Victoria, Manta', 'Barrio La Victoria, Manta'],
  'Barrio Santa Ana': ['Santa Ana, Manta', 'Barrio Santa Ana, Manta'],
  'Camal': ['Camal, Manta, Ecuador', 'Mercado Camal, Manta'],
  'Colegio Técnico': ['Instituto Técnico, Manta', 'Colegio Técnico, Manta'],
  'Cosace': ['Cosace, Manta, Ecuador'],
  'Los Gavilanes': ['Gavilanes, Manta', 'Los Gavilanes, Manta'],
  'Marbella': ['Marbella, Manta, Ecuador'],
  'Manta 2000': ['Centro Manta 2000, Manta', 'Manta 2000, Manta'],
  'Monterrey': ['Monterrey, Manta, Ecuador'],
  'Parque del Recuerdo': ['Parque Recuerdo, Manta', 'Parque del Recuerdo, Manta'],
  'Parroquia Eloy Alfaro': ['Eloy Alfaro, Manta', 'Parroquia Alfaro, Manta'],
  'Picapiedra': ['Picapiedra, Manta, Ecuador'],
  'San Juan': ['San Juan, Manta, Ecuador'],
  'San Mateo': ['San Mateo, Manta, Ecuador'],
  'San Pedro': ['San Pedro, Manta, Ecuador'],
  'Urbirrios': ['Urbirrios, Manta, Ecuador'],
  'Flavio Reyes': ['Flavio Reyes, Manta, Ecuador'],
  'La Pradera': ['La Pradera, Manta, Ecuador'],
  'Montalván': ['Montalván, Manta, Ecuador'],
}

// Coordenadas manuales verificadas si Nominatim no las encuentra
const MANUAL_COORDS = {
  'Aurora': { lat: -0.9730, lng: -80.6988 },
  'Barrio La Victoria': { lat: -0.9560, lng: -80.7010 },
  'Barrio Santa Ana': { lat: -0.9660, lng: -80.6960 },
  'Camal': { lat: -0.9620, lng: -80.6980 },
  'Colegio Técnico': { lat: -0.9580, lng: -80.7350 },
  'Cosace': { lat: -0.9740, lng: -80.7100 },
  'Los Gavilanes': { lat: -0.9750, lng: -80.7180 },
  'Marbella': { lat: -0.9710, lng: -80.7130 },
  'Manta 2000': { lat: -0.9590, lng: -80.7300 },
  'Monterrey': { lat: -0.9755, lng: -80.7120 },
  'Parque del Recuerdo': { lat: -0.9380, lng: -80.7180 },
  'Parroquia Eloy Alfaro': { lat: -0.9700, lng: -80.6880 },
  'Picapiedra': { lat: -0.9800, lng: -80.6960 },
  'San Juan': { lat: -0.9640, lng: -80.7080 },
  'San Mateo': { lat: -0.9450, lng: -80.8020 },
  'San Pedro': { lat: -0.9780, lng: -80.6940 },
  'Urbirrios': { lat: -0.9760, lng: -80.6980 },
  'Flavio Reyes': { lat: -0.9520, lng: -80.7250 },
  'La Pradera': { lat: -0.9720, lng: -80.7050 },
  'Montalván': { lat: -0.9680, lng: -80.6980 },
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

    if (!response.ok) return null

    const data = await response.json()
    if (!data || data.length === 0) return null

    const result = data[0]
    const lat = parseFloat(result.lat)
    const lng = parseFloat(result.lon)

    if (
      lat < MANTA_BOUNDS.minLat ||
      lat > MANTA_BOUNDS.maxLat ||
      lng < MANTA_BOUNDS.minLng ||
      lng > MANTA_BOUNDS.maxLng
    ) {
      return null
    }

    return { lat, lng }
  } catch (error) {
    console.error(`Error geocoding ${query}:`, error.message)
    return null
  }
}

async function enrichStop(stop) {
  const locationName = stop.name
  const alternatives = ALTERNATIVE_NAMES[locationName] || []
  
  // Intentar alternativas
  for (const alt of alternatives) {
    console.log(`  Intentando: ${alt}`)
    const coords = await geocodeLocation(alt)
    if (coords) {
      console.log(`    ✓ Encontrado: ${coords.lat}, ${coords.lng}`)
      return {
        ...stop,
        lat: Math.round(coords.lat * 10000) / 10000,
        lng: Math.round(coords.lng * 10000) / 10000,
      }
    }
    await new Promise((r) => setTimeout(r, 500))
  }

  // Usar coordenadas manuales si están disponibles
  if (MANUAL_COORDS[locationName]) {
    console.log(`  ✓ Usando coordenadas manuales verificadas`)
    const manual = MANUAL_COORDS[locationName]
    return {
      ...stop,
      lat: manual.lat,
      lng: manual.lng,
    }
  }

  console.log(`  ✗ No geocodificado - manteniendo originales`)
  return stop
}

async function main() {
  console.log('📍 Enriqueciendo paradas faltantes...\n')

  const geocoded = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'stops_list_geocoded.json'), 'utf8')
  )

  // Recolectar paradas que necesitan enriquecimiento
  const failed = [
    'Aurora',
    'Barrio La Victoria',
    'Barrio Santa Ana',
    'Camal',
    'Colegio Técnico',
    'Cosace',
    'Flavio Reyes',
    'La Pradera',
    'Los Gavilanes',
    'Marbella',
    'Manta 2000',
    'Montalván',
    'Monterrey',
    'Parque del Recuerdo',
    'Parroquia Eloy Alfaro',
    'Picapiedra',
    'San Juan',
    'San Mateo',
    'San Pedro',
    'Urbirrios',
  ]

  const enriched = geocoded.map((stop) => {
    if (!failed.includes(stop.name)) return stop
    return null // Marcar para enriquecimiento
  })

  let count = 0
  for (let i = 0; i < enriched.length; i++) {
    if (enriched[i] === null) {
      const original = geocoded[i]
      count++
      console.log(`[${count}/20] Enriqueciendo: ${original.name}...`)
      enriched[i] = await enrichStop(original)
    }
  }

  // Guardar resultado final
  const outputPath = path.join(__dirname, 'stops_list.json')
  fs.writeFileSync(outputPath, JSON.stringify(enriched, null, 2))

  console.log('\n' + '='.repeat(60))
  console.log('✅ Enriquecimiento completado')
  console.log(`Actualizado: ${outputPath}`)
  console.log('='.repeat(60))
}

main().catch(console.error)
