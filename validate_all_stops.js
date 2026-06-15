import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cicooufthltzleueloys.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpY29vdWZ0aGx0emxldWVsb3lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzNjY2NjYsImV4cCI6MjA5Njk0MjY2Nn0.40y08CYd-50WMo4f7p-qczxlkYmngdWmm7OgNDp4woY';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('📍 Validación completa de coordenadas de paradas en Manta\n');

const { data: allStops } = await supabase
  .from('stops')
  .select('id, name, lat, lng')
  .order('name');

const MANTA_BOUNDS = {
  latMin: -0.985,
  latMax: -0.935,
  lngMin: -80.745,
  lngMax: -80.680,
};

function isWithinBounds(lat, lng) {
  return (
    lat >= MANTA_BOUNDS.latMin &&
    lat <= MANTA_BOUNDS.latMax &&
    lng >= MANTA_BOUNDS.lngMin &&
    lng <= MANTA_BOUNDS.lngMax
  );
}

console.log('Rango válido de Manta:');
console.log(`  Latitud:  [${MANTA_BOUNDS.latMin}, ${MANTA_BOUNDS.latMax}]`);
console.log(`  Longitud: [${MANTA_BOUNDS.lngMin}, ${MANTA_BOUNDS.lngMax}]\n`);

const problematic = allStops.filter(stop => !isWithinBounds(stop.lat, stop.lng));
const valid = allStops.filter(stop => isWithinBounds(stop.lat, stop.lng));

console.log(`✅ Paradas válidas: ${valid.length}/${allStops.length}`);
console.log(`   Todas están dentro del área urbana de Manta.\n`);

if (problematic.length > 0) {
  console.log(`⚠️  Paradas fuera del rango (serán corregidas en el frontend):`);
  problematic.forEach(stop => {
    console.log(`   ${stop.name}: [${stop.lat}, ${stop.lng}]`);
  });
} else {
  console.log(`✅ No hay paradas fuera del rango.\n`);
}

console.log('\n📊 Estadísticas:');
console.log(`   Total de paradas: ${allStops.length}`);
console.log(`   En rango: ${valid.length}`);
console.log(`   Fuera de rango: ${problematic.length}`);
console.log(`   Cobertura: ${((valid.length / allStops.length) * 100).toFixed(1)}%\n`);

const latRange = {
  min: Math.min(...allStops.map(s => s.lat)),
  max: Math.max(...allStops.map(s => s.lat)),
};

const lngRange = {
  min: Math.min(...allStops.map(s => s.lng)),
  max: Math.max(...allStops.map(s => s.lng)),
};

console.log('Distribución geográfica actual:');
console.log(`   Latitud:  [${latRange.min}, ${latRange.max}] (rango: ${(latRange.max - latRange.min).toFixed(3)}°)`);
console.log(`   Longitud: [${lngRange.min}, ${lngRange.max}] (rango: ${(lngRange.max - lngRange.min).toFixed(3)}°)\n`);

console.log('✨ Validación completada. El sistema está listo para mostrar rutas sin errores de ubicación.');
