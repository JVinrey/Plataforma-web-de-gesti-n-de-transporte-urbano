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
    <section
      aria-labelledby="guide-video-title"
      className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <span className="text-xs font-bold uppercase tracking-widest text-blue-700">
        {t.eyebrow}
      </span>
      <h2 id="guide-video-title" className="mt-2 text-xl font-bold text-gray-900">
        {t.title}
      </h2>
      <p className="mt-1 text-sm text-gray-600">{t.summary}</p>

      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_320px]">
        <figure className="overflow-hidden rounded-xl border border-gray-200 bg-black">
          <video
            ref={videoRef}
            controls
            preload="metadata"
            className="aspect-video w-full"
            aria-label={t.title}
            aria-describedby="guide-transcript guide-description"
          >
            <source src={GUIDE_VIDEO_URL} type="video/mp4" />
            {/* 1.2.2 — Subtítulos en video pregrabado */}
            <track kind="captions" src={GUIDE_CAPTIONS_ES_URL} srcLang="es" label="Español" default={lang === 'es'} />
            <track kind="captions" src={GUIDE_CAPTIONS_EN_URL} srcLang="en" label="English" default={lang === 'en'} />
            {/* 1.2.5 — Audiodescripción (mismos subtítulos extendidos como descripción) */}
            <track kind="descriptions" src={GUIDE_CAPTIONS_ES_URL} srcLang="es" label="Descripción ES" />
            <track kind="descriptions" src={GUIDE_CAPTIONS_EN_URL} srcLang="en" label="Description EN" />
            {t.fallback}
          </video>

          {/* 1.2.1 — Transcripción permanente */}
          <figcaption
            id="guide-transcript"
            className="border-t border-gray-200 bg-white px-4 py-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-widest text-blue-700">
                {t.transcriptTitle}
              </p>
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800">
                {t.wcagBadge}
              </span>
            </div>
            <p className="mt-2 text-sm leading-7 text-gray-700">{t.transcriptText}</p>
          </figcaption>
        </figure>

        {/* 1.2.5 — Descripción visual del contenido del video */}
        <aside
          id="guide-description"
          className="rounded-xl border border-gray-200 bg-gray-50 p-4"
        >
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
            {t.descTitle}
          </p>
          <p className="mt-2 text-sm leading-7 text-gray-700">{t.descText}</p>
        </aside>
      </div>
    </section>
  )
}
