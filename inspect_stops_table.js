import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cicooufthltzleueloys.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpY29vdWZ0aGx0emxldWVsb3lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzNjY2NjYsImV4cCI6MjA5Njk0MjY2Nn0.40y08CYd-50WMo4f7p-qczxlkYmngdWmm7OgNDp4woY'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function inspectStopsTable() {
  try {
    // Obtener un registro para ver su estructura
    const { data, error } = await supabase
      .from('stops')
      .select('*')
      .limit(1)

    if (error) {
      console.error('Error:', error)
      return
    }

    if (data && data.length > 0) {
      console.log('📋 Estructura de la tabla stops:')
      console.log(JSON.stringify(data[0], null, 2))
    }
  } catch (err) {
    console.error('Error:', err.message)
  }
}

inspectStopsTable()
