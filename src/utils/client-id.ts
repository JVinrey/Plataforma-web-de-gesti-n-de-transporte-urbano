// Identificador anónimo y estable por navegador (modo invitado del demo).
// Permite aislar los recordatorios de cada dispositivo sin requerir login.
const STORAGE_KEY = 'manta-transit-client-id'

export function getClientId(): string {
  if (typeof window === 'undefined') return 'server'
  let id = window.localStorage.getItem(STORAGE_KEY)
  if (!id) {
    id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `c_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`
    window.localStorage.setItem(STORAGE_KEY, id)
  }
  return id
}
