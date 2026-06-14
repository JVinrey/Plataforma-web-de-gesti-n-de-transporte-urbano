import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Bell,
  Bus,
  HeartPulse,
  Home,
  MapPin,
  Mic,
  ShoppingCart,
  Siren,
} from 'lucide-react'
import { AccessibilityMenu } from '../components/accessibility/AccessibilityMenu'
import { useDocumentTitle } from '../hooks/use-document-title'
import { useRoutes } from '../hooks/use-transit-data'
import { useAccessibilityStore } from '../stores/accessibility-store'

const QUICK_DESTINATIONS = [
  { label: 'Casa', icon: Home, value: 'Casa' },
  { label: 'Hospital', icon: HeartPulse, value: 'Hospital Rodriguez Zambrano' },
  { label: 'Super', icon: ShoppingCart, value: 'Supermercado' },
]

export function ElderlyModePage() {
  useDocumentTitle('Modo adulto mayor')
  const navigate = useNavigate()
  const { data: routes = [] } = useRoutes()
  const { preferences, setPreference } = useAccessibilityStore()
  const [destination, setDestination] = useState('')
  const [message, setMessage] = useState('Modo simplificado listo para usar.')

  const usualRoute = routes.find((route) => route.status === 'on_time') ?? routes[0]
  const delayedRoute = routes.find((route) => route.status === 'delayed')

  const startVoiceHelp = () => {
    setMessage('Puedes decir tu destino o elegir un boton grande.')
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(
        new SpeechSynthesisUtterance('Dime a donde quieres ir o toca un destino frecuente.'),
      )
    }
  }

  const activateElderlyMode = () => {
    setPreference('elderlyMode', true)
    setPreference('textSize', 'large')
    setPreference('increasedSpacing', true)
    setMessage('Modo adulto mayor activado con texto grande y controles amplios.')
  }

  return (
    <div className="min-h-screen bg-[#f7fbff] text-gray-950">
      <header className="border-b border-blue-100 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <Link to="/" className="text-2xl font-black text-blue-900">
            Manta Transit
          </Link>
          <nav aria-label="Navegacion de modo adulto mayor">
            <ul className="flex flex-wrap gap-2">
              <li>
                <Link className="rounded-md px-4 py-3 font-semibold text-blue-900 hover:bg-blue-50" to="/">
                  Inicio
                </Link>
              </li>
              <li>
                <Link
                  className="rounded-md px-4 py-3 font-semibold text-blue-900 hover:bg-blue-50"
                  to="/seguimiento-pago"
                >
                  Seguimiento
                </Link>
              </li>
              <li>
                <Link
                  className="rounded-md px-4 py-3 font-semibold text-blue-900 hover:bg-blue-50"
                  to="/historial"
                >
                  Historial
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[1fr_22rem]">
        <section aria-labelledby="elderly-title" className="space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-semibold uppercase text-green-800">Vista simplificada</p>
              <h1 id="elderly-title" className="mt-1 text-4xl font-black text-blue-950">
                A donde quieres ir hoy?
              </h1>
              <p className="mt-2 max-w-2xl text-xl text-gray-700">
                Botones grandes, texto claro y ayuda por voz para viajar con mas confianza.
              </p>
            </div>
            <button
              type="button"
              onClick={activateElderlyMode}
              aria-pressed={preferences.elderlyMode}
              className="rounded-lg bg-yellow-300 px-5 py-4 text-lg font-black text-black shadow-sm hover:bg-yellow-200"
            >
              Activar modo adulto mayor
            </button>
          </div>

          <form
            className="rounded-lg border border-blue-100 bg-white p-6 shadow-sm"
            onSubmit={(event) => {
              event.preventDefault()
              navigate('/planificar-viaje')
            }}
          >
            <label htmlFor="elderly-destination" className="block text-2xl font-black text-blue-950">
              Destino
            </label>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <div className="flex min-h-16 flex-1 items-center gap-3 rounded-lg border-2 border-blue-800 px-4">
                <MapPin aria-hidden="true" className="size-8 text-blue-900" />
                <input
                  id="elderly-destination"
                  value={destination}
                  onChange={(event) => setDestination(event.target.value)}
                  placeholder="Ejemplo: hospital, mercado, centro"
                  className="w-full border-0 text-xl font-semibold outline-none"
                />
              </div>
              <button
                type="submit"
                className="rounded-lg bg-blue-800 px-6 py-4 text-xl font-black text-white hover:bg-blue-900"
              >
                Buscar ruta
              </button>
            </div>
          </form>

          <section aria-labelledby="quick-title" className="grid gap-4 sm:grid-cols-3">
            <h2 id="quick-title" className="sr-only">
              Destinos frecuentes
            </h2>
            {QUICK_DESTINATIONS.map(({ label, icon: Icon, value }) => (
              <button
                key={label}
                type="button"
                onClick={() => setDestination(value)}
                className="flex min-h-36 flex-col items-center justify-center gap-3 rounded-lg border border-blue-100 bg-white p-5 text-blue-950 shadow-sm hover:border-blue-700 hover:bg-blue-50"
              >
                <Icon aria-hidden="true" className="size-12" />
                <span className="text-2xl font-black">{label}</span>
              </button>
            ))}
          </section>

          <section aria-labelledby="alerts-title" className="rounded-lg bg-blue-50 p-6">
            <div className="flex items-center gap-3">
              <Bell aria-hidden="true" className="size-8 text-blue-900" />
              <h2 id="alerts-title" className="text-2xl font-black text-blue-950">
                Avisos importantes
              </h2>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <article className="rounded-lg border-l-8 border-green-700 bg-white p-4">
                <h3 className="text-xl font-black text-gray-950">
                  {usualRoute ? `${usualRoute.code} sin retrasos` : 'Servicio activo'}
                </h3>
                <p className="mt-1 text-gray-700">Tu ruta recomendada esta disponible.</p>
              </article>
              <article className="rounded-lg border-l-8 border-amber-600 bg-white p-4">
                <h3 className="text-xl font-black text-gray-950">
                  {delayedRoute ? `${delayedRoute.code} con retraso` : 'Camina con precaucion'}
                </h3>
                <p className="mt-1 text-gray-700">
                  Revisa el seguimiento antes de salir hacia la parada.
                </p>
              </article>
            </div>
          </section>
        </section>

        <aside className="space-y-4" aria-label="Ayuda rapida">
          <button
            type="button"
            onClick={startVoiceHelp}
            className="flex min-h-48 w-full flex-col items-center justify-center gap-4 rounded-lg bg-blue-800 p-6 text-white shadow-sm hover:bg-blue-900"
          >
            <Mic aria-hidden="true" className="size-16" />
            <span className="text-3xl font-black">Hablar</span>
          </button>
          <button
            type="button"
            onClick={() => setMessage('Se notifico a tu contacto de emergencia de demostracion.')}
            className="flex min-h-32 w-full items-center justify-between rounded-lg bg-red-700 p-6 text-left text-white shadow-sm hover:bg-red-800"
          >
            <span>
              <span className="block text-3xl font-black">Ayuda</span>
              <span className="text-base">Contacto de emergencia</span>
            </span>
            <Siren aria-hidden="true" className="size-12" />
          </button>
          <div className="rounded-lg border border-blue-100 bg-white p-5" role="status" aria-live="polite">
            <div className="flex items-center gap-3">
              <Bus aria-hidden="true" className="size-7 text-green-800" />
              <p className="text-lg font-bold text-gray-950">{message}</p>
            </div>
          </div>
        </aside>
      </main>

      <AccessibilityMenu />
    </div>
  )
}

export default ElderlyModePage
