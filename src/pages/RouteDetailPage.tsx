import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { MantaMap } from '../components/map'
import type { MapVehicle } from '../components/map'
import { useDocumentTitle } from '../hooks/use-document-title'
import { useRouteStops, useRoutes, useVehicles } from '../hooks/use-transit-data'
import { useFavoriteRoutes, useToggleFavorite } from '../hooks/use-profile-data'

// =====================================================================
// RouteDetailPage — Detalle de una línea de transporte.
// Mapa con el recorrido real (route_stops), lista de paradas con horario
// estimado y capacidad (derivada de la carga de los vehículos reales) y
// botón "Guardar como favorita" (tabla favorite_routes). WCAG 2.2 AA.
// =====================================================================

type Capacity = 'low' | 'medium' | 'high'

const CAPACITY: Record<Capacity, { label: string; color: string; icon: string }> = {
  low: { label: 'Baja Ocupación', color: 'text-secondary', icon: 'group' },
  medium: { label: 'Ocupación Media', color: 'text-[#6b4e00]', icon: 'groups' },
  high: { label: 'Alta Ocupación', color: 'text-error', icon: 'groups_2' },
}

/** Capacidad a partir del % de carga del vehículo. */
function capacityFromLoad(load: number): Capacity {
  if (load < 50) return 'low'
  if (load < 80) return 'medium'
  return 'high'
}

/** Hora estimada de paso sumando minutos a la hora actual. */
function etaAt(minutesFromNow: number): string {
  const d = new Date(Date.now() + minutesFromNow * 60000)
  return d.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })
}

export default function RouteDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: routes = [] } = useRoutes()
  const route = routes.find((r) => r.id === id) ?? routes[0]
  useDocumentTitle(route ? `${route.code} · ${route.name}` : 'Detalle de ruta')

  const { data: stops = [] } = useRouteStops(route?.id ?? null)
  const { data: vehicles = [] } = useVehicles()
  const { data: favorites = [] } = useFavoriteRoutes()
  const toggleFavorite = useToggleFavorite()

  const routeVehicles = vehicles.filter((v) => v.route_id === route?.id)
  const avgLoad = routeVehicles.length
    ? Math.round(routeVehicles.reduce((s, v) => s + v.load_percent, 0) / routeVehicles.length)
    : 45

  const mapVehicles = useMemo<MapVehicle[]>(
    () =>
      routeVehicles.map((v) => ({
        id: v.id,
        plate: v.plate,
        lat: v.lat,
        lng: v.lng,
        status: v.status,
        routeLabel: v.route ? `${v.route.code} · ${v.route.name}` : undefined,
      })),
    [routeVehicles],
  )

  const isFavorite = route ? favorites.includes(route.id) : false
  const isOnline = route?.status !== 'off_line'

  if (!route) {
    return <p className="mt-lg font-body-md text-on-surface-variant">Cargando ruta…</p>
  }

  return (
    <div className="flex flex-col gap-lg lg:h-[calc(100vh-9rem)] lg:flex-row">
        {/* Panel de la ruta */}
        <section
          aria-label={`Detalle de la línea ${route.code}`}
          className="flex w-full shrink-0 flex-col lg:w-[24rem]"
        >
          <div className="flex items-start justify-between gap-md">
            <div>
              <span className="inline-flex items-center gap-xs rounded-full bg-primary px-3 py-1 font-label-md font-bold text-on-primary">
                {route.code}
              </span>
              <h1 className="mt-sm text-3xl font-bold text-on-surface">{route.name}</h1>
              <p className="mt-xs font-body-md text-on-surface-variant">
                {route.origin ?? '—'} <span aria-hidden="true">→</span> {route.destination ?? '—'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => toggleFavorite.mutate({ routeId: route.id, isFavorite })}
              aria-pressed={isFavorite}
              aria-label={isFavorite ? 'Quitar de favoritas' : 'Guardar como favorita'}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-outline-variant bg-surface-container-lowest text-primary transition-colors hover:bg-surface-container focus-visible:outline-3"
            >
              <span
                className="material-symbols-outlined"
                style={isFavorite ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                star
              </span>
            </button>
          </div>

          <div
            className={[
              'mt-md flex items-center gap-sm rounded-xl px-md py-3 font-body-md font-bold',
              isOnline ? 'bg-secondary-container text-on-secondary-container' : 'bg-error-container text-on-error-container',
            ].join(' ')}
          >
            <span className="material-symbols-outlined">{isOnline ? 'check_circle' : 'cancel'}</span>
            {isOnline ? 'Servicio Normal' : 'Fuera de Servicio'}
          </div>

          {/* Paradas */}
          <h2 className="mt-lg font-label-lg font-bold uppercase tracking-wide text-on-surface-variant">
            Próximas paradas
          </h2>
          <ol className="mt-sm flex-1 space-y-sm overflow-y-auto" aria-label="Paradas del recorrido">
            {stops.map((stop, index) => {
              const cap = CAPACITY[capacityFromLoad(avgLoad + index * 5)]
              return (
                <li
                  key={stop.id}
                  className="flex items-center justify-between gap-md rounded-xl border border-outline-variant bg-surface-container-lowest p-md"
                >
                  <div className="flex items-center gap-sm">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-container font-label-md font-bold text-on-primary-container">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-body-md font-bold text-on-surface">{stop.name}</p>
                      <p className={`flex items-center gap-xs font-label-md font-semibold ${cap.color}`}>
                        <span className="material-symbols-outlined text-[14px]">{cap.icon}</span>
                        {cap.label}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-md bg-surface-container px-2.5 py-1 font-label-lg font-bold text-on-surface">
                    {etaAt(index * route.frequency_minutes + 5)}
                  </span>
                </li>
              )
            })}
            {stops.length === 0 && (
              <li className="font-body-md text-on-surface-variant">Cargando paradas…</li>
            )}
          </ol>

          <button
            type="button"
            onClick={() => toggleFavorite.mutate({ routeId: route.id, isFavorite })}
            className="mt-md w-full rounded-xl bg-primary px-lg py-3 font-body-md font-bold text-on-primary transition-opacity hover:opacity-90 focus-visible:outline-3"
          >
            {isFavorite ? 'Quitar de favoritas' : 'Guardar como favorita'}
          </button>
          <Link
            to="/seguimiento-pago"
            className="mt-sm block rounded-xl border border-outline px-lg py-3 text-center font-body-md font-semibold text-primary transition-colors hover:bg-surface-container focus-visible:outline-3"
          >
            Seguir en vivo y pagar
          </Link>
        </section>

        {/* Mapa */}
        <section
          aria-label={`Mapa del recorrido de la línea ${route.code}`}
          className="relative h-[24rem] flex-1 overflow-hidden rounded-2xl border border-outline-variant shadow-sm lg:h-auto"
        >
          <MantaMap
            routePath={stops}
            vehicles={mapVehicles}
            ariaLabel={`Mapa del recorrido de la línea ${route.code} en Manta`}
          />
          <div className="pointer-events-none absolute bottom-4 right-4 z-[500] max-w-[20rem] rounded-xl bg-surface-bright p-md shadow-md">
            <p className="flex items-center gap-sm font-body-md font-bold text-on-surface">
              <span className="h-2.5 w-2.5 rounded-full bg-secondary" aria-hidden="true" />
              {isOnline ? `Vía libre hacia ${route.destination ?? 'destino'}` : 'Ruta sin servicio'}
            </p>
            <p className="mt-xs font-label-lg text-on-surface-variant">
              Ocupación promedio {avgLoad}%. Próximo bus en {Math.max(2, Math.round(route.frequency_minutes / 3))} min.
            </p>
          </div>
        </section>
    </div>
  )
}
