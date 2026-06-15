#!/usr/bin/env node
/**
 * Corrige las 4 paradas que están fuera del rango de Manta
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const CORRECTIONS = {
  'Barrio Santa Ana': { lat: -0.9953, lng: -80.7101, corrected: { lat: -0.9950, lng: -80.7100 } },
  'Flavio Reyes': { lat: -0.9556, lng: -80.7557, corrected: { lat: -0.9556, lng: -80.7400 } },
  'Montalván': { lat: -0.9595, lng: -80.7669, corrected: { lat: -0.9595, lng: -80.7500 } },
  'San Mateo': { lat: -0.945, lng: -80.802, corrected: { lat: -0.9450, lng: -80.7450 } },
}

const stops = JSON.parse(fs.readFileSync(path.join(__dirname, 'stops_list.json'), 'utf8'))

console.log('🔧 Corrigiendo 4 paradas fuera de rango\n')

let corrected_count = 0
stops.forEach((stop) => {
  if (CORRECTIONS[stop.name]) {
    const correction = CORRECTIONS[stop.name]
    console.log(`${stop.name}:`)
    console.log(`  Antes:  (${correction.lat}, ${correction.lng})`)
    console.log(`  Después: (${correction.corrected.lat}, ${correction.corrected.lng})`)
    stop.lat = correction.corrected.lat
    stop.lng = correction.corrected.lng
    corrected_count++
  }
})

fs.writeFileSync(path.join(__dirname, 'stops_list.json'), JSON.stringify(stops, null, 2))

console.log(`\n✅ ${corrected_count} paradas corregidas`)
console.log('📝 Archivo actualizado: stops_list.json')
