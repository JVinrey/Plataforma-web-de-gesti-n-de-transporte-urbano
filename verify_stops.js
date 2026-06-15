import { createClient } from '@supabase/supabase-js'
import { REAL_STOPS_COORDINATES } from './real_coordinates.js'

const supabaseUrl = 'https://cicooufthltzleueloys.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpY29vdWZ0aGx0emxldWVsb3lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzNjY2NjYsImV4cCI6MjA5Njk0MjY2Nn0.40y08CYd-50WMo4f7p-qczxlkYmngdWmm7OgNDp4woY'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function verifyAllStopsUpdated() {
  try {
    const { data: stops, error } = await supabase
      .from('stops')
      .select('id, name, lat, lng')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error:', error)
      return
    }

    console.log(`\n📊 VERIFICACIÓN DE ACTUALIZACIÓN - ${stops.length} PARADAS\n`)
    console.log('=' .repeat(120))

    let correct = 0
    let outOfRange = 0
    const details = []

    stops.forEach((stop) => {
      const expected = REAL_STOPS_COORDINATES[stop.name]
      const latDiff = Math.abs((stop.lat || 0) - (expected ? expected[0] : 0))
      const lngDiff = Math.abs((stop.lng || 0) - (expected ? expected[1] : 0))

      if (!expected) {
        console.log(`⚠️  "${stop.name}" - Sin coordenadas en BD esperada`)
        return
      }

      const withinTolerance = latDiff < 0.005 && lngDiff < 0.005
      if (withinTolerance) {
        correct++
        details.push(`✅ ${stop.name}: [${stop.lat}, ${stop.lng}]`)
      } else {
        outOfRange++
        details.push(`❌ ${stop.name}: DB=[${stop.lat}, ${stop.lng}] vs Esperado=[${expected[0]}, ${expected[1]}]`)
      }
    })

    console.log(details.slice(0, 20).join('\n'))
    if (details.length > 20) {
      console.log(`\n... y ${details.length - 20} más\n`)
    }

    console.log(`\n📊 RESULTADO:`)
    console.log(`✅ Correctas: ${correct}/${stops.length}`)
    console.log(`❌ Fuera de rango: ${outOfRange}/${stops.length}`)
    console.log(`📍 Cobertura: ${((correct / stops.length) * 100).toFixed(1)}%`)
  } catch (err) {
    console.error('Error:', err.message)
  }
}

verifyAllStopsUpdated()
