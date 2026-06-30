import { useEffect, useRef } from 'react'
import { useAccessibilityStore } from '../../stores/accessibility-store'

const GUIDE_VIDEO_URL = new URL(
  '../../../video/Manta_Transit_trip_guide_20260628.mp4',
  import.meta.url,
).href

const GUIDE_CAPTIONS_ES_URL = new URL(
  '../../../video/Manta_Transit_trip_guide_20260628.es.vtt',
  import.meta.url,
).href

const GUIDE_CAPTIONS_EN_URL = new URL(
  '../../../video/Manta_Transit_trip_guide_20260628.en.vtt',
  import.meta.url,
).href

export function AccessibilityVideoGuide() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const { preferences } = useAccessibilityStore()
  const lang = preferences.language as 'es' | 'en'

  const t = {
    es: {
      eyebrow: 'Guía de uso',
      title: 'Cómo planificar tu viaje',
      summary: 'Tutorial paso a paso para buscar y confirmar una ruta en Manta Transit.',
      transcriptTitle: 'Transcripción',
      transcriptText:
        'Cómo planificar tu viaje en Manta Transit. Paso 1: Ingresa tu punto de partida. Paso 2: Escribe tu destino y pulsa Buscar Ruta. Paso 3: Selecciona la ruta más conveniente. Paso 4: Confirma el viaje y sigue el mapa en tiempo real. Movilidad para todos.',
      descTitle: 'Descripción visual',
      descText:
        'Tutorial en pantalla que muestra la interfaz del planificador de viajes: campos de origen y destino, botón de búsqueda, listado de rutas con tiempos estimados y mapa interactivo.',
      fallback: 'Tu navegador no soporta la reproducción de video.',
      wcagBadge: 'WCAG 1.2 — Video 2/2',
    },
    en: {
      eyebrow: 'Usage guide',
      title: 'How to plan your trip',
      summary: 'Step-by-step tutorial to search and confirm a route in Manta Transit.',
      transcriptTitle: 'Transcript',
      transcriptText:
        'How to plan your trip in Manta Transit. Step 1: Enter your starting point. Step 2: Enter destination and press Search Route. Step 3: Select the most convenient route. Step 4: Confirm your trip and follow the live map. Mobility for everyone.',
      descTitle: 'Visual description',
      descText:
        'On-screen tutorial showing the trip planner interface: origin and destination fields, search button, route list with estimated times, and interactive map.',
      fallback: 'Your browser does not support video playback.',
      wcagBadge: 'WCAG 1.2 — Video 2/2',
    },
  }[lang]

  // Sincroniza pista de subtítulos al idioma del sistema
  useEffect(() => {
    const tracks = videoRef.current?.textTracks
    if (!tracks) return
    for (const track of Array.from(tracks)) {
      track.mode = track.language === lang ? 'showing' : 'disabled'
    }
  }, [lang])

  return (
    <details className="group rounded-xl border border-outline-variant/60 bg-surface-container-lowest shadow-sm">
      <summary className="cursor-pointer list-none px-md py-3 [&::-webkit-details-marker]:hidden">
        <div className="flex items-center justify-between gap-sm">
          <div className="min-w-0">
            <span className="font-label-md font-bold uppercase tracking-widest text-primary">
              {t.eyebrow}
            </span>
            <p className="mt-0.5 font-body-md font-semibold text-on-surface">{t.title}</p>
            <p className="mt-0.5 font-label-md text-on-surface-variant">{t.summary}</p>
          </div>
          <span
            className="material-symbols-outlined shrink-0 text-on-surface-variant transition-transform group-open:rotate-180"
            aria-hidden="true"
          >
            expand_more
          </span>
        </div>
      </summary>

      <section aria-labelledby="guide-video-title" className="border-t border-outline-variant/60 px-md pb-md pt-sm">
        <h2 id="guide-video-title" className="sr-only">
          {t.title}
        </h2>

        <div className="flex flex-col gap-md">
          <figure className="min-w-0 overflow-hidden rounded-xl border border-outline-variant bg-black">
            <video
              ref={videoRef}
              controls
              preload="metadata"
              className="aspect-video w-full"
              aria-label={t.title}
              aria-describedby="guide-transcript guide-description"
            >
              <source src={GUIDE_VIDEO_URL} type="video/mp4" />
              <track kind="captions" src={GUIDE_CAPTIONS_ES_URL} srcLang="es" label="Español" default={lang === 'es'} />
              <track kind="captions" src={GUIDE_CAPTIONS_EN_URL} srcLang="en" label="English" default={lang === 'en'} />
              <track kind="descriptions" src={GUIDE_CAPTIONS_ES_URL} srcLang="es" label="Descripción ES" />
              <track kind="descriptions" src={GUIDE_CAPTIONS_EN_URL} srcLang="en" label="Description EN" />
              {t.fallback}
            </video>

            <figcaption
              id="guide-transcript"
              className="border-t border-outline-variant bg-surface-container-lowest px-4 py-3"
            >
              <div className="flex items-center justify-between">
                <p className="font-label-md font-bold uppercase tracking-widest text-primary">
                  {t.transcriptTitle}
                </p>
                <span className="rounded-full bg-primary-container px-2 py-0.5 font-label-md font-semibold text-on-primary-container">
                  {t.wcagBadge}
                </span>
              </div>
              <p className="mt-2 font-body-md leading-relaxed text-on-surface-variant">{t.transcriptText}</p>
            </figcaption>
          </figure>

          <aside
            id="guide-description"
            className="rounded-xl border border-outline-variant bg-surface-container-low p-md"
          >
            <p className="font-label-md font-bold uppercase tracking-widest text-on-surface-variant">
              {t.descTitle}
            </p>
            <p className="mt-2 font-body-md leading-relaxed text-on-surface-variant">{t.descText}</p>
          </aside>
        </div>
      </section>
    </details>
  )
}
