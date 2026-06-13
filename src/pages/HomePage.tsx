import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDocumentTitle } from '../hooks/use-document-title'

export function HomePage() {
  useDocumentTitle('Inicio')
  const navigate = useNavigate()

  const [alertClosed, setAlertClosed] = useState(false)
  const [searchOrigin, setSearchOrigin] = useState('')
  const [searchDestination, setSearchDestination] = useState('')

  const quickActions = [
    {
      id: 'elderly',
      title: 'Modo Adulto Mayor',
      description: 'Interfaz simplificada con botones grandes y alto contraste para una navegación fácil.',
      icon: 'elderly',
      action: 'Activar ahora',
      href: '/?mode=elderly',
      ariaLabel: 'Activar modo para adultos mayores',
    },
    {
      id: 'tourist',
      title: 'Turista',
      description: 'Descubre los puntos de interés de Manta y las mejores rutas para visitarlos.',
      icon: 'map',
      action: 'Explorar mapa',
      href: '/rutas?type=tourist',
      ariaLabel: 'Explorar mapa de sitios turísticos',
    },
    {
      id: 'favorites',
      title: 'Rutas Frecuentes',
      description: 'Guarda tus trayectos habituales para acceder a ellos con un solo toque.',
      icon: 'star',
      action: 'Ver favoritos',
      href: '/rutas?favorites=true',
      ariaLabel: 'Ver rutas frecuentes guardadas',
    },
  ]

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    navigate(`/rutas?origin=${encodeURIComponent(searchOrigin)}&destination=${encodeURIComponent(searchDestination)}`)
  }

  return (
    <div className="space-y-6 pb-10">
      <section className="rounded-3xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm md:p-8">
        {!alertClosed && (
          <div
            className="mb-6 flex flex-col gap-3 rounded-2xl bg-[#FF9800] px-4 py-3 text-[#2b1700] md:flex-row md:items-center md:justify-between"
            role="alert"
            aria-live="polite"
          >
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
                warning
              </span>
              <p className="text-body-md font-medium">
                Actualización de Servicio: Retrasos de 15 min en la Línea Azul debido a mantenimiento preventivo.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAlertClosed(true)}
              className="self-end rounded-md px-2 py-1 text-sm font-semibold hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-black/30 md:self-auto"
              aria-label="Cerrar notificación"
            >
              Cerrar
            </button>
          </div>
        )}

        <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr] xl:items-start">
          <div className="space-y-6">
            <div className="max-w-2xl space-y-4">
              <p className="text-label-lg font-semibold uppercase tracking-[0.2em] text-primary">Manta Transit</p>
              <h1 className="text-display-lg font-display-lg leading-tight text-primary md:text-[64px] md:leading-[1]">
                Tu ciudad,
                <br />
                en movimiento.
              </h1>
              <p className="max-w-xl text-body-lg text-on-surface-variant">
                Planifica tu viaje en tiempo real, consulta horarios y mantente al tanto de cualquier cambio en la red de transporte de Manta.
              </p>
            </div>

            <form onSubmit={handleSearch} className="grid gap-4 rounded-3xl border border-outline-variant bg-surface-container-low p-4 shadow-sm md:grid-cols-[1fr_1fr_auto] md:items-end md:p-5" aria-label="Formulario de búsqueda de rutas">
              <div className="relative">
                <label htmlFor="origin" className="mb-2 block text-label-lg font-semibold text-on-surface">
                  Origen
                </label>
                <div className="flex items-center gap-2 rounded-2xl border border-outline bg-surface-container-lowest px-3 py-2">
                  <span className="material-symbols-outlined text-outline">location_on</span>
                  <input
                    id="origin"
                    className="w-full border-none bg-transparent p-0 text-body-md outline-none placeholder:text-outline"
                    placeholder="Ingresa punto de partida"
                    type="text"
                    value={searchOrigin}
                    onChange={(e) => setSearchOrigin(e.target.value)}
                    aria-required="true"
                    aria-label="Punto de partida"
                  />
                </div>
              </div>

              <div className="relative">
                <label htmlFor="destination" className="mb-2 block text-label-lg font-semibold text-on-surface">
                  Destino
                </label>
                <div className="flex items-center gap-2 rounded-2xl border border-outline bg-surface-container-lowest px-3 py-2">
                  <span className="material-symbols-outlined text-outline">sports_score</span>
                  <input
                    id="destination"
                    className="w-full border-none bg-transparent p-0 text-body-md outline-none placeholder:text-outline"
                    placeholder="¿A dónde quieres ir?"
                    type="text"
                    value={searchDestination}
                    onChange={(e) => setSearchDestination(e.target.value)}
                    aria-required="true"
                    aria-label="Destino del viaje"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#1B5E9B] px-5 font-bold text-on-primary transition-colors hover:bg-[#174e80] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                aria-label="Buscar ruta"
              >
                Buscar Ruta
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </button>
            </form>
          </div>

          <aside className="grid gap-4 rounded-3xl bg-surface-container-low p-5 shadow-sm">
            <div className="rounded-2xl bg-surface-container-high p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container">
                  <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    schedule
                  </span>
                </span>
                <div>
                  <p className="text-label-lg font-semibold text-on-surface">Estado del sistema</p>
                  <p className="text-body-md text-on-surface-variant">142 unidades activas, tráfico moderado</p>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-outline-variant bg-surface-container-high">
              <img
                alt="Mapa en tiempo real de la red de transporte de Manta mostrando líneas de tránsito en azul y verde vibrante"
                className="h-64 w-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCJSZ2oItI3AVf0a9F4mb-Im12M5O5IfOe8iTj7llT6ugH1z5J0iSQrmkkl-hJeP6lrBCsRAAyg7klkg0UE8OsR6MwWsMkRKBGuRG7VETzJkxucD9XYPZbeA1k8oVGmVlSkYsyuWZYs5YRgf10Yh8VTgOprPO-4KlBEv9-iLF3BKeBgMXSwlQiswssbO1fRLxmVrPY1A6bkFG_WblbONcBTvQD9CRIw9-5mNuPKgmHLs20HF4vd7xEfLKa7rihrfCouWerBawww74A"
              />
              <div className="space-y-3 p-4">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-green-500" />
                  <h2 className="text-title-lg font-title-lg text-on-surface">Red en Vivo</h2>
                </div>
                <p className="text-body-md text-on-surface-variant">
                  Actualmente hay 142 unidades circulando. El tráfico es moderado en el centro.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/rutas')}
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-primary px-4 py-3 font-bold text-on-primary transition-colors hover:bg-primary-container focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  aria-label="Abrir mapa interactivo de transporte"
                >
                  Abrir Mapa Interactivo
                </button>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3 px-1">
          <h2 className="text-headline-lg font-headline-lg text-on-surface">Accesos Rápidos</h2>
          <button
            type="button"
            onClick={() => navigate('/rutas')}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-label-lg font-semibold text-primary hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Ver todos los accesos rápidos"
          >
            Ver todo
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {quickActions.map((action) => (
            <button
              key={action.id}
              type="button"
              onClick={() => navigate(action.href)}
              className="group flex h-full flex-col rounded-3xl border border-outline-variant bg-surface-container-lowest p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label={action.ariaLabel}
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container transition-transform group-hover:scale-105">
                <span className="material-symbols-outlined text-[30px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {action.icon}
                </span>
              </div>
              <h3 className="text-title-lg font-title-lg text-on-surface">{action.title}</h3>
              <p className="mt-2 flex-1 text-body-md text-on-surface-variant">{action.description}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-label-lg font-bold text-primary">
                {action.action}
                <span className="material-symbols-outlined text-[16px]">open_in_new</span>
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="overflow-hidden rounded-3xl border border-outline-variant bg-surface-container-high shadow-sm">
          <div className="relative h-[320px]">
            <img
              alt="Vista de mapa con rutas activas del sistema de transporte urbano"
              className="h-full w-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCJSZ2oItI3AVf0a9F4mb-Im12M5O5IfOe8iTj7llT6ugH1z5J0iSQrmkkl-hJeP6lrBCsRAAyg7klkg0UE8OsR6MwWsMkRKBGuRG7VETzJkxucD9XYPZbeA1k8oVGmVlSkYsyuWZYs5YRgf10Yh8VTgOprPO-4KlBEv9-iLF3BKeBgMXSwlQiswssbO1fRLxmVrPY1A6bkFG_WblbONcBTvQD9CRIw9-5mNuPKgmHLs20HF4vd7xEfLKa7rihrfCouWerBawww74A"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
            <div className="absolute bottom-4 left-4 max-w-sm rounded-2xl bg-white/90 p-4 backdrop-blur-md">
              <h2 className="text-title-lg font-title-lg text-on-surface">Mapa interactivo</h2>
              <p className="mt-2 text-body-md text-on-surface-variant">
                Consulta paradas, rutas y tiempos de llegada sin salir de la pantalla principal.
              </p>
            </div>
          </div>
        </article>

        <aside className="rounded-3xl border border-outline-variant bg-surface-container-low p-5 shadow-sm">
          <h2 className="text-headline-lg font-headline-lg text-on-surface">Información útil</h2>
          <div className="mt-4 space-y-4">
            <div className="rounded-2xl bg-surface-container-high p-4">
              <p className="text-label-lg font-semibold text-on-surface">Línea azul</p>
              <p className="mt-1 text-body-md text-on-surface-variant">Retraso estimado de 15 minutos por mantenimiento preventivo.</p>
            </div>
            <div className="rounded-2xl bg-surface-container-high p-4">
              <p className="text-label-lg font-semibold text-on-surface">Centro</p>
              <p className="mt-1 text-body-md text-on-surface-variant">Tráfico moderado. Recomendado salir con 10 minutos de anticipación.</p>
            </div>
            <button
              type="button"
              className="inline-flex w-full items-center justify-center rounded-2xl bg-error px-4 py-3 font-bold text-on-error transition-colors hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-error"
              aria-label="Reportar una emergencia"
            >
              Botón de Pánico
            </button>
          </div>
        </aside>
      </section>
    </div>
  )
}

export default HomePage
