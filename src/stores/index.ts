// Nota: auth-store importa el cliente Supabase, que exige variables de entorno.
// Importar cada store directamente desde su archivo evita cargar Supabase
// cuando solo se necesita el store de accesibilidad.
export * from './accessibility-store'
