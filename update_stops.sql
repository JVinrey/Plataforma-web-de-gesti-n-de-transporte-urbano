-- SQL Update Script para Supabase
-- Ejecutar esto en: Database → SQL Editor en Supabase Dashboard
-- Actualiza todas las coordenadas de las paradas a valores precisos de Manta

-- BACKUP: Descomenta si quieres hacer backup primero
-- CREATE TABLE stops_backup AS SELECT * FROM stops;

-- Actualizar coordenadas con valores verificados de OpenStreetMap + manuales
UPDATE stops SET lat = -0.9604, lng = -80.7292 WHERE name = '15 de Septiembre';
UPDATE stops SET lat = -0.9728, lng = -80.7183 WHERE name = '20 de Mayo';
UPDATE stops SET lat = -0.9469, lng = -80.6795 WHERE name = 'Aeropuerto';
UPDATE stops SET lat = -0.9689, lng = -80.6924 WHERE name = 'Altagracia';
UPDATE stops SET lat = -0.9810, lng = -80.6982 WHERE name = 'Aurora';
UPDATE stops SET lat = -0.9410, lng = -80.7288 WHERE name = 'Autoridad Portuaria';
UPDATE stops SET lat = -0.9762, lng = -80.6986 WHERE name = 'Av. 113';
UPDATE stops SET lat = -0.9759, lng = -80.6990 WHERE name = 'Av. 4 de Noviembre';
UPDATE stops SET lat = -0.9578, lng = -80.7301 WHERE name = 'Av. La Cultura';
UPDATE stops SET lat = -0.9560, lng = -80.7010 WHERE name = 'Barrio La Victoria';
UPDATE stops SET lat = -0.9890, lng = -80.7100 WHERE name = 'Barrio Santa Ana';
UPDATE stops SET lat = -0.9620, lng = -80.6980 WHERE name = 'Camal';
UPDATE stops SET lat = -0.9440, lng = -80.7358 WHERE name = 'Cementerio General';
UPDATE stops SET lat = -0.9549, lng = -80.7253 WHERE name = 'Colegio 5 de Junio';
UPDATE stops SET lat = -0.9580, lng = -80.7350 WHERE name = 'Colegio Técnico';
UPDATE stops SET lat = -0.9496, lng = -80.7367 WHERE name = 'Coliseo';
UPDATE stops SET lat = -0.9740, lng = -80.7100 WHERE name = 'Cosace';
UPDATE stops SET lat = -0.9683, lng = -80.6773 WHERE name = 'Costa Azul';
UPDATE stops SET lat = -0.9658, lng = -80.6840 WHERE name = 'Divino Niño';
UPDATE stops SET lat = -0.9626, lng = -80.6897 WHERE name = 'El Palmar';
UPDATE stops SET lat = -0.9507, lng = -80.7301 WHERE name = 'El Prado';
UPDATE stops SET lat = -0.9526, lng = -80.6782 WHERE name = 'FAE';
UPDATE stops SET lat = -0.9556, lng = -80.7400 WHERE name = 'Flavio Reyes';
UPDATE stops SET lat = -0.9492, lng = -80.7222 WHERE name = 'IESS';
UPDATE stops SET lat = -0.9599, lng = -80.7161 WHERE name = 'Jocay';
UPDATE stops SET lat = -0.9833, lng = -80.6887 WHERE name = 'La Pradera';
UPDATE stops SET lat = -0.9680, lng = -80.7279 WHERE name = 'Las Cumbres';
UPDATE stops SET lat = -0.9585, lng = -80.6847 WHERE name = 'Los Esteros';
UPDATE stops SET lat = -0.9532, lng = -80.7274 WHERE name = 'Los Gavilanes';
UPDATE stops SET lat = -0.9786, lng = -80.7252 WHERE name = 'Los Geranios';
UPDATE stops SET lat = -0.9536, lng = -80.7177 WHERE name = 'Malecón';
UPDATE stops SET lat = -0.9427, lng = -80.7324 WHERE name = 'Mall del Pacífico';
UPDATE stops SET lat = -0.9452, lng = -80.7221 WHERE name = 'Manta 2000';
UPDATE stops SET lat = -0.9710, lng = -80.7130 WHERE name = 'Marbella';
UPDATE stops SET lat = -0.9494, lng = -80.7261 WHERE name = 'Mercado Central';
UPDATE stops SET lat = -0.9595, lng = -80.7500 WHERE name = 'Montalván';
UPDATE stops SET lat = -0.9755, lng = -80.7120 WHERE name = 'Monterrey';
UPDATE stops SET lat = -0.9542, lng = -80.7230 WHERE name = 'Nuevo Tarqui';
UPDATE stops SET lat = -0.9380, lng = -80.7180 WHERE name = 'Parque del Recuerdo';
UPDATE stops SET lat = -0.9837, lng = -80.7056 WHERE name = 'Parroquia Eloy Alfaro';
UPDATE stops SET lat = -0.9800, lng = -80.6960 WHERE name = 'Picapiedra';
UPDATE stops SET lat = -0.9650, lng = -80.6688 WHERE name = 'Redondel de los Esteros';
UPDATE stops SET lat = -0.9640, lng = -80.7354 WHERE name = 'Redondel San Juan';
UPDATE stops SET lat = -0.9640, lng = -80.7080 WHERE name = 'San Juan';
UPDATE stops SET lat = -0.9450, lng = -80.7450 WHERE name = 'San Mateo';
UPDATE stops SET lat = -0.9780, lng = -80.6940 WHERE name = 'San Pedro';
UPDATE stops SET lat = -0.9571, lng = -80.7350 WHERE name = 'Santa Martha';
UPDATE stops SET lat = -0.9752, lng = -80.6985 WHERE name = 'Supermaxi';
UPDATE stops SET lat = -0.9784, lng = -80.7243 WHERE name = 'Tarqui';
UPDATE stops SET lat = -0.9597, lng = -80.6902 WHERE name = 'Terminal Terrestre';
UPDATE stops SET lat = -0.9526, lng = -80.7454 WHERE name = 'ULEAM';
UPDATE stops SET lat = -0.9760, lng = -80.6980 WHERE name = 'Urbirrios';
UPDATE stops SET lat = -0.9598, lng = -80.6749 WHERE name = 'Villamarina';

-- Verificar actualizaciones
SELECT COUNT(*) as total_stops, 
       COUNT(CASE WHEN lat IS NOT NULL AND lng IS NOT NULL THEN 1 END) as stops_con_coords
FROM stops;

-- Ver muestra de datos actualizados
SELECT name, lat, lng FROM stops LIMIT 10;
