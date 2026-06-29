import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDocumentTitle } from '../hooks/use-document-title'
import { useProfile } from '../hooks/use-profile'
import { useAuthStore } from '../stores/auth-store'
import { useAccessibilityStore } from '../stores/accessibility-store'
import { Modal } from '../components/ui/Modal'
import {
  useAddLocation,
  useDeleteLocation,
  useSavedLocations,
} from '../hooks/use-profile-data'
import type { TextSize } from '../types'

// =====================================================================
// ProfilePage — Perfil del usuario "Manta Mobility".
// Datos de identidad reales (Supabase `profiles` cuando hay sesión),
// preferencias de notificación (localStorage), ubicaciones guardadas
// (Supabase, por dispositivo) y configuración de accesibilidad cableada
// al store real. WCAG 2.2 AA: switches con role, labels y contraste.
// =====================================================================

const USER_TYPE_LABELS: Record<string, string> = {
  comun: 'Usuario Común',
  adulto_mayor: 'Adulto Mayor',
  turista: 'Turista',
  operador: 'Operador',
  admin: 'Administrador',
}

const TEXT_SIZES: Array<{ value: TextSize; label: string; short: string }> = [
  { value: 'small', label: 'Pequeño', short: 'S' },
  { value: 'normal', label: 'Normal', short: 'M' },
  { value: 'large', label: 'Grande', short: 'L' },
  { value: 'xlarge', label: 'Muy Grande', short: 'XL' },
]

const NOTIF_KEY = 'manta-notif-prefs'
function loadNotif(): { push: boolean; sms: boolean } {
  try {
    const raw = localStorage.getItem(NOTIF_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* localStorage no disponible */
  }
  return { push: true, sms: false }
}

interface ToggleRowProps {
  label: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
}

function ToggleRow({ label, description, checked, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between gap-md py-sm">
      <div>
        <p className="font-body-md font-semibold text-on-surface">{label}</p>
        <p className="font-label-lg text-on-surface-variant">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={[
          'relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-3',
          checked ? 'bg-primary' : 'bg-outline',
        ].join(' ')}
      >
        <span
          className={[
            'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all',
            checked ? 'left-[1.375rem]' : 'left-0.5',
          ].join(' ')}
          aria-hidden="true"
        />
      </button>
    </div>
  )
}

export function ProfilePage() {
  useDocumentTitle('Mi perfil')
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const signOut = useAuthStore((s) => s.signOut)
  const { data: profile } = useProfile()
  const { preferences, setPreference } = useAccessibilityStore()

  const { data: locations = [] } = useSavedLocations()
  const addLocation = useAddLocation()
  const deleteLocation = useDeleteLocation()

  const [notif, setNotif] = useState(loadNotif)
  const [adding, setAdding] = useState(false)
  const [newLabel, setNewLabel] = useState('')
  const [newAddress, setNewAddress] = useState('')
  const [deletingLoc, setDeletingLoc] = useState<string | null>(null)

  const updateNotif = (key: 'push' | 'sms', value: boolean) => {
    const next = { ...notif, [key]: value }
    setNotif(next)
    try {
      localStorage.setItem(NOTIF_KEY, JSON.stringify(next))
    } catch {
      /* localStorage no disponible */
    }
  }

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Usuario Invitado'
  const userTypeLabel = profile ? USER_TYPE_LABELS[profile.user_type] ?? profile.user_type : 'Invitado'

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const handleAddLocation = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newLabel.trim()) return
    addLocation.mutate(
      { label: newLabel.trim(), address: newAddress.trim() },
      {
        onSuccess: () => {
          setNewLabel('')
          setNewAddress('')
          setAdding(false)
        },
      },
    )
  }

  return (
    <main id="main-content" className="mx-auto max-w-5xl space-y-6">
      {/* Tarjeta de identidad */}
      <section
        aria-labelledby="profile-title"
        className="flex flex-wrap items-center gap-6 rounded-2xl border border-outline-variant bg-white p-6 shadow-sm"
      >
        <span className="flex h-24 w-24 items-center justify-center rounded-full bg-primary text-3xl font-bold text-on-primary">
          {displayName.slice(0, 2).toUpperCase()}
        </span>
        <div className="flex-1">
          <h1 id="profile-title" className="text-3xl font-bold text-gray-900">
            {displayName}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-secondary-container px-3 py-1 text-sm font-semibold text-on-secondary-container">
              {userTypeLabel}
            </span>
            <span className="rounded-full bg-surface-container px-3 py-1 text-sm font-semibold text-on-surface-variant">
              {user ? `ID: MT-${user.id.slice(0, 5).toUpperCase()}` : 'Sesión de invitado'}
            </span>
          </div>
          <p className="mt-2 text-gray-700">
            {profile?.email ?? user?.email ?? 'Inicia sesión para sincronizar tu cuenta en todos tus dispositivos.'}
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Preferencias de notificación */}
        <section
          aria-labelledby="notif-title"
          className="rounded-2xl border border-outline-variant bg-white p-6 shadow-sm"
        >
          <h2 id="notif-title" className="flex items-center gap-2 text-xl font-bold text-primary">
            <span className="material-symbols-outlined">notifications</span>
            Preferencias de Notificación
          </h2>
          <div className="mt-4 divide-y divide-outline-variant">
            <ToggleRow
              label="Notificaciones Push"
              description="Alertas de tráfico en tiempo real"
              checked={notif.push}
              onChange={(v) => updateNotif('push', v)}
            />
            <ToggleRow
              label="Notificaciones SMS"
              description="Alertas críticas y seguridad"
              checked={notif.sms}
              onChange={(v) => updateNotif('sms', v)}
            />
          </div>
        </section>

        {/* Ubicaciones guardadas */}
        <section
          aria-labelledby="loc-title"
          className="rounded-2xl border border-outline-variant bg-white p-6 shadow-sm"
        >
          <h2 id="loc-title" className="flex items-center gap-2 text-xl font-bold text-primary">
            <span className="material-symbols-outlined">bookmark</span>
            Ubicaciones Guardadas
          </h2>
          <ul className="mt-4 space-y-2" role="list">
            {locations.map((loc) => (
              <li
                key={loc.id}
                className="flex items-center gap-3 rounded-xl bg-surface-container-low p-3"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-container text-on-primary-container">
                  <span className="material-symbols-outlined">
                    {loc.kind === 'home' ? 'home' : loc.kind === 'work' ? 'work' : 'place'}
                  </span>
                </span>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{loc.label}</p>
                  <p className="text-sm text-on-surface-variant">{loc.address}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setDeletingLoc(loc.id)}
                  className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container focus-visible:outline-3"
                  aria-label={`Eliminar ubicación ${loc.label}`}
                >
                  <span className="material-symbols-outlined text-[20px]">delete</span>
                </button>
              </li>
            ))}
            {locations.length === 0 && (
              <li className="text-on-surface-variant">No tienes ubicaciones guardadas.</li>
            )}
          </ul>

          {adding ? (
            <form onSubmit={handleAddLocation} className="mt-3 space-y-2 rounded-xl border border-outline-variant p-3">
              <div>
                <label htmlFor="loc-label" className="mb-1 block text-sm font-semibold text-gray-900">
                  Nombre
                </label>
                <input
                  id="loc-label"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="Ej. Universidad"
                  autoComplete="off"
                  className="w-full rounded-md border border-outline px-3 py-2"
                />
              </div>
              <div>
                <label htmlFor="loc-address" className="mb-1 block text-sm font-semibold text-gray-900">
                  Dirección
                </label>
                <input
                  id="loc-address"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="Ej. Av. Universitaria, ULEAM"
                  autoComplete="street-address"
                  className="w-full rounded-md border border-outline px-3 py-2"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAdding(false)}
                  className="rounded-md px-3 py-2 font-semibold text-on-surface-variant hover:bg-surface-container"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={addLocation.isPending}
                  className="rounded-md bg-primary px-4 py-2 font-semibold text-on-primary hover:opacity-90 disabled:opacity-60"
                >
                  Guardar
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-outline-variant px-4 py-3 font-semibold text-on-surface-variant hover:bg-surface-container focus-visible:outline-3"
            >
              <span className="material-symbols-outlined">add_location_alt</span>
              Añadir nueva ubicación
            </button>
          )}
        </section>
      </div>

      {/* Configuración de accesibilidad (cableada al store real) */}
      <section
        aria-labelledby="a11y-title"
        className="rounded-2xl border border-outline-variant bg-white p-6 shadow-sm"
      >
        <h2 id="a11y-title" className="flex items-center gap-2 text-xl font-bold text-primary">
          <span className="material-symbols-outlined">visibility</span>
          Configuración de Accesibilidad
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-1 divide-y divide-outline-variant">
            <ToggleRow
              label="Alto Contraste"
              description="Optimizar legibilidad visual"
              checked={preferences.highContrast}
              onChange={(v) => setPreference('highContrast', v)}
            />
            <ToggleRow
              label="Fuente Dislexia"
              description="Usar OpenDyslexic adaptada"
              checked={preferences.dyslexiaFont}
              onChange={(v) => setPreference('dyslexiaFont', v)}
            />
          </div>

          <fieldset>
            <legend className="mb-3 font-semibold text-gray-900">Tamaño de Texto</legend>
            <div
              className="flex items-center justify-between"
              role="radiogroup"
              aria-label="Tamaño de texto"
            >
              {TEXT_SIZES.map(({ value, label, short }, i) => (
                <div key={value} className="flex flex-1 items-center">
                  <button
                    type="button"
                    role="radio"
                    aria-checked={preferences.textSize === value}
                    aria-label={label}
                    onClick={() => setPreference('textSize', value)}
                    className={[
                      'flex h-12 w-12 items-center justify-center rounded-full font-bold transition-colors focus-visible:outline-3',
                      preferences.textSize === value
                        ? 'bg-primary text-on-primary'
                        : 'bg-primary-container/60 text-on-primary-container hover:bg-primary-container',
                    ].join(' ')}
                  >
                    {short}
                  </button>
                  {i < TEXT_SIZES.length - 1 && <span className="h-px flex-1 bg-outline-variant" aria-hidden="true" />}
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-sm text-on-surface-variant">
              {TEXT_SIZES.map(({ value, label }) => (
                <span key={value} className="w-12 text-center">
                  {label}
                </span>
              ))}
            </div>
          </fieldset>
        </div>
      </section>

      {/* Cerrar sesión */}
      <div className="flex flex-col items-center gap-2 pb-4">
        {user ? (
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-2 rounded-xl border-2 border-error px-8 py-3 font-bold text-error hover:bg-error-container focus-visible:outline-3"
          >
            <span className="material-symbols-outlined">logout</span>
            Cerrar Sesión
          </button>
        ) : (
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 rounded-xl bg-primary px-8 py-3 font-bold text-on-primary hover:opacity-90 focus-visible:outline-3"
          >
            <span className="material-symbols-outlined">login</span>
            Iniciar Sesión
          </button>
        )}
        <p className="text-sm text-on-surface-variant">Manta Mobility v4.2.0-stable</p>
      </div>
      {deletingLoc && (
        <Modal isOpen onClose={() => setDeletingLoc(null)} title="Eliminar ubicación">
          <p className="font-body-md text-on-surface">
            ¿Estás seguro de que deseas eliminar esta ubicación guardada? Esta acción no se puede deshacer.
          </p>
          <div className="mt-lg flex justify-end gap-sm">
            <button
              type="button"
              onClick={() => setDeletingLoc(null)}
              className="rounded-xl border border-outline-variant px-lg py-2.5 font-body-md font-semibold text-on-surface transition-colors hover:bg-surface-container focus-visible:outline-3"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => {
                deleteLocation.mutate(deletingLoc)
                setDeletingLoc(null)
              }}
              className="rounded-xl bg-error px-lg py-2.5 font-body-md font-bold text-on-error transition-opacity hover:opacity-90 focus-visible:outline-3"
            >
              Eliminar
            </button>
          </div>
        </Modal>
      )}
    </main>
  )
}

export default ProfilePage
