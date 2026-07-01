import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDocumentTitle } from '../hooks/use-document-title'
import { useRoutes, useStops } from '../hooks/use-transit-data'
import { useFavoriteRoutes } from '../hooks/use-profile-data'
import { useAccessibilityStore } from '../stores/accessibility-store'
import { MantaMap } from '../components/map'
import type { MapStop } from '../components/map'

const PROMO_VIDEO_URL = new URL(
  '../../video/Manta_Transit_promotional_video_202606150117.mp4',
  import.meta.url,
).href

const PROMO_CAPTIONS_URL = new URL(
  '../../video/Manta_Transit_promotional_video_202606150117.es.vtt',
  import.meta.url,
).href

const PROMO_CAPTIONS_EN_URL = new URL(
  '../../video/Manta_Transit_promotional_video_202606150117.en.vtt',
  import.meta.url,
).href

const PROMO_DESCRIPTIONS_ES_URL = new URL(
  '../../video/Manta_Transit_promotional_video_202606150117.desc.es.vtt',
  import.meta.url,
).href

const PROMO_DESCRIPTIONS_EN_URL = new URL(
  '../../video/Manta_Transit_promotional_video_202606150117.desc.en.vtt',
  import.meta.url,
).href

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
    promoEyebrow: 'Video promocional',
    promoTitle: 'Conoce Manta Transit',
    promoSummary:
      'Mira el anuncio oficial de la plataforma y revisa debajo su transcripción y una descripción breve del contenido visual.',
    videoAriaLabel: 'Video promocional de Manta Transit',
    transcriptTitle: 'Transcripción del video',
    transcriptIntro:
      'La transcripción se mantiene visible para que puedas consultarla sin depender del audio.',
    transcriptText:
      'Manta no se detiene. Presentamos Manta Transit. Planifica tu viaje. Movilidad para todos. Tu ciudad en movimiento.',
    descriptionTitle: 'Descripción visual',
    descriptionText:
      'Secuencia promocional de la marca Manta Transit con un mensaje centrado en movilidad urbana, planificación de viajes y accesibilidad.',
    videoFallback: 'Tu navegador no soporta la reproducción de video.',
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
    promoEyebrow: 'Promotional video',
    promoTitle: 'Meet Manta Transit',
    promoSummary:
      'Watch the official platform announcement and review its transcript and a short visual description below.',
    videoAriaLabel: 'Manta Transit promotional video',
    transcriptTitle: 'Video transcript',
    transcriptIntro: 'The transcript stays visible so you can read it without relying on audio.',
    transcriptText:
      'Manta does not stop. Introducing Manta Transit. Plan your trip. Mobility for everyone. Your city in motion.',
    descriptionTitle: 'Visual description',
    descriptionText:
      'Promotional branding sequence for Manta Transit centered on urban mobility, trip planning, and accessibility.',
    videoFallback: 'Your browser does not support video playback.',
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
  const videoRef = useRef<HTMLVideoElement>(null)

  // Banner de servicio real: primera ruta con retraso (status delayed).
  const delayedRoute = useMemo(() => routes.find((r) => r.status === 'delayed'), [routes])

  useEffect(() => {
    const tracks = videoRef.current?.textTracks
    if (!tracks) return

    for (const track of Array.from(tracks)) {
      track.mode = track.language === lang ? 'showing' : 'disabled'
    }
  }, [lang])

  // 1.2.2 — Sincronizar toggle global de subtítulos con el video 1
  useEffect(() => {
    const tracks = videoRef.current?.textTracks
    if (!tracks) return
    for (const track of Array.from(tracks)) {
      if (track.kind === 'captions' || track.kind === 'subtitles') {
        track.mode = preferences.showSubtitles ? 'showing' : (track.language === lang ? 'showing' : 'disabled')
      }
      if (track.kind === 'descriptions') {
        track.mode = preferences.showAudioDescription ? 'showing' : 'disabled'
      }
    }
  }, [preferences.showSubtitles, preferences.showAudioDescription, lang])

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
    <main id="main-content" className="flex w-full flex-col gap-10 pb-xl">
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
                    autoComplete="street-address"
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
                    autoComplete="street-address"
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

        <section
          aria-labelledby="promo-video-title"
          className="relative overflow-hidden rounded-[2rem] border border-[#bfd0e6] bg-[linear-gradient(135deg,#ffffff_0%,#f5f9ff_45%,#e8f0ff_100%)] p-6 shadow-[0_22px_60px_rgba(15,23,42,0.10)]"
        >
          <div className="pointer-events-none absolute -left-16 top-0 h-48 w-48 rounded-full bg-[#dbeafe]/70 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 right-0 h-56 w-56 rounded-full bg-[#c7f0d3]/60 blur-3xl" />

          <div className="relative z-10">
            <div className="max-w-4xl">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#d2deee] bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary shadow-sm">
                  {t.promoEyebrow}
                </span>
                <span className="inline-flex items-center rounded-full border border-[#d2deee] bg-[#eff6ff] px-3 py-1 text-xs font-semibold text-[#23405d]">
                  10s
                </span>
                <span className="inline-flex items-center rounded-full border border-[#d2deee] bg-[#f0fdf4] px-3 py-1 text-xs font-semibold text-[#14532d]">
                  {lang === 'es' ? 'Subtítulos ES / EN' : 'Captions ES / EN'}
                </span>
              </div>
              <h2
                id="promo-video-title"
                className="mt-4 text-title-lg font-bold text-on-surface md:text-headline-lg"
              >
                {t.promoTitle}
              </h2>
              <p className="mt-3 max-w-3xl text-body-md text-on-surface-variant md:text-base">
                {t.promoSummary}
              </p>
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.78fr)]">
              <figure className="overflow-hidden rounded-[1.5rem] border border-white/70 bg-slate-950 shadow-[0_18px_40px_rgba(15,23,42,0.16)]">
                <div className="border-b border-white/10 bg-slate-950 p-3">
                  <video
                    ref={videoRef}
                    controls
                    preload="metadata"
                    className="aspect-video w-full rounded-[1.1rem] bg-black"
                    aria-label={t.videoAriaLabel}
                    aria-describedby="promo-video-transcript promo-video-description"
                  >
                    <source src={PROMO_VIDEO_URL} type="video/mp4" />
                    <track
                      kind="captions"
                      src={PROMO_CAPTIONS_URL}
                      srcLang="es"
                      label="Español"
                      default={lang === 'es'}
                    />
                    <track
                      kind="captions"
                      src={PROMO_CAPTIONS_EN_URL}
                      srcLang="en"
                      label="English"
                      default={lang === 'en'}
                    />
                    {/* 1.2.5 — Audiodescripción: describe lo que ocurre en pantalla, no el diálogo */}
                    <track
                      kind="descriptions"
                      src={PROMO_DESCRIPTIONS_ES_URL}
                      srcLang="es"
                      label="Descripción ES"
                    />
                    <track
                      kind="descriptions"
                      src={PROMO_DESCRIPTIONS_EN_URL}
                      srcLang="en"
                      label="Description EN"
                    />
                    {t.videoFallback}
                  </video>
                </div>

                <figcaption
                  id="promo-video-transcript"
                  className="border-t border-slate-200/80 bg-white px-5 py-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                        {t.transcriptTitle}
                      </p>
                      <p className="mt-1 text-sm text-on-surface-variant">{t.transcriptIntro}</p>
                    </div>
                    <span className="inline-flex rounded-full bg-primary-container px-3 py-1 text-xs font-semibold text-on-primary-container">
                      WCAG 1.2
                    </span>
                  </div>

                  <p className="mt-4 rounded-2xl border border-outline-variant bg-surface-container-low px-4 py-4 text-body-md leading-7 text-on-surface">
                    {t.transcriptText}
                  </p>
                </figcaption>
              </figure>

              <aside className="flex flex-col gap-4">
                <div
                  id="promo-video-description"
                  className="rounded-[1.5rem] border border-white/70 bg-white/90 p-5 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex size-11 items-center justify-center rounded-2xl bg-primary-container text-primary">
                      <span className="material-symbols-outlined" aria-hidden="true">
                        campaign
                      </span>
                    </span>
                    <div>
                      <h3 className="text-title-lg font-bold text-on-surface">{t.descriptionTitle}</h3>
                      <p className="text-sm text-on-surface-variant">
                        {lang === 'es'
                          ? 'Resumen visual del anuncio'
                          : 'Visual summary of the ad'}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-body-md leading-7 text-on-surface-variant">
                    {t.descriptionText}
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                  <div className="rounded-[1.25rem] border border-[#dbe3f0] bg-white/85 p-4 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                      {lang === 'es' ? 'Duración' : 'Duration'}
                    </p>
                    <p className="mt-2 text-2xl font-bold text-on-surface">10 s</p>
                    <p className="mt-1 text-sm text-on-surface-variant">
                      {lang === 'es'
                        ? 'Formato compacto para la portada'
                        : 'Compact format for the home screen'}
                    </p>
                  </div>

                  <div className="rounded-[1.25rem] border border-[#dbe3f0] bg-white/85 p-4 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">
                      {lang === 'es' ? 'Accesibilidad' : 'Accessibility'}
                    </p>
                    <p className="mt-2 text-lg font-bold text-on-surface">
                      {lang === 'es'
                        ? 'Controles + transcripción + subtítulos'
                        : 'Controls + transcript + captions'}
                    </p>
                    <p className="mt-1 text-sm text-on-surface-variant">
                      {lang === 'es'
                        ? 'El contenido se puede consumir sin depender del audio.'
                        : 'The content can be consumed without relying on audio.'}
                    </p>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* Accesos rápidos */}
        <section aria-labelledby="quick-access">
          <div className="flex items-center justify-between">
            <h2 id="quick-access" className="text-headline-lg font-bold text-on-surface">
              {t.quickAccess}
            </h2>
            <Link
              to="/rutas"
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
                to="/rutas"
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
    </main>)
}
