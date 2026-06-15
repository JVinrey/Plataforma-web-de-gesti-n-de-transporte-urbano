import { NavLink, Navigate, Outlet } from 'react-router-dom'
import { Spinner } from '../ui/Spinner'
import { useProfile } from '../../hooks/use-profile'
import { useAuthStore } from '../../stores/auth-store'
import { useAccessibilityStore } from '../../stores/accessibility-store'
import { getUiCopy } from '../../utils/ui-copy'

/**
 * AdminShell — armazón compartido del panel de administración de flota.
 * Sidebar fija + contenido vía <Outlet />. Reemplaza las sidebars duplicadas
 * que vivían en cada página admin. WCAG 2.2 AA: HTML semántico, navegación por
 * teclado, nombres/roles en controles y contraste >= 4.5:1.
 */
export function AdminShell() {
  const user = useAuthStore((state) => state.user)
  const language = useAccessibilityStore((state) => state.preferences.language)
  const copy = getUiCopy(language).adminShell
  const { data: profile, isLoading: profileLoading } = useProfile()
  const displayName = profile?.full_name ?? user?.user_metadata?.full_name ?? user?.email ?? 'Administración'
  const isAdmin = profile?.user_type === 'admin' || user?.user_metadata?.user_type === 'admin'

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (profileLoading && !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-on-background">
        <Spinner label={copy.loadingLabel} />
      </div>
    )
  }

  if (!isAdmin) {
    return <Navigate to="/perfil" replace />
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background text-on-background">
      {/* Skip-link WCAG 2.4.1 */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:m-2 focus:rounded focus:bg-primary focus:px-4 focus:py-2 focus:text-on-primary"
      >
        {copy.skipLink}
      </a>

      {/* Sidebar fija */}
      <aside
        className="fixed left-0 top-0 z-50 flex h-screen w-64 flex-col overflow-y-auto border-r border-outline-variant bg-surface-container-low px-md py-lg shadow-sm"
        aria-label={copy.adminLabel}
      >
        <div className="mb-xl flex items-center gap-md">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-container text-on-primary-container">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              directions_bus
            </span>
          </div>
          <div>
            <p className="font-title-lg font-bold leading-none text-primary">{copy.brand}</p>
            <p className="font-label-lg text-on-surface-variant">{displayName}</p>
          </div>
        </div>

        <nav className="flex-1 space-y-xs" aria-label={copy.adminNavLabel}>
          {(copy.adminItems ?? []).map(({ to, label }, index) => {
            const icon = ['dashboard', 'map', 'calendar_today', 'monitoring'][index] ?? 'circle'

            return (
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
            )
          })}
        </nav>
      </aside>

      {/* Contenido principal */}
      <main id="main-content" className="ml-64 flex-1 overflow-y-auto pb-20" tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  )
}

export default AdminShell
