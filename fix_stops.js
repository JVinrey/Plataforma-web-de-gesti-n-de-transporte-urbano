import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cicooufthltzleueloys.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpY29vdWZ0aGx0emxldWVsb3lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzNjY2NjYsImV4cCI6MjA5Njk0MjY2Nn0.40y08CYd-50WMo4f7p-qczxlkYmngdWmm7OgNDp4woY';

const supabase = createClient(supabaseUrl, supabaseKey);

// Coordenadas correctas para paradas en Manta (dentro del área urbana)
// Rango válido: Lat [-0.985, -0.935], Lng [-80.745, -80.680]
const correctedStops = {
  'San Mateo': [-0.945, -80.705],
  'ULEAM': [-0.960, -80.720],
  'Colegio Técnico': [-0.958, -80.722],
  'Coliseo': [-0.964, -80.722],
};

// Actualizar paradas problemáticas
for (const [name, [lat, lng]] of Object.entries(correctedStops)) {
  const { error } = await supabase
    .from('stops')
    .update({ lat, lng })
    .eq('name', name);
  
  if (error) {
    console.error(`Error actualizando ${name}:`, error);
  } else {
    console.log(`✓ Actualizado ${name}: [${lat}, ${lng}]`);
  }
}

console.log('\nVerificando paradas después de la actualización...');

// Verificar todas las paradas actualizadas
const { data: allStops, error: queryError } = await supabase
  .from('stops')
  .select('id, name, lat, lng')
  .order('name');

if (queryError) {
  console.error('Error:', queryError);
} else {
  console.log(`Total de paradas: ${allStops.length}\n`);
  
  // Identificar paradas fuera del rango válido
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
  
  if (problematic.length > 0) {
    console.log('Paradas fuera del rango válido:');
    problematic.forEach(stop => {
      console.log(`${stop.name}: [${stop.lat}, ${stop.lng}]`);
    });
  } else {
    console.log('✓ Todas las paradas están dentro del rango válido');
  }
}
