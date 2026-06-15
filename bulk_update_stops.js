import { createClient } from '@supabase/supabase-js'
import { REAL_STOPS_COORDINATES } from './real_coordinates.js'

const supabaseUrl = 'https://cicooufthltzleueloys.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpY29vdWZ0aGx0emxldWVsb3lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzNjY2NjYsImV4cCI6MjA5Njk0MjY2Nn0.40y08CYd-50WMo4f7p-qczxlkYmngdWmm7OgNDp4woY'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function bulkUpdateStops() {
  try {
    console.log('🔄 Actualizando todas las paradas con coordenadas reales...\n')

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
        console.warn(`⚠️  "${stop.name}" - sin coordenadas`)
        continue
      }

      const { data, error } = await supabase
        .from('stops')
        .update({
          lat: coords[0],
          lng: coords[1],
        })
        .eq('id', stop.id)
        .select()

      if (error) {
        console.error(`❌ "${stop.name}":`, error.message)
        failed++
      } else if (data && data.length > 0) {
        console.log(`✅ "${stop.name}" → [${data[0].lat}, ${data[0].lng}]`)
        updated++
      }
    }

    console.log(`\n📊 Resumen final: ${updated} actualizadas, ${failed} errores`)
  } catch (err) {
    console.error('❌ Error:', err.message)
  }
}

bulkUpdateStops()
