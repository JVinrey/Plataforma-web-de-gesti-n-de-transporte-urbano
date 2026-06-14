import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDocumentTitle } from '../hooks/use-document-title'
import { useRoutes } from '../hooks/use-transit-data'
import type { RouteRow } from '../hooks/use-transit-data'

const STATUS_LABEL: Record<RouteRow['status'], { label: string; color: string }> = {
  on_time: { label: 'A tiempo', color: 'bg-green-100 text-green-800' },
  delayed: { label: 'Con retraso', color: 'bg-amber-100 text-amber-900' },
  off_line: { label: 'Fuera de servicio', color: 'bg-gray-200 text-gray-700' },
}

export function RoutesPage() {
  useDocumentTitle('Búsqueda de rutas')

  const { data: routes = [], isLoading, isError } = useRoutes()
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return routes
    return routes.filter(
      (r) =>
        r.code.toLowerCase().includes(q) ||
        r.name.toLowerCase().includes(q) ||
        (r.origin ?? '').toLowerCase().includes(q) ||
        (r.destination ?? '').toLowerCase().includes(q),
    )
  }, [routes, query])

  return (
    <section aria-labelledby="routes-title" className="space-y-6">
      <div className="space-y-3">
        <h1 id="routes-title" className="text-3xl font-bold text-gray-900 md:text-4xl">
          Búsqueda de rutas
        </h1>
        <p className="max-w-2xl text-gray-700">
          Consulta todas las rutas de la red de transporte de Manta y su estado en tiempo real.
        </p>
      </div>

      <div className="max-w-md">
        <label htmlFor="route-search" className="mb-2 block text-sm font-semibold text-gray-900">
          Filtrar rutas
        </label>
        <input
          id="route-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Busca por código, nombre, origen o destino"
          className="w-full rounded-md border border-gray-300 px-4 py-3 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {isLoading && (
        <p className="text-gray-700" role="status" aria-live="polite">
          Cargando rutas…
        </p>
      )}

      {isError && (
        <p className="text-red-800" role="alert">
          No se pudieron cargar las rutas. Inténtalo de nuevo más tarde.
        </p>
      )}

      {!isLoading && !isError && (
        <>
          <p className="text-sm text-gray-600" role="status" aria-live="polite">
            {filtered.length} {filtered.length === 1 ? 'ruta encontrada' : 'rutas encontradas'}
          </p>
          <ul className="grid gap-4 md:grid-cols-2" role="list">
            {filtered.map((route) => {
              const badge = STATUS_LABEL[route.status]
              return (
                <li key={route.id}>
                  <article className="h-full rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
                          {route.code}
                        </p>
                        <h2 className="mt-1 text-xl font-bold text-gray-900">{route.name}</h2>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>

                    <p className="mt-3 text-gray-700">
                      {route.origin ?? '—'} <span aria-hidden="true">→</span> {route.destination ?? '—'}
                    </p>

                    <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-700">
                      <div>
                        <dt className="inline font-semibold">Frecuencia: </dt>
                        <dd className="inline">cada {route.frequency_minutes} min</dd>
                      </div>
                      <div>
                        <dt className="inline font-semibold">Duración: </dt>
                        <dd className="inline">{route.estimated_time_minutes} min</dd>
                      </div>
                      <div>
                        <dt className="inline font-semibold">Tarifa: </dt>
                        <dd className="inline">${route.cost.toFixed(2)}</dd>
                      </div>
                    </dl>

                    <Link
                      to={`/rutas/${route.id}`}
                      className="mt-4 inline-block rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2"
                    >
                      Ver ruta y mapa
                    </Link>
                  </article>
                </li>
              )
            })}
            {filtered.length === 0 && (
              <li className="text-gray-700">No hay rutas que coincidan con tu búsqueda.</li>
            )}
          </ul>
        </>
      )}
    </section>
  )
}

export default RoutesPage
