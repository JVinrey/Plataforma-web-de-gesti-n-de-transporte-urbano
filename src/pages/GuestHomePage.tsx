import { useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDocumentTitle } from '../hooks/use-document-title'
import { useRoutes, useStops } from '../hooks/use-transit-data'
import { useFavoriteRoutes } from '../hooks/use-profile-data'
import { useAccessibilityStore } from '../stores/accessibility-store'
import { MantaMap } from '../components/map'
import type { MapStop } from '../components/map'

// =====================================================================
// GuestHomePage — Home de la app de pasajeros "Tu ciudad, en movimiento".
// Banner de servicio en vivo (ruta con retraso real), buscador de viaje
// funcional (navega al planificador con origen/destino), accesos rápidos
// y mapa real de Manta. WCAG 2.2 AA: HTML semántico, labels, navegación
// por teclado, nombres/roles en controles y contraste >= 4.5:1. i18n ES/EN.
// =====================================================================

type Lang = 'es' | 'en'

const T = {
  es: {
    serviceUpdate: 'Actualización de Servicio',
    serviceDelay: (line: string) =>
      `Retrasos de 15 min en la ${line} debido a mantenimiento preventivo.`,
    dismiss: 'Cerrar aviso de servicio',
    heroLine1: 'Tu ciudad,',
    heroLine2: 'en movimiento.',
    heroSubtitle:
      'Planifica tu viaje en tiempo real, consulta horarios y mantente al tanto de cualquier cambio en la red de transporte de Manta.',
    origin: 'Origen',
    originPlaceholder: 'Ingresa punto de partida',
    destination: 'Destino',
    destinationPlaceholder: '¿A dónde quieres ir?',
    searchRoute: 'Buscar Ruta',
    swap: 'Intercambiar origen y destino',
    quickAccess: 'Accesos Rápidos',
    seeAll: 'Ver todo',
    elderlyTitle: 'Modo Adulto Mayor',
    elderlyDesc:
      'Interfaz simplificada con botones grandes y alto contraste para una navegación fácil.',
    elderlyCta: 'Activar ahora',
    touristTitle: 'Turista',
    touristDesc: 'Descubre los puntos de interés de Manta y las mejores rutas para visitarlos.',
    touristCta: 'Explorar mapa',
    favTitle: 'Rutas Frecuentes',
    favDesc: 'Guarda tus trayectos habituales para acceder a ellos con un solo toque.',
    favCta: 'Ver favoritos',
    favCount: (n: number) => `${n} ${n === 1 ? 'ruta guardada' : 'rutas guardadas'}`,
    mapTitle: 'Mapa de la red de Manta',
    mapHint: 'Toca una parada para ver su nombre y accesibilidad.',
  },
  en: {
    serviceUpdate: 'Service Update',
    serviceDelay: (line: string) =>
      `15 min delays on ${line} due to preventive maintenance.`,
    dismiss: 'Dismiss service notice',
    heroLine1: 'Your city,',
    heroLine2: 'in motion.',
    heroSubtitle:
      'Plan your trip in real time, check schedules and stay up to date with any change in the Manta transit network.',
    origin: 'Origin',
    originPlaceholder: 'Enter starting point',
    destination: 'Destination',
    destinationPlaceholder: 'Where do you want to go?',
    searchRoute: 'Search Route',
    swap: 'Swap origin and destination',
    quickAccess: 'Quick Access',
    seeAll: 'See all',
    elderlyTitle: 'Senior Mode',
    elderlyDesc: 'Simplified interface with large buttons and high contrast for easy navigation.',
    elderlyCta: 'Activate now',
    touristTitle: 'Tourist',
    touristDesc: 'Discover Manta points of interest and the best routes to visit them.',
    touristCta: 'Explore map',
    favTitle: 'Frequent Routes',
    favDesc: 'Save your usual trips to reach them with a single tap.',
    favCta: 'See favorites',
    favCount: (n: number) => `${n} ${n === 1 ? 'saved route' : 'saved routes'}`,
    mapTitle: 'Manta network map',
    mapHint: 'Tap a stop to see its name and accessibility.',
  },
} satisfies Record<Lang, Record<string, unknown>>

export default function GuestHomePage() {
  useDocumentTitle('Tu ciudad, en movimiento')
  const navigate = useNavigate()
  const { preferences, setPreference } = useAccessibilityStore()
  const lang = (preferences.language as Lang) ?? 'es'
  const t = T[lang]

  const { data: routes = [] } = useRoutes()
  const { data: stops = [] } = useStops()
  const { data: favorites = [] } = useFavoriteRoutes()

  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [bannerDismissed, setBannerDismissed] = useState(false)
  const mapRef = useRef<HTMLElement>(null)

  // Banner de servicio real: primera ruta con retraso (status delayed).
  const delayedRoute = useMemo(() => routes.find((r) => r.status === 'delayed'), [routes])

  const mapStops: MapStop[] = useMemo(
    () =>
      stops.map((s) => ({
        id: s.id,
        name: s.name,
        lat: s.lat,
        lng: s.lng,
        accessible: s.accessible,
      })),
    [stops],
  )

  // Búsqueda funcional: lleva el origen/destino al planificador vía query params.
  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (origin.trim()) params.set('origen', origin.trim())
    if (destination.trim()) params.set('destino', destination.trim())
    navigate(`/planificar-viaje${params.toString() ? `?${params.toString()}` : ''}`)
  }

  const swapEnds = () => {
    setOrigin(destination)
    setDestination(origin)
  }

  // "Activar ahora": activa el modo adulto mayor real y abre su vista.
  const activateElderly = () => {
    setPreference('elderlyMode', true)
    setPreference('textSize', 'large')
    setPreference('increasedSpacing', true)
    navigate('/adulto-mayor')
  }

  const scrollToMap = () => {
    mapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="flex w-full flex-col gap-10 pb-xl">
      {/* Banner de servicio (en vivo, descartable) */}
      {delayedRoute && !bannerDismissed && (
        <div
          role="status"
          className="flex items-center gap-md rounded-2xl border border-amber-300 bg-[#f59e0b] px-5 py-4 text-[#3d2c00] shadow-sm"
        >
          <span className="material-symbols-outlined shrink-0" aria-hidden="true">
            warning
          </span>
          <p className="flex-1 font-body-md font-semibold leading-6">
            <span className="font-bold">{t.serviceUpdate}:</span>{' '}
            {t.serviceDelay(`${delayedRoute.code} (${delayedRoute.name})`)}
          </p>
          <button
            type="button"
            onClick={() => setBannerDismissed(true)}
            aria-label={t.dismiss}
            className="rounded-full p-1 transition-colors hover:bg-black/10 focus-visible:outline-3"
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              close
            </span>
          </button>
        </div>
      )}

      <div className="flex w-full flex-col gap-10 px-lg">
        {/* Hero + buscador de viaje */}
        <section aria-labelledby="home-hero" className="pt-md">
          <div className="max-w-4xl">
            <h1 id="home-hero" className="text-5xl font-extrabold leading-[0.98] text-primary md:text-6xl lg:text-7xl">
              {t.heroLine1}
              <br />
              {t.heroLine2}
            </h1>
            <p className="mt-lg max-w-2xl text-base leading-7 text-on-surface-variant md:text-lg">
              {t.heroSubtitle}
            </p>
          </div>

          {/* Buscador funcional */}
          <form
            onSubmit={submitSearch}
            role="search"
            aria-label={t.searchRoute}
            className="mt-lg grid w-full gap-md rounded-2xl border border-outline-variant bg-surface-bright p-lg shadow-md md:grid-cols-[minmax(0,1fr)_auto] md:items-end"
          >
            <div className="flex min-w-0 flex-col gap-sm">
              {/* Origen */}
              <div className="relative rounded-xl border border-outline-variant bg-surface-container-lowest px-md py-3">
                <label
                  htmlFor="home-origin"
                  className="absolute -top-2 left-3 bg-surface-bright px-1 font-label-md font-semibold text-primary"
                >
                  {t.origin}
                </label>
                <div className="flex items-center gap-sm">
                  <span className="material-symbols-outlined text-primary" aria-hidden="true">
                    my_location
                  </span>
                  <input
                    id="home-origin"
                    type="text"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    placeholder={t.originPlaceholder}
                    className="w-full bg-transparent font-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none"
                  />
                </div>
              </div>

              {/* Swap */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={swapEnds}
                  aria-label={t.swap}
                  className="-my-1 flex h-9 w-9 items-center justify-center rounded-full bg-primary-container text-primary shadow-sm transition-colors hover:brightness-95 focus-visible:outline-3"
                >
                  <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                    swap_vert
                  </span>
                </button>
              </div>

              {/* Destino */}
              <div className="relative rounded-xl border border-outline-variant bg-surface-container-lowest px-md py-3">
                <label
                  htmlFor="home-destination"
                  className="absolute -top-2 left-3 bg-surface-bright px-1 font-label-md font-semibold text-on-surface-variant"
                >
                  {t.destination}
                </label>
                <div className="flex items-center gap-sm">
                  <span className="material-symbols-outlined text-error" aria-hidden="true">
                    flag
                  </span>
                  <input
                    id="home-destination"
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder={t.destinationPlaceholder}
                    className="w-full bg-transparent font-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="flex min-h-14 items-center justify-center gap-sm rounded-xl bg-primary px-lg py-4 font-body-md font-bold text-on-primary transition-opacity hover:opacity-90 focus-visible:outline-3"
            >
              {t.searchRoute}
              <span className="material-symbols-outlined" aria-hidden="true">
                arrow_forward
              </span>
            </button>
          </form>
        </section>

        {/* Accesos rápidos */}
        <section aria-labelledby="quick-access">
          <div className="flex items-center justify-between">
            <h2 id="quick-access" className="text-headline-lg font-bold text-on-surface">
              {t.quickAccess}
            </h2>
            <Link
              to="/lineas"
              className="flex items-center gap-xs font-label-lg font-bold text-primary hover:underline focus-visible:outline-3"
            >
              {t.seeAll}
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                chevron_right
              </span>
            </Link>
          </div>

          <ul className="mt-lg grid grid-cols-1 gap-gutter lg:grid-cols-3" role="list">
            {/* Modo Adulto Mayor */}
            <li className="flex h-full flex-col rounded-2xl border border-outline-variant bg-surface-container-lowest p-lg shadow-sm">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fde2c4] text-[#9a5b00]">
                <span className="material-symbols-outlined" aria-hidden="true">
                  elderly
                </span>
              </span>
              <h3 className="mt-md text-title-lg font-bold text-on-surface">{t.elderlyTitle}</h3>
              <p className="mt-xs flex-1 font-body-md text-on-surface-variant">{t.elderlyDesc}</p>
              <button
                type="button"
                onClick={activateElderly}
                className="mt-md inline-flex items-center gap-xs self-start font-label-lg font-bold text-primary hover:underline focus-visible:outline-3"
              >
                {t.elderlyCta}
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                  open_in_new
                </span>
              </button>
            </li>

            {/* Turista */}
            <li className="flex h-full flex-col rounded-2xl border border-outline-variant bg-surface-container-lowest p-lg shadow-sm">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#7fe0a6] text-[#0b4429]">
                <span className="material-symbols-outlined" aria-hidden="true">
                  map
                </span>
              </span>
              <h3 className="mt-md text-title-lg font-bold text-on-surface">{t.touristTitle}</h3>
              <p className="mt-xs flex-1 font-body-md text-on-surface-variant">{t.touristDesc}</p>
              <button
                type="button"
                onClick={scrollToMap}
                className="mt-md inline-flex items-center gap-xs self-start font-label-lg font-bold text-primary hover:underline focus-visible:outline-3"
              >
                {t.touristCta}
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                  explore
                </span>
              </button>
            </li>

            {/* Rutas Frecuentes */}
            <li className="flex h-full flex-col rounded-2xl border border-outline-variant bg-surface-container-lowest p-lg shadow-sm">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
                <span className="material-symbols-outlined" aria-hidden="true">
                  star
                </span>
              </span>
              <h3 className="mt-md text-title-lg font-bold text-on-surface">{t.favTitle}</h3>
              <p className="mt-xs flex-1 font-body-md text-on-surface-variant">{t.favDesc}</p>
              <p className="mt-sm font-label-md font-semibold text-on-surface-variant">
                {t.favCount(favorites.length)}
              </p>
              <Link
                to="/lineas"
                className="mt-md inline-flex items-center gap-xs self-start font-label-lg font-bold text-primary hover:underline focus-visible:outline-3"
              >
                {t.favCta}
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                  bookmark
                </span>
              </Link>
            </li>
          </ul>
        </section>

        {/* Mapa real de Manta */}
        <section ref={mapRef} aria-labelledby="home-map" className="scroll-mt-4">
          <h2 id="home-map" className="text-headline-lg font-bold text-on-surface">
            {t.mapTitle}
          </h2>
          <p className="mt-xs font-body-md text-on-surface-variant">{t.mapHint}</p>
          <div className="mt-md h-[24rem] w-full overflow-hidden rounded-2xl border border-outline-variant shadow-sm">
            <MantaMap stops={mapStops} ariaLabel={t.mapTitle} />
          </div>
        </section>
      </div>
    </div>
  )
}
