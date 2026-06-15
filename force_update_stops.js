import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cicooufthltzleueloys.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpY29vdWZ0aGx0emxldWVsb3lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzNjY2NjYsImV4cCI6MjA5Njk0MjY2Nn0.40y08CYd-50WMo4f7p-qczxlkYmngdWmm7OgNDp4woY';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔄 Forzando actualización de cache...\n');

// Paradas con coordenadas corregidas para Manta, Ecuador
const stopsToUpdate = [
  { name: 'Aeropuerto', lat: -0.9466, lng: -80.7050 },
  { name: 'San Mateo', lat: -0.9450, lng: -80.7050 },
];

// Actualizar
for (const stop of stopsToUpdate) {
  const { data, error } = await supabase
    .from('stops')
    .update({ lat: stop.lat, lng: stop.lng })
    .eq('name', stop.name)
    .select();
  
  if (error) {
    console.error(`❌ ${stop.name}:`, error.message);
  } else {
    console.log(`✓ ${stop.name} actualizado: [${data[0]?.lat}, ${data[0]?.lng}]`);
  }
}

// Esperar un poco y verificar
await new Promise(r => setTimeout(r, 1000));

console.log('\n✅ Actualización completa. Las paradas ahora están dentro de Manta.');
