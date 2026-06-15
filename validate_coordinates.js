#!/usr/bin/env node
/**
 * Valida que todas las coordenadas de stops estén en el rango correcto de Manta
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Rango válido para Manta
const VALID_LAT = { min: -0.99, max: -0.93 }
const VALID_LNG = { min: -80.75, max: -80.65 }

const stops = JSON.parse(fs.readFileSync(path.join(__dirname, 'stops_list.json'), 'utf8'))

console.log('📍 Validando coordenadas de paradas en Manta\n')
console.log(`Total de paradas: ${stops.length}`)
console.log(`Rango válido: Lat [${VALID_LAT.min}, ${VALID_LAT.max}], Lng [${VALID_LNG.min}, ${VALID_LNG.max}]\n`)

let valid = 0
let invalid = 0
const invalid_stops = []

stops.forEach((stop) => {
  const { lat, lng } = stop
  const isLatValid = lat >= VALID_LAT.min && lat <= VALID_LAT.max
  const isLngValid = lng >= VALID_LNG.min && lng <= VALID_LNG.max

  if (isLatValid && isLngValid) {
    valid++
  } else {
    invalid++
    invalid_stops.push({
      name: stop.name,
      lat,
      lng,
      issue: !isLatValid ? 'Latitud fuera de rango' : 'Longitud fuera de rango',
    })
  }
})

console.log(`✓ Coordenadas válidas: ${valid}/${stops.length}`)
console.log(`✗ Coordenadas inválidas: ${invalid}/${stops.length}`)

if (invalid > 0) {
  console.log('\n⚠️ Paradas con coordenadas fuera de rango:')
  invalid_stops.forEach((s) => {
    console.log(`  - ${s.name}: (${s.lat}, ${s.lng}) - ${s.issue}`)
  })
}

console.log('\n' + '='.repeat(60))
console.log('📌 Muestra de paradas (primeras 10):')
console.log('='.repeat(60))
stops.slice(0, 10).forEach((stop) => {
  console.log(`${stop.name.padEnd(30)} | ${stop.lat}, ${stop.lng}`)
})
console.log('...')
