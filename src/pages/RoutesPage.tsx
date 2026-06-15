import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MantaMap } from '../components/map'
import type { MapVehicle } from '../components/map'
import { useDocumentTitle } from '../hooks/use-document-title'
import { useRouteStops, useRoutes, useVehicles } from '../hooks/use-transit-data'
import { useValidatedStops } from '../hooks/use-stop-validation'
import { useFavoriteRoutes, useToggleFavorite } from '../hooks/use-profile-data'
import { Spinner } from '../components/ui/Spinner'

type Capacity = 'low' | 'medium' | 'high'

const CAPACITY: Record<Capacity, { label: string; color: string; icon: string }> = {
  low: { label: 'Baja Ocupación', color: 'text-green-600', icon: 'group' },
  medium: { label: 'Ocupación Media', color: 'text-amber-600', icon: 'groups' },
  high: { label: 'Alta Ocupación', color: 'text-red-600', icon: 'groups_2' },
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  on_time: { label: 'Servicio Normal', color: 'bg-green-100 text-green-800' },
  delayed: { label: 'Con retraso', color: 'bg-amber-100 text-amber-900' },
  off_line: { label: 'Fuera de servicio', color: 'bg-gray-200 text-gray-700' },
}

function capacityFromLoad(load: number): Capacity {
  if (load < 50) return 'low'
  if (load < 80) return 'medium'
  return 'high'
}

function etaAt(minutesFromNow: number): string {
  const d = new Date(Date.now() + minutesFromNow * 60000)
  return d.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })
}

export function RoutesPage() {
  useDocumentTitle('Rutas disponibles')

  const { data: routes = [], isLoading, isError } = useRoutes()
  const [searchParams] = useSearchParams()
  const urlQuery = searchParams.get('q') ?? ''

  // Obtener la primera ruta del filtro o la primera disponible
  const filtered = useMemo(() => {
    const q = urlQuery.trim().toLowerCase()
    if (!q) return routes
    return routes.filter(
      (r) =>
        r.code.toLowerCase().includes(q) ||
        r.name.toLowerCase().includes(q) ||
        (r.origin ?? '').toLowerCase().includes(q) ||
        (r.destination ?? '').toLowerCase().includes(q),
    )
  }, [routes, urlQuery])

  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(
    filtered.length > 0 ? filtered[0].id : null,
  )

  const selectedRoute = routes.find((r) => r.id === selectedRouteId) ?? routes[0] ?? null
  const { data: rawStops = [], isLoading: stopsLoading } = useRouteStops(selectedRoute?.id ?? null)
  const stops = useValidatedStops(rawStops)
  const { data: vehicles = [] } = useVehicles()
  const { data: favorites = [] } = useFavoriteRoutes()
  const toggleFavorite = useToggleFavorite()

  const routeVehicles = selectedRoute ? vehicles.filter((v) => v.route_id === selectedRoute.id) : []
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

  const isFavorite = selectedRoute ? favorites.includes(selectedRoute.id) : false

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (isError || !selectedRoute) {
    return (
      <div className="space-y-6">
        <p className="text-red-800" role="alert">
          No se pudieron cargar las rutas. Inténtalo de nuevo más tarde.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 lg:h-[calc(100vh-9rem)] lg:flex-row">
      {/* Panel lateral izquierdo */}
      <section
        aria-label="Selector y detalle de ruta"
        className="flex w-full shrink-0 flex-col lg:w-96"
      >
        {/* Selector de línea/ruta */}
        <div className="space-y-3">
          <label htmlFor="route-selector" className="block text-sm font-semibold text-gray-900">
            Selecciona una línea
          </label>
          <select
            id="route-selector"
            value={selectedRouteId ?? ''}
            onChange={(e) => setSelectedRouteId(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            aria-describedby="route-count"
          >
            <option value="">-- Selecciona una ruta --</option>
            {filtered.map((route) => (
              <option key={route.id} value={route.id}>
                {route.code} · {route.name}
              </option>
            ))}
          </select>
          <p id="route-count" className="text-sm text-gray-600">
            {filtered.length} {filtered.length === 1 ? 'ruta encontrada' : 'rutas encontradas'}
          </p>
        </div>

        {/* Información de la ruta seleccionada */}
        {selectedRoute && (
          <div className="mt-6 space-y-4 overflow-y-auto flex-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-blue-700">
                  {selectedRoute.code}
                </span>
                <h2 className="mt-2 text-2xl font-bold text-gray-900">{selectedRoute.name}</h2>
              </div>
              <button
                type="button"
                onClick={() => toggleFavorite.mutate({ routeId: selectedRoute.id, isFavorite })}
                aria-pressed={isFavorite}
                aria-label={isFavorite ? 'Quitar de favoritas' : 'Guardar como favorita'}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white text-blue-700 transition-colors hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={isFavorite ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  star
                </span>
              </button>
            </div>

            <p className="text-gray-700">
              {selectedRoute.origin ?? '—'} <span aria-hidden="true">→</span> {selectedRoute.destination ?? '—'}
            </p>

            <div className={`rounded-lg px-4 py-3 font-semibold ${STATUS_LABEL[selectedRoute.status]?.color || ''}`}>
              {STATUS_LABEL[selectedRoute.status]?.label || 'Estado desconocido'}
            </div>

            <dl className="grid grid-cols-2 gap-4 text-sm text-gray-700">
              <div>
                <dt className="font-semibold">Frecuencia</dt>
                <dd>cada {selectedRoute.frequency_minutes} min</dd>
              </div>
              <div>
                <dt className="font-semibold">Duración</dt>
                <dd>{selectedRoute.estimated_time_minutes} min</dd>
              </div>
              <div>
                <dt className="font-semibold">Tarifa</dt>
                <dd>${selectedRoute.cost.toFixed(2)}</dd>
              </div>
              <div>
                <dt className="font-semibold">Ocupación</dt>
                <dd className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">groups</span>
                  {avgLoad}%
                </dd>
              </div>
            </dl>

            {/* Paradas */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wide text-gray-600">
                Próximas paradas
              </h3>
              {stopsLoading ? (
                <div className="flex justify-center py-4">
                  <Spinner />
                </div>
              ) : (
                <ol className="space-y-2" aria-label="Paradas del recorrido">
                  {stops.map((stop, index) => {
                    const cap = CAPACITY[capacityFromLoad(avgLoad + index * 5)]
                    return (
                      <li
                        key={stop.id}
                        className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white p-3"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                            {index + 1}
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1">
                              <p className="font-semibold text-gray-900 truncate">{stop.name}</p>
                              {stop.corrected && (
                                <span
                                  className="inline-block w-1.5 h-1.5 bg-amber-500 rounded-full"
                                  title="Ubicación ajustada automáticamente"
                                  aria-label="Ubicación corregida"
                                />
                              )}
                            </div>
                            <p className={`flex items-center gap-1 text-xs font-semibold ${cap.color}`}>
                              <span className="material-symbols-outlined text-[12px]">{cap.icon}</span>
                              {cap.label}
                            </p>
                          </div>
                        </div>
                        <span className="shrink-0 rounded bg-gray-100 px-2 py-1 text-xs font-bold text-gray-900">
                          {etaAt(index * selectedRoute.frequency_minutes + 5)}
                        </span>
                      </li>
                    )
                  })}
                  {stops.length === 0 && (
                    <li className="text-gray-700 text-sm">Cargando paradas…</li>
                  )}
                </ol>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Mapa a la derecha */}
      <section aria-label="Mapa de la ruta" className="hidden flex-1 lg:block">
        <MantaMap vehicles={mapVehicles} stops={stops} routePath={stops} />
      </section>
    </div>
  )
}

export default RoutesPage

