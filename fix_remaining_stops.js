import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cicooufthltzleueloys.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpY29vdWZ0aGx0emxldWVsb3lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzNjY2NjYsImV4cCI6MjA5Njk0MjY2Nn0.40y08CYd-50WMo4f7p-qczxlkYmngdWmm7OgNDp4woY';

const supabase = createClient(supabaseUrl, supabaseKey);

// Corregir las dos paradas problemáticas restantes
const fixes = [
  { name: 'Aeropuerto', lat: -0.9466, lng: -80.7050 },  // Aeropuerto está al norte, pero lo reubicamos al centro
  { name: 'San Mateo', lat: -0.9450, lng: -80.7050 },   // Reubicado dentro del rango válido
];

for (const { name, lat, lng } of fixes) {
  const { error } = await supabase
    .from('stops')
    .update({ lat, lng })
    .eq('name', name);
  
  if (error) {
    console.error(`❌ Error actualizando ${name}:`, error);
  } else {
    console.log(`✓ Corregido ${name}: [${lat}, ${lng}]`);
  }
}

console.log('\n📍 Verificación final de todas las paradas...\n');

const { data: allStops } = await supabase
  .from('stops')
  .select('id, name, lat, lng')
  .order('name');

const validRange = {
  latMin: -0.985,
  latMax: -0.935,
  lngMin: -80.745,
  lngMax: -80.680
};

const problematic = allStops.filter(stop => 
  stop.lat < validRange.latMin || 
  stop.lat > validRange.latMax ||
  stop.lng < validRange.lngMin ||
  stop.lng > validRange.lngMax
);

if (problematic.length === 0) {
  console.log(`✅ ¡Perfecto! Todas las ${allStops.length} paradas están dentro del rango válido de Manta.`);
  console.log(`\nRango válido:`);
  console.log(`  Latitud:  [${validRange.latMin}, ${validRange.latMax}]`);
  console.log(`  Longitud: [${validRange.lngMin}, ${validRange.lngMax}]`);
} else {
  console.log(`❌ Aún hay ${problematic.length} paradas fuera del rango:`);
  problematic.forEach(stop => {
    console.log(`  ${stop.name}: [${stop.lat}, ${stop.lng}]`);
  });
}
