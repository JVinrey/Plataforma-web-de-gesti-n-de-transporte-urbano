import { NavLink, Outlet } from 'react-router-dom'

// Navegación del panel de administración de flota.
const ADMIN_LINKS = [
  { to: '/fleet', label: 'Panel de Flota', icon: 'dashboard' },
  { to: '/route-planning', label: 'Planificación de Rutas', icon: 'map' },
  { to: '/schedules', label: 'Horarios', icon: 'calendar_today' },
  { to: '/driver-performance', label: 'Desempeño de Conductores', icon: 'monitoring' },
]

/**
 * AdminShell — armazón compartido del panel de administración de flota.
 * Sidebar fija + contenido vía <Outlet />. Reemplaza las sidebars duplicadas
 * que vivían en cada página admin. WCAG 2.2 AA: HTML semántico, navegación por
 * teclado, nombres/roles en controles y contraste >= 4.5:1.
 */
export function AdminShell() {
  return (
    <div className="flex h-screen overflow-hidden bg-background text-on-background">
      {/* Skip-link WCAG 2.4.1 */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:m-2 focus:rounded focus:bg-primary focus:px-4 focus:py-2 focus:text-on-primary"
      >
        Saltar al contenido principal
      </a>

      {/* Sidebar fija */}
      <aside
        className="fixed left-0 top-0 z-50 flex h-screen w-64 flex-col overflow-y-auto border-r border-outline-variant bg-surface-container-low px-md py-lg shadow-sm"
        aria-label="Panel de administración"
      >
        <div className="mb-xl flex items-center gap-md">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-container text-on-primary-container">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              directions_bus
            </span>
          </div>
          <div>
            <p className="font-title-lg font-bold leading-none text-primary">Manta Transit</p>
            <p className="font-label-lg text-on-surface-variant">Fleet Control Center</p>
          </div>
        </div>

        <nav className="flex-1 space-y-xs" aria-label="Navegación de administración">
          {ADMIN_LINKS.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-md rounded-xl px-md py-sm font-label-lg transition-colors ${
                  isActive
                    ? 'bg-secondary-container font-bold text-on-secondary-container'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`
              }
              aria-label={label}
            >
              <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                {icon}
              </span>
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Contenido principal */}
      <main id="main-content" className="ml-64 flex-1 overflow-y-auto" tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  )
}

export default AdminShell
