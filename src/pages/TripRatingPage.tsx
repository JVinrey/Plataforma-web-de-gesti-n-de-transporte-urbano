import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDocumentTitle } from '../hooks/use-document-title'
import { useRoutes } from '../hooks/use-transit-data'
import { useSubmitFeedback } from '../hooks/use-feedback'

// =====================================================================
// TripRatingPage — ¿Cómo fue tu viaje? (calificación de viaje finalizado).
// Escribe en la tabla `feedback` real de Supabase. WCAG 2.2 AA:
// estrellas como radiogroup operable por teclado, label en comentarios,
// estados con aria-live y contraste >= 4.5:1.
// =====================================================================

interface StarRatingProps {
  label: string
  value: number
  onChange: (v: number) => void
  size?: 'sm' | 'lg'
}

/** Grupo de estrellas accesible (radiogroup, operable con flechas/teclado). */
function StarRating({ label, value, onChange, size = 'sm' }: StarRatingProps) {
  const px = size === 'lg' ? 'text-[40px]' : 'text-[24px]'

  const handleKeyDown = (e: React.KeyboardEvent, currentStar: number) => {
    let nextStar = currentStar
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      nextStar = currentStar < 5 ? currentStar + 1 : 1
      e.preventDefault()
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      nextStar = currentStar > 1 ? currentStar - 1 : 5
      e.preventDefault()
    }
    if (nextStar !== currentStar) {
      onChange(nextStar)
      const btn = e.currentTarget.parentElement?.childNodes[nextStar - 1] as HTMLElement | undefined
      btn?.focus()
    }
  }

  return (
    <div role="radiogroup" aria-label={label} className="flex items-center gap-xs">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          tabIndex={value === star || (value === 0 && star === 1) ? 0 : -1}
          aria-label={`${star} de 5 estrellas`}
          onClick={() => onChange(star)}
          onKeyDown={(e) => handleKeyDown(e, star)}
          className="rounded p-0.5 transition-transform hover:scale-110 focus-visible:outline-3"
        >
          <span
            className={`material-symbols-outlined ${px} ${
              star <= value ? 'text-[#e8a200]' : 'text-outline-variant'
            }`}
            style={star <= value ? { fontVariationSettings: "'FILL' 1" } : undefined}
          >
            star
          </span>
        </button>
      ))}
    </div>
  )
}

const SUB_CRITERIA = [
  { key: 'punctuality', label: 'Puntualidad', icon: 'schedule' },
  { key: 'comfort', label: 'Comodidad', icon: 'airline_seat_recline_normal' },
  { key: 'safety', label: 'Seguridad', icon: 'verified_user' },
  { key: 'driver_rating', label: 'Conductor', icon: 'badge' },
] as const

export default function TripRatingPage() {
  useDocumentTitle('Califica tu viaje')
  const navigate = useNavigate()
  const { data: routes = [] } = useRoutes()
  const submit = useSubmitFeedback()

  // Viaje "finalizado" tomado de una ruta real (la primera operativa).
  const trip = useMemo(() => routes.find((r) => r.status !== 'off_line') ?? routes[0], [routes])

  const [overall, setOverall] = useState(0)
  const [scores, setScores] = useState({ punctuality: 0, comfort: 0, safety: 0, driver_rating: 0 })
  const [comment, setComment] = useState('')
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const setScore = (key: keyof typeof scores, v: number) =>
    setScores((prev) => ({ ...prev, [key]: v }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (overall === 0) {
      setError('Selecciona una calificación general antes de enviar.')
      return
    }
    if (!trip) return
    submit.mutate(
      {
        route_id: trip.id,
        rating: overall,
        punctuality: scores.punctuality,
        comfort: scores.comfort,
        safety: scores.safety,
        driver_rating: scores.driver_rating,
        comment,
        duration_minutes: trip.estimated_time_minutes,
        vehicle_code: 'MT-0428',
        vehicle_type: 'Eléctrico',
      },
      {
        onSuccess: () => setDone(true),
        onError: () => setError('No se pudo enviar la calificación. Reintenta.'),
      },
    )
  }

  return (
    <main id="main-content" className="mx-auto max-w-4xl space-y-gutter">
        {/* Encabezado del viaje */}
        <header className="flex items-center justify-between overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest p-lg shadow-sm">
          <div>
            <span className="inline-flex items-center gap-xs rounded-full bg-secondary-container px-3 py-1 font-label-md font-bold text-on-secondary-container">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              Viaje Finalizado
            </span>
            <h1 className="mt-sm text-headline-lg font-bold text-on-surface">¿Cómo fue tu viaje?</h1>
            <p className="font-title-lg font-semibold text-primary">
              {trip ? `${trip.code} - ${trip.name}` : 'Ruta'}
            </p>
          </div>
          <span
            className="hidden h-24 w-40 items-center justify-center rounded-xl bg-inverse-surface text-inverse-on-surface sm:flex"
            aria-hidden="true"
          >
            <span className="material-symbols-outlined text-[40px]">map</span>
          </span>
        </header>

        {done ? (
          <section
            role="status"
            aria-live="polite"
            className="rounded-2xl border border-secondary bg-secondary-container p-xl text-center text-on-secondary-container"
          >
            <span className="material-symbols-outlined text-[48px] text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
              task_alt
            </span>
            <h2 className="mt-sm text-title-lg font-bold">¡Gracias por tu calificación!</h2>
            <p className="mt-xs font-body-md">Tu opinión ayuda a mejorar el transporte de Manta.</p>
            <button
              type="button"
              onClick={() => navigate('/historial')}
              className="mt-lg rounded-xl bg-primary px-lg py-3 font-body-md font-bold text-on-primary hover:opacity-90 focus-visible:outline-3"
            >
              Volver al historial
            </button>
          </section>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-gutter">
            {/* Calificación general + subcriterios */}
            <section className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-lg shadow-sm">
              <p className="text-center font-label-lg font-bold uppercase tracking-wide text-on-surface-variant">
                Calificación general
              </p>
              <div className="mt-md flex flex-col items-center">
                <StarRating label="Calificación general" value={overall} onChange={setOverall} size="lg" />
                <div className="mt-xs flex w-full max-w-[20rem] justify-between font-label-lg">
                  <span className="text-on-surface-variant">Malo</span>
                  <span className="font-bold text-secondary">Excelente</span>
                </div>
              </div>

              <div className="mt-lg grid grid-cols-1 gap-md border-t border-outline-variant pt-lg sm:grid-cols-2">
                {SUB_CRITERIA.map(({ key, label, icon }) => (
                  <div key={key} className="flex items-center justify-between gap-md">
                    <span className="flex items-center gap-sm font-body-md font-semibold text-on-surface">
                      <span className="material-symbols-outlined text-primary">{icon}</span>
                      {label}
                    </span>
                    <StarRating
                      label={label}
                      value={scores[key]}
                      onChange={(v) => setScore(key, v)}
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* Comentarios */}
            <section className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-lg shadow-sm">
              <label htmlFor="comment" className="block font-label-lg font-bold uppercase tracking-wide text-on-surface-variant">
                Comentarios adicionales (opcional)
              </label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                placeholder="Comparte tu experiencia"
                className="mt-md w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-md py-3 font-body-md text-on-surface focus:ring-2 focus:ring-primary"
              />
              {error && (
                <p role="alert" className="mt-sm font-label-lg font-semibold text-error">
                  {error}
                </p>
              )}
              <div className="mt-md flex items-center justify-end gap-md">
                <button
                  type="button"
                  onClick={() => navigate('/historial')}
                  className="rounded-lg px-4 py-2 font-body-md font-semibold text-on-surface-variant hover:bg-surface-container focus-visible:outline-3"
                >
                  Omitir
                </button>
                <button
                  type="submit"
                  disabled={submit.isPending}
                  className="flex items-center gap-sm rounded-xl bg-primary px-lg py-3 font-body-md font-bold text-on-primary transition-opacity hover:opacity-90 disabled:opacity-60 focus-visible:outline-3"
                >
                  {submit.isPending ? 'Enviando…' : 'Enviar calificación'}
                  <span className="material-symbols-outlined text-[20px]">send</span>
                </button>
              </div>
            </section>

            {/* Datos del viaje */}
            <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2">
              <div className="flex items-center gap-md rounded-2xl border-l-4 border-secondary bg-surface-container-lowest p-lg shadow-sm">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary-container text-on-secondary-container">
                  <span className="material-symbols-outlined">directions_bus</span>
                </span>
                <div>
                  <p className="font-label-md uppercase tracking-wide text-on-surface-variant">Unidad Asignada</p>
                  <p className="font-body-md font-bold text-on-surface">MT-0428 · Eléctrico</p>
                </div>
              </div>
              <div className="flex items-center gap-md rounded-2xl border-l-4 border-primary bg-surface-container-lowest p-lg shadow-sm">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-container text-on-primary-container">
                  <span className="material-symbols-outlined">timer</span>
                </span>
                <div>
                  <p className="font-label-md uppercase tracking-wide text-on-surface-variant">Duración del Viaje</p>
                  <p className="font-body-md font-bold text-on-surface">
                    {trip ? `${trip.estimated_time_minutes} minutos` : '—'}
                  </p>
                </div>
              </div>
            </div>
          </form>
        )}
    </main>
  )
}
