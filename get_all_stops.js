import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'

const supabaseUrl = 'https://cicooufthltzleueloys.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpY29vdWZ0aGx0emxldWVsb3lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzNjY2NjYsImV4cCI6MjA5Njk0MjY2Nn0.40y08CYd-50WMo4f7p-qczxlkYmngdWmm7OgNDp4woY'

const supabase = createClient(supabaseUrl, supabaseKey)

async function getAllStops() {
  try {
    const { data, error } = await supabase
      .from('stops')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching stops:', error)
      return
    }

    console.log(`\n📍 Total de paradas: ${data.length}\n`)
    console.log('=' .repeat(100))
    
    data.forEach((stop, index) => {
      console.log(`\n${index + 1}. ${stop.name}`)
      console.log(`   ID: ${stop.id}`)
      console.log(`   Coordenadas: [${stop.latitude}, ${stop.longitude}]`)
      console.log(`   Accesible: ${stop.accessible ? '✅' : '❌'}`)
      console.log(`   Descripción: ${stop.description || 'N/A'}`)
    })

    // Guardar JSON para referencia
    fs.writeFileSync('stops_list.json', JSON.stringify(data, null, 2))
    console.log('\n\n✅ Paradas guardadas en stops_list.json')
  } catch (err) {
    console.error('Error:', err.message)
  }
}

getAllStops()
