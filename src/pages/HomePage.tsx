import { useNavigate } from 'react-router-dom'
import { useDocumentTitle } from '../hooks/use-document-title'
import { useRoutes } from '../hooks/use-transit-data'

export function HomePage() {
  useDocumentTitle('Inicio')
  const navigate = useNavigate()
  const { data: routes = [] } = useRoutes()

  // Toma una incidencia real de la red: la primera ruta con retraso o fuera de servicio.
  const affected = routes.find((r) => r.status === 'delayed' || r.status === 'off_line')
  const serviceTitle = affected
    ? affected.status === 'off_line'
      ? `${affected.name} (${affected.code}) fuera de servicio`
      : `${affected.name} (${affected.code}) con retraso`
    : 'Servicio operando con normalidad'
  const serviceDetail = affected
    ? `Tramo ${affected.origin ?? '—'} → ${affected.destination ?? '—'}. Frecuencia habitual cada ${affected.frequency_minutes} min.`
    : 'Todas las rutas de la red circulan según su horario previsto.'

  return (
    <section aria-labelledby="home-title" className="space-y-8">
      <div className="space-y-3">
        <h1 id="home-title" className="text-3xl font-bold text-gray-900 md:text-4xl">
          Inicio
        </h1>
        <p className="max-w-2xl text-gray-700">
          Consulta el estado del sistema, busca rutas y accede rápido a las funciones principales del transporte urbano.
        </p>
      </div>

      <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Actualización del servicio</p>
              <h2 className="mt-1 text-2xl font-bold text-gray-900">{serviceTitle}</h2>
              <p className="mt-2 text-gray-700">{serviceDetail}</p>
            </div>
            <button type="button" className="rounded-md border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-700" onClick={() => navigate('/rutas')}>
              Ver rutas
            </button>
          </div>

          <form className="grid gap-4 md:grid-cols-[1fr_1fr_auto]" onSubmit={(event) => {
            event.preventDefault()
            navigate('/rutas')
          }} aria-label="Búsqueda rápida de rutas">
            <div>
              <label htmlFor="origin" className="mb-2 block text-sm font-semibold text-gray-900">Origen</label>
              <input id="origin" type="text" className="w-full rounded-md border border-gray-300 px-4 py-3 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100" placeholder="Ingresa tu punto de partida" />
            </div>
            <div>
              <label htmlFor="destination" className="mb-2 block text-sm font-semibold text-gray-900">Destino</label>
              <input id="destination" type="text" className="w-full rounded-md border border-gray-300 px-4 py-3 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100" placeholder="Ingresa tu destino" />
            </div>
            <button type="submit" className="rounded-md bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2">
              Buscar
            </button>
          </form>
        </article>

        <aside className="space-y-4 rounded-2xl border border-gray-200 bg-gray-50 p-6 shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Accesos rápidos</h2>
            <p className="mt-1 text-gray-700">Navega a las secciones que más usas.</p>
          </div>

          <div className="grid gap-3">
            <button type="button" onClick={() => navigate('/rutas')} className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-left font-medium text-gray-900 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-700">
              Buscar rutas
            </button>
            <button type="button" onClick={() => navigate('/perfil')} className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-left font-medium text-gray-900 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-700">
              Mi perfil
            </button>
            <button type="button" onClick={() => navigate('/login')} className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-left font-medium text-gray-900 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-700">
              Iniciar sesión
            </button>
          </div>

          <div className="rounded-xl bg-white p-4">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Mapa en vivo</p>
            <p className="mt-2 text-sm text-gray-700">
              Abre la vista de rutas para revisar el estado de la red y el seguimiento en tiempo real.
            </p>
            <button type="button" onClick={() => navigate('/rutas')} className="mt-4 rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2">
              Abrir mapa
            </button>
          </div>
        </aside>
      </section>
    </section>
  )
}

export default HomePage
