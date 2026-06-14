import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useDocumentTitle } from '../hooks/use-document-title'
import { useRoutes, useStops } from '../hooks/use-transit-data'
import { useAccessibilityStore } from '../stores/accessibility-store'
import { MantaMap } from '../components/map'
import type { MapStop } from '../components/map'
import { AccessibilityMenu } from '../components/accessibility/AccessibilityMenu'

// =====================================================================
// GuestHomePage — Modo Invitado "Welcome to Manta".
// Bienvenida sin registro: mapa real de Manta, selector ES/EN, pasos del
// trayecto, destinos sugeridos (paradas reales) y Ticket QR digital.
// WCAG 2.2 AA: HTML semántico, contraste, navegación por teclado y
// nombres/roles en controles custom. Idioma vía accessibility-store.
// =====================================================================

type Lang = 'es' | 'en'

const T = {
  es: {
    guest: 'Modo Invitado',
    welcome: 'Bienvenido a Manta',
    searchPlaceholder: '¿A dónde quieres ir?',
    preferences: 'Preferencias',
    customize: 'Personaliza tu vista',
    accessibility: 'Opciones de Accesibilidad',
    highContrast: 'Alto Contraste',
    currentJourney: 'TRAYECTO ACTUAL',
    step1: 'Paso 1: Llegar a la estación',
    step2: 'Paso 2: Caminar a la Parada A',
    step3: 'Paso 3: Abordar la',
    estimated: 'Estimado',
    mins: 'min',
    away: 'de distancia',
    directLine: 'Línea directa',
    highFreq: 'Alta frecuencia',
    qrTicket: 'Ticket QR Digital',
    suggested: 'Destinos sugeridos',
    location: 'Manta, Ecuador',
  },
  en: {
    guest: 'Guest Mode',
    welcome: 'Welcome to Manta',
    searchPlaceholder: 'Where do you want to go?',
    preferences: 'Preferences',
    customize: 'Customize your view',
    accessibility: 'Accessibility Settings',
    highContrast: 'High Contrast',
    currentJourney: 'CURRENT JOURNEY',
    step1: 'Step 1: Arrive at Station',
    step2: 'Step 2: Walk to Stop A',
    step3: 'Step 3: Board',
    estimated: 'Estimated',
    mins: 'mins',
    away: 'away',
    directLine: 'Direct Line',
    highFreq: 'High Frequency',
    qrTicket: 'Digital QR Ticket',
    suggested: 'Suggested destinations',
    location: 'Manta, Ecuador',
  },
} satisfies Record<Lang, Record<string, string>>

/** Iconos para las tarjetas de destino según palabras clave del nombre. */
function destinationIcon(name: string): string {
  const n = name.toLowerCase()
  if (n.includes('playa')) return 'beach_access'
  if (n.includes('terminal')) return 'directions_bus'
  if (n.includes('aeropuerto')) return 'flights'
  if (n.includes('hospital')) return 'local_hospital'
  if (n.includes('universidad') || n.includes('uleam')) return 'school'
  if (n.includes('centro') || n.includes('mall')) return 'apartment'
  return 'place'
}

export default function GuestHomePage() {
  useDocumentTitle('Bienvenido a Manta')
  const { preferences, setPreference } = useAccessibilityStore()
  const lang = (preferences.language as Lang) ?? 'es'
  const t = T[lang]

  const { data: routes = [] } = useRoutes()
  const { data: stops = [] } = useStops()

  // Destinos sugeridos a partir de paradas reales (landmarks de Manta).
  const destinations = useMemo(() => {
    const keywords = ['Playa', 'Terminal', 'Centro', 'ULEAM', 'Aeropuerto']
    const picks: typeof stops = []
    for (const kw of keywords) {
      const found = stops.find(
        (s) => s.name.toLowerCase().includes(kw.toLowerCase()) && !picks.includes(s),
      )
      if (found) picks.push(found)
      if (picks.length >= 3) break
    }
    while (picks.length < 3 && stops[picks.length]) picks.push(stops[picks.length])
    return picks
  }, [stops])

  const mapStops: MapStop[] = stops.map((s) => ({
    id: s.id,
    name: s.name,
    lat: s.lat,
    lng: s.lng,
    accessible: s.accessible,
  }))

  const boardRoute = routes.find((r) => r.status !== 'off_line') ?? routes[0]

  return (
    <div className="flex min-h-screen flex-col bg-background text-on-background">
      {/* Cabecera */}
      <header className="flex h-16 items-center justify-between border-b border-outline-variant bg-surface-bright px-lg">
        <div className="flex items-center gap-md">
          <Link to="/" className="text-xl font-bold text-secondary">
            Manta Transit
          </Link>
          <span className="flex items-center gap-xs rounded-full bg-secondary-container px-3 py-1 font-label-md font-semibold text-on-secondary-container">
            <span className="material-symbols-outlined text-[16px]">person</span>
            {t.guest}
          </span>
        </div>
        <div className="flex items-center gap-sm">
          {/* Selector de idioma EN/ES */}
          <div className="flex items-center rounded-full bg-surface-container p-0.5" role="group" aria-label="Idioma / Language">
            {(['en', 'es'] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setPreference('language', l)}
                aria-pressed={lang === l}
                className={[
                  'rounded-full px-3 py-1 font-label-lg font-semibold uppercase transition-colors',
                  lang === l ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant',
                ].join(' ')}
              >
                {l}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container focus-visible:outline-3"
            aria-label="Cambiar idioma"
          >
            <span className="material-symbols-outlined">language</span>
          </button>
          <span className="rounded-full p-2 text-secondary" aria-hidden="true">
            <span className="material-symbols-outlined">accessibility_new</span>
          </span>
        </div>
      </header>

      <div className="flex flex-1 flex-col lg:flex-row">
        {/* Panel de preferencias */}
        <aside className="w-full shrink-0 border-b border-outline-variant bg-surface-container-low px-lg py-lg lg:w-72 lg:border-b-0 lg:border-r">
          <h2 className="font-title-lg font-bold text-on-surface">{t.preferences}</h2>
          <p className="font-body-md text-on-surface-variant">{t.customize}</p>

          <Link
            to="/inicio"
            className="mt-lg flex items-center gap-sm rounded-xl bg-secondary px-md py-3 font-body-md font-semibold text-on-secondary transition-opacity hover:opacity-90 focus-visible:outline-3"
          >
            <span className="material-symbols-outlined">accessibility_new</span>
            {t.accessibility}
          </Link>

          <button
            type="button"
            onClick={() => setPreference('highContrast', !preferences.highContrast)}
            role="switch"
            aria-checked={preferences.highContrast}
            className="mt-md flex w-full items-center gap-sm rounded-xl px-md py-3 text-left transition-colors hover:bg-surface-container focus-visible:outline-3"
          >
            <span className="material-symbols-outlined text-on-surface">contrast</span>
            <span className="flex-1 font-body-md font-medium text-on-surface">{t.highContrast}</span>
            <span
              className={[
                'relative h-6 w-11 shrink-0 rounded-full transition-colors',
                preferences.highContrast ? 'bg-secondary' : 'bg-outline',
              ].join(' ')}
            >
              <span
                className={[
                  'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all',
                  preferences.highContrast ? 'left-[1.375rem]' : 'left-0.5',
                ].join(' ')}
                aria-hidden="true"
              />
            </span>
          </button>

          {/* Trayecto actual (guía paso a paso) */}
          <section aria-label={t.currentJourney} className="mt-lg rounded-xl border border-outline-variant bg-surface-container-lowest p-md">
            <p className="font-label-md font-bold uppercase tracking-wide text-secondary">{t.currentJourney}</p>
            <ol className="mt-sm space-y-md">
              <li className="flex items-start gap-sm">
                <span className="mt-1 h-3 w-3 shrink-0 rounded-full bg-outline" aria-hidden="true" />
                <span className="font-body-md text-on-surface-variant line-through">{t.step1}</span>
              </li>
              <li className="flex items-start gap-sm">
                <span className="mt-1 h-3 w-3 shrink-0 rounded-full bg-secondary ring-4 ring-secondary-container" aria-hidden="true" />
                <span>
                  <span className="block font-body-md font-bold text-secondary">{t.step2}</span>
                  <span className="block font-label-lg text-on-surface-variant">
                    {t.estimated} 4 {t.mins}
                  </span>
                </span>
              </li>
              <li className="flex items-start gap-sm">
                <span className="mt-1 h-3 w-3 shrink-0 rounded-full border-2 border-outline bg-surface-container-lowest" aria-hidden="true" />
                <span className="font-body-md text-on-surface-variant">
                  {t.step3} {boardRoute ? `${boardRoute.code} · ${boardRoute.name}` : '#402'}
                </span>
              </li>
            </ol>
          </section>

          <div className="mt-lg flex items-center gap-sm rounded-xl bg-primary-container px-md py-3 text-on-primary-container">
            <span className="material-symbols-outlined">person_pin_circle</span>
            <span className="font-label-lg font-semibold">{t.location}</span>
          </div>
        </aside>

        {/* Contenido principal */}
        <main className="flex-1 px-lg py-lg">
          <h1 className="text-center text-headline-lg font-bold text-on-surface">{t.welcome}</h1>

          {/* Buscador */}
          <form
            className="mx-auto mt-lg max-w-3xl"
            role="search"
            onSubmit={(e) => e.preventDefault()}
          >
            <label htmlFor="guest-search" className="sr-only">
              {t.searchPlaceholder}
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5 text-on-surface-variant">
                <span className="material-symbols-outlined">search</span>
              </span>
              <input
                id="guest-search"
                type="search"
                placeholder={t.searchPlaceholder}
                className="w-full rounded-full border border-outline-variant bg-surface-bright py-4 pl-14 pr-5 font-body-md shadow-sm focus:ring-2 focus:ring-secondary"
              />
            </div>
          </form>

          {/* Mapa real de Manta */}
          <section
            aria-label="Mapa de la red de transporte de Manta"
            className="mx-auto mt-lg h-[22rem] max-w-5xl overflow-hidden rounded-2xl border border-outline-variant shadow-sm"
          >
            <MantaMap stops={mapStops} ariaLabel="Mapa de la red de transporte de Manta" />
          </section>

          {/* Destinos sugeridos */}
          <h2 className="mx-auto mt-lg max-w-5xl font-title-lg font-bold text-on-surface">{t.suggested}</h2>
          <ul className="mx-auto mt-md grid max-w-5xl grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-3" role="list">
            {destinations.map((dest, i) => {
              const isTicket = i === destinations.length - 1
              return (
                <li key={dest.id}>
                  <Link
                    to="/planificar-viaje"
                    className="relative block h-full rounded-2xl border border-outline-variant bg-surface-container-lowest p-lg shadow-sm transition-shadow hover:shadow-md focus-visible:outline-3"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary-container text-on-secondary-container">
                      <span className="material-symbols-outlined">{destinationIcon(dest.name)}</span>
                    </span>
                    <h3 className="mt-md font-body-md font-bold text-on-surface">{dest.name}</h3>
                    <p className="mt-xs flex items-center gap-sm">
                      <span className="rounded-md bg-[#f3e6c4] px-2 py-0.5 font-label-md font-bold text-[#6b4e00]">
                        {8 + i * 4} {t.mins} {t.away}
                      </span>
                      <span className="font-label-lg text-on-surface-variant">
                        {i === 0 ? t.directLine : t.highFreq}
                      </span>
                    </p>
                    {isTicket && (
                      <span className="mt-md flex items-center justify-center gap-sm rounded-full bg-[#e8820e] px-4 py-2 font-body-md font-bold text-white">
                        <span className="material-symbols-outlined text-[20px]">qr_code_2</span>
                        {t.qrTicket}
                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                      </span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </main>
      </div>

      <AccessibilityMenu />
    </div>
  )
}
