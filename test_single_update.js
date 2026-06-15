import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cicooufthltzleueloys.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpY29vdWZ0aGx0emxldWVsb3lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzNjY2NjYsImV4cCI6MjA5Njk0MjY2Nn0.40y08CYd-50WMo4f7p-qczxlkYmngdWmm7OgNDp4woY'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testUpdate() {
  try {
    console.log('🧪 Probando actualización de una parada...\n')

    // Buscar Terminal Terrestre
    const { data: terminal, error: searchError } = await supabase
      .from('stops')
      .select('*')
      .eq('name', 'Terminal Terrestre')
      .single()

    if (searchError) {
      console.error('❌ Error al buscar:', searchError)
      return
    }

    console.log(`📍 Actual: "${terminal.name}" [${terminal.lat}, ${terminal.lng}]`)

    // Actualizar con nuevas coordenadas
    const newLat = -0.9523
    const newLng = -80.7310

    const { data: updated, error: updateError } = await supabase
      .from('stops')
      .update({ lat: newLat, lng: newLng })
      .eq('id', terminal.id)
      .select()

    if (updateError) {
      console.error('❌ Error al actualizar:', updateError)
      return
    }

    if (updated && updated.length > 0) {
      console.log(`✅ Actualizado: "${updated[0].name}" [${updated[0].lat}, ${updated[0].lng}]`)
    } else {
      console.log('⚠️  Ningún registro fue actualizado')
    }
  } catch (err) {
    console.error('❌ Error:', err.message)
  }
}

testUpdate()
