import { createClient } from '@supabase/supabase-js'
import { REAL_STOPS_COORDINATES } from './real_coordinates.js'

const supabaseUrl = 'https://cicooufthltzleueloys.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpY29vdWZ0aGx0emxldWVsb3lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzNjY2NjYsImV4cCI6MjA5Njk0MjY2Nn0.40y08CYd-50WMo4f7p-qczxlkYmngdWmm7OgNDp4woY'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function updateStopsWithRealCoordinates() {
  try {
    console.log('🔄 Iniciando actualización de paradas con coordenadas reales...\n')

    // Obtener todas las paradas
    const { data: stops, error: fetchError } = await supabase
      .from('stops')
      .select('id, name')

    if (fetchError) {
      console.error('❌ Error al obtener paradas:', fetchError)
      return
    }

    let updated = 0
    let failed = 0

    for (const stop of stops) {
      const coords = REAL_STOPS_COORDINATES[stop.name]

      if (!coords) {
        console.warn(`⚠️  Parada "${stop.name}" no tiene coordenadas en la BD`)
        continue
      }

      const { error: updateError } = await supabase
        .from('stops')
        .update({
          lat: coords[0],
          lng: coords[1],
        })
        .eq('id', stop.id)

      if (updateError) {
        console.error(`❌ Error al actualizar "${stop.name}":`, updateError.message)
        failed++
      } else {
        console.log(`✅ "${stop.name}" → [${coords[0]}, ${coords[1]}]`)
        updated++
      }
    }

    console.log(`\n📊 Resumen: ${updated} actualizadas, ${failed} fallidas`)
  } catch (err) {
    console.error('❌ Error general:', err.message)
  }
}

updateStopsWithRealCoordinates()
