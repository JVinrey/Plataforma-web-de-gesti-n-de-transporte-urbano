import type { ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { AccessibilityMenu } from '../accessibility/AccessibilityMenu'

// Navegación principal de la app de pasajeros (modo invitado).
const PRIMARY_LINKS = [
  { to: '/', label: 'Inicio', icon: 'home' },
  { to: '/planificar-viaje', label: 'Rutas', icon: 'directions_bus' },
  { to: '/seguimiento-pago', label: 'Seguimiento', icon: 'my_location' },
  { to: '/alertas', label: 'Alertas', icon: 'notifications' },
  { to: '/historial', label: 'Historial', icon: 'history' },
]

const PAGE_BG = '#edf3fb'

interface PassengerShellProps {
  /** Contenido principal de la página. */
  children: ReactNode
  /** Marca un enlace del menú como activo aunque la ruta no coincida exactamente. */
  activePath?: string
  /** Muestra el ítem destacado "Asistente AI" al final del menú. */
  showAssistant?: boolean
  /** Texto del buscador superior. */
  searchPlaceholder?: string
}

/**
 * PassengerShell — armazón compartido de la app de pasajeros.
 * Cabecera con buscador + sidebar de navegación. Reutiliza los tokens del
 * sistema de diseño y cumple WCAG 2.2 AA (HTML semántico, navegación por
 * teclado, nombres/roles en controles, contraste >= 4.5:1).
 */
export function PassengerShell({
  children,
  activePath,
  showAssistant = true,
  searchPlaceholder = 'Buscar rutas o paradas...',
}: PassengerShellProps) {
  return (
    <div
      className="flex min-h-screen flex-col text-on-background"
      style={{ backgroundColor: PAGE_BG }}
    >
      {/* Cabecera */}
      <header className="flex h-20 shrink-0 items-center gap-lg px-lg">
        <Link to="/" className="w-48 shrink-0 text-2xl font-bold text-primary">
          Manta Transit
        </Link>
        <div className="relative w-full max-w-md">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-on-surface-variant">
            <span className="material-symbols-outlined text-[20px]">search</span>
          </span>
          <input
            type="search"
            className="w-full rounded-full border-none bg-surface-container py-3 pl-11 pr-4 font-body-md focus:ring-2 focus:ring-primary"
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
          />
        </div>
        <div className="ml-auto flex items-center gap-sm">
          <button
            type="button"
            className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container focus-visible:outline-3"
            aria-label="Cambiar idioma"
          >
            <span className="material-symbols-outlined">language</span>
          </button>
          <Link
            to="/inicio"
            className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container focus-visible:outline-3"
            aria-label="Opciones de accesibilidad"
          >
            <span className="material-symbols-outlined">accessibility_new</span>
          </Link>
          <div className="mx-sm h-7 w-px bg-outline-variant" aria-hidden="true" />
          <Link
            to="/login"
            className="rounded-lg px-3 py-2 font-label-lg font-semibold text-primary hover:bg-surface-container focus-visible:outline-3"
          >
            Ingresar
          </Link>
          <Link
            to="/register"
            className="rounded-lg bg-primary px-4 py-2 font-label-lg font-semibold text-on-primary transition-opacity hover:opacity-90 focus-visible:outline-3"
          >
            Registrarse
          </Link>
        </div>
      </header>

      {/* Cuerpo */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="hidden w-56 shrink-0 flex-col px-md pb-lg md:flex">
          <div className="mb-md px-md">
            <p className="font-title-lg font-bold leading-none text-primary">Manta Transit</p>
            <p className="font-label-md text-on-surface-variant">Urban Mobility</p>
          </div>
          <nav className="flex-1 space-y-xs" aria-label="Navegación principal">
            {PRIMARY_LINKS.map(({ to, label, icon }) => {
              const isActive = activePath ? activePath === to : undefined
              return (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={({ isActive: routeActive }) =>
                    [
                      'flex items-center gap-md rounded-xl px-md py-sm transition-colors',
                      (isActive ?? routeActive)
                        ? 'bg-[#7fe0a6] font-semibold text-[#0b4429]'
                        : 'text-on-surface-variant hover:bg-surface-container',
                    ].join(' ')
                  }
                >
                  <span className="material-symbols-outlined">{icon}</span>
                  <span className="font-body-md font-medium">{label}</span>
                </NavLink>
              )
            })}
          </nav>

          {showAssistant && (
            <div className="mt-md border-t border-outline-variant pt-md">
              <NavLink
                to="/asistente"
                className={({ isActive }) =>
                  [
                    'flex items-center gap-md rounded-xl px-md py-sm transition-colors',
                    isActive
                      ? 'bg-[#7fe0a6] font-semibold text-[#0b4429]'
                      : 'text-on-surface-variant hover:bg-surface-container',
                  ].join(' ')
                }
              >
                <span className="material-symbols-outlined">smart_toy</span>
                <span className="font-body-md font-medium">Asistente AI</span>
              </NavLink>
            </div>
          )}

          <div className="mt-lg px-md">
            <p className="font-label-md uppercase tracking-wider text-on-surface-variant">
              Estado del sistema
            </p>
            <p className="mt-xs flex items-center gap-sm font-body-md font-semibold text-secondary">
              <span className="h-2.5 w-2.5 rounded-full bg-secondary" aria-hidden="true" />
              Operativo
            </p>
          </div>
        </aside>

        {/* Contenido */}
        <main className="flex-1 overflow-y-auto px-lg pb-xl">{children}</main>
      </div>

      <AccessibilityMenu />
    </div>
  )
}

export default PassengerShell
