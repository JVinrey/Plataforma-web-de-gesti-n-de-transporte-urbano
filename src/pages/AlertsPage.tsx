import { useState } from 'react'
import { useDocumentTitle } from '../hooks/use-document-title'
import { useRoutes } from '../hooks/use-transit-data'
import {
  useCreateReminder,
  useDeleteReminder,
  useReminders,
  useToggleReminder,
} from '../hooks/use-reminders'
import { Modal } from '../components/ui/Modal'

// =====================================================================
// AlertsPage — Recordatorios y alertas de transporte.
// CRUD real contra la tabla `reminders` de Supabase (aislada por
// dispositivo en modo invitado). WCAG 2.2 AA: formularios con label,
// estados con aria-live, navegación por teclado y contraste >= 4.5:1.
// =====================================================================

const LEAD_OPTIONS = [
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 60, label: '1 hora' },
]

export default function AlertsPage() {
  useDocumentTitle('Alertas')
  const { data: routes = [] } = useRoutes()
  const { data: reminders = [], isLoading } = useReminders()
  const createReminder = useCreateReminder()
  const toggleReminder = useToggleReminder()
  const deleteReminder = useDeleteReminder()

  const [routeId, setRouteId] = useState('')
  const [time, setTime] = useState('08:30')
  const [lead, setLead] = useState(15)
  const [status, setStatus] = useState<string | null>(null)
  const [deletingAlert, setDeletingAlert] = useState<string | null>(null)

  const pending = reminders.filter((r) => r.active).length
  const selectedRoute = routes.find((r) => r.id === routeId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const chosen = routeId || routes[0]?.id
    if (!chosen) return
    createReminder.mutate(
      { route_id: chosen, departure_time: time, lead_minutes: lead, days: 'Lunes a Viernes' },
      {
        onSuccess: () => setStatus('Recordatorio guardado correctamente.'),
        onError: () => setStatus('No se pudo guardar el recordatorio. Reintenta.'),
      },
    )
  }

  return (
    <main id="main-content" className="mx-auto max-w-6xl">
        <header className="mb-lg">
          <h1 className="text-headline-lg font-bold text-on-surface">Alertas y recordatorios</h1>
          <p className="font-body-md text-on-surface-variant">
            Gestiona tus notificaciones y no pierdas ni un transporte.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-gutter lg:grid-cols-2">
          {/* Formulario: agregar recordatorio */}
          <section
            aria-labelledby="add-reminder"
            className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-lg shadow-sm"
          >
            <h2 id="add-reminder" className="flex items-center gap-sm text-title-lg font-bold text-primary">
              <span className="material-symbols-outlined">add_circle</span>
              Agregar Recordatorio
            </h2>

            <form className="mt-lg space-y-md" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="reminder-route" className="mb-xs block font-label-lg font-semibold text-on-surface">
                  Seleccionar Ruta
                </label>
                <select
                  id="reminder-route"
                  value={routeId}
                  onChange={(e) => setRouteId(e.target.value)}
                  className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-md py-3 font-body-md text-on-surface focus:ring-2 focus:ring-primary"
                >
                  <option value="">Elige una ruta…</option>
                  {routes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.code} - {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="reminder-time" className="mb-xs block font-label-lg font-semibold text-on-surface">
                  Hora de Salida
                </label>
                <input
                  id="reminder-time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-md py-3 font-body-md text-on-surface focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <span className="mb-xs block font-label-lg font-semibold text-on-surface">
                  Tiempo de Anticipación
                </span>
                <div className="grid grid-cols-3 gap-sm" role="radiogroup" aria-label="Tiempo de anticipación">
                  {LEAD_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      role="radio"
                      aria-checked={lead === opt.value}
                      onClick={() => setLead(opt.value)}
                      className={[
                        'rounded-xl px-md py-3 font-body-md font-semibold transition-colors focus-visible:outline-3',
                        lead === opt.value
                          ? 'bg-primary text-on-primary'
                          : 'bg-primary-container/50 text-on-surface-variant hover:bg-primary-container',
                      ].join(' ')}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={createReminder.isPending}
                className="w-full rounded-xl bg-primary px-lg py-3 font-body-md font-bold text-on-primary transition-opacity hover:opacity-90 disabled:opacity-60 focus-visible:outline-3"
              >
                {createReminder.isPending ? 'Guardando…' : 'Guardar Alerta'}
              </button>
              <p role="status" aria-live="polite" className="min-h-5 font-label-lg text-secondary">
                {status}
              </p>
            </form>

            {/* Vista previa de notificación */}
            <div className="mt-lg rounded-2xl bg-inverse-surface p-md text-inverse-on-surface">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-sm">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
                    <span className="material-symbols-outlined text-[20px]">directions_bus</span>
                  </span>
                  <div>
                    <p className="font-label-lg font-semibold">Vista Previa de Notificación</p>
                    <p className="font-label-md opacity-70">Ahora mismo</p>
                  </div>
                </div>
                <span className="material-symbols-outlined opacity-60">notifications</span>
              </div>
              <p className="mt-md font-body-md font-bold">¡Tu transporte se acerca!</p>
              <p className="font-body-md opacity-90">
                La {selectedRoute ? selectedRoute.code : 'ruta seleccionada'} llegará en {lead} minutos a tu
                parada habitual.
              </p>
            </div>
          </section>

          {/* Alertas activas */}
          <section aria-labelledby="active-alerts" className="space-y-gutter">
            <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-lg shadow-sm">
              <div className="mb-md flex items-center justify-between">
                <h2 id="active-alerts" className="flex items-center gap-sm text-title-lg font-bold text-primary">
                  <span className="material-symbols-outlined">alarm_on</span>
                  Alertas Activas
                </h2>
                <span className="rounded-full bg-primary px-3 py-1 font-label-md font-semibold text-on-primary">
                  {pending} Pendientes
                </span>
              </div>

              {isLoading && (
                <p className="py-lg text-center font-body-md text-on-surface-variant">Cargando alertas…</p>
              )}
              {!isLoading && reminders.length === 0 && (
                <p className="rounded-xl bg-surface-container px-md py-lg text-center font-body-md text-on-surface-variant">
                  Aún no tienes recordatorios. Crea el primero con el formulario.
                </p>
              )}

              <ul className="space-y-sm" role="list">
                {reminders.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center gap-md rounded-xl bg-surface-container-low p-md"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
                      <span className="material-symbols-outlined">directions_bus</span>
                    </span>
                    <div className="flex-1">
                      <p className="font-body-md font-bold text-on-surface">
                        {r.route ? `${r.route.code} - ${r.route.name}` : 'Ruta'}
                      </p>
                      <p className="font-label-lg text-on-surface-variant">
                        {r.days} · <span className="font-bold">{r.departure_time}</span> · aviso {r.lead_minutes} min antes
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={r.active}
                      aria-label={`${r.active ? 'Desactivar' : 'Activar'} alerta de ${r.route?.code ?? 'ruta'}`}
                      onClick={() => toggleReminder.mutate({ id: r.id, active: !r.active })}
                      className={[
                        'relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-3',
                        r.active ? 'bg-secondary' : 'bg-outline',
                      ].join(' ')}
                    >
                      <span
                        className={[
                          'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all',
                          r.active ? 'left-[1.375rem]' : 'left-0.5',
                        ].join(' ')}
                        aria-hidden="true"
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingAlert(r.id)}
                      className="rounded-lg p-2 text-error transition-colors hover:bg-error-container focus-visible:outline-3"
                      aria-label={`Eliminar alerta de ${r.route?.code ?? 'ruta'}`}
                    >
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Banner */}
            <div className="overflow-hidden rounded-2xl bg-primary p-lg text-on-primary">
              <h3 className="text-title-lg font-bold">Manta se mueve contigo</h3>
              <p className="mt-xs font-body-md opacity-90">
                98% de precisión en nuestras alertas en tiempo real.
              </p>
            </div>
          </section>
        </div>

      {deletingAlert && (
        <Modal isOpen onClose={() => setDeletingAlert(null)} title="Eliminar alerta">
          <p className="font-body-md text-on-surface">
            ¿Estás seguro de que deseas eliminar esta alerta? Dejarás de recibir notificaciones para este recordatorio.
          </p>
          <div className="mt-lg flex justify-end gap-sm">
            <button
              type="button"
              onClick={() => setDeletingAlert(null)}
              className="rounded-xl border border-outline-variant px-lg py-2.5 font-body-md font-semibold text-on-surface transition-colors hover:bg-surface-container focus-visible:outline-3"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => {
                deleteReminder.mutate(deletingAlert)
                setDeletingAlert(null)
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
