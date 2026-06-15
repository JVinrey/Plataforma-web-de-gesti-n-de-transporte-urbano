import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cicooufthltzleueloys.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpY29vdWZ0aGx0emxldWVsb3lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzNjY2NjYsImV4cCI6MjA5Njk0MjY2Nn0.40y08CYd-50WMo4f7p-qczxlkYmngdWmm7OgNDp4woY';

const supabase = createClient(supabaseUrl, supabaseKey);

const { data, error } = await supabase.from('stops').select('id, name, lat, lng').order('name');

if (error) {
  console.error('Error:', error);
} else {
  console.log('Total de paradas:', data.length);
  data.forEach(stop => {
    console.log(`${stop.name}: [${stop.lat}, ${stop.lng}]`);
  });
}

