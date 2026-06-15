import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { AccessibilityMenu } from '../accessibility/AccessibilityMenu'
import { useAccessibilityStore } from '../../stores/accessibility-store'
import { getUiCopy } from '../../utils/ui-copy'

const PAGE_BG = '#edf3fb'

/**
 * PassengerShell — armazón compartido de la app de pasajeros.
 * Layout puro: cabecera con buscador + sidebar de navegación + <Outlet />.
 * Reutiliza los tokens del sistema de diseño y cumple WCAG 2.2 AA (HTML
 * semántico, navegación por teclado, nombres/roles en controles, contraste
 * >= 4.5:1).
 */
export function PassengerShell() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const language = useAccessibilityStore((state) => state.preferences.language)
  const copy = getUiCopy(language).passengerShell

  // Búsqueda funcional: navega al listado de rutas con el término aplicado.
  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = search.trim()
    navigate(q ? `/rutas?q=${encodeURIComponent(q)}` : '/rutas')
  }

  return (
    <div
      className="flex min-h-screen flex-col text-on-background"
      style={{ backgroundColor: PAGE_BG }}
    >
      {/* Skip-link WCAG 2.4.1 */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:m-2 focus:rounded focus:bg-primary focus:px-4 focus:py-2 focus:text-on-primary"
      >
        {copy.skipLink}
      </a>

      {/* Cabecera */}
      <header className="flex h-20 shrink-0 items-center gap-lg px-lg">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsSidebarOpen((value) => !value)}
            className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container focus-visible:outline-3"
            aria-label={isSidebarOpen ? copy.sidebarToggleClose : copy.sidebarToggleOpen}
            aria-expanded={isSidebarOpen}
          >
            <span className="material-symbols-outlined text-[22px]">
              {isSidebarOpen ? 'menu_open' : 'menu'}
            </span>
          </button>
          <Link to="/" className="w-48 shrink-0 text-2xl font-bold text-primary">
            {copy.brand}
          </Link>
        </div>
        <form role="search" onSubmit={submitSearch} className="relative w-full max-w-md">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-on-surface-variant">
            <span className="material-symbols-outlined text-[20px]">search</span>
          </span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border-none bg-surface-container py-3 pl-11 pr-4 font-body-md focus:ring-2 focus:ring-primary"
            placeholder={copy.searchPlaceholder}
            aria-label={copy.searchPlaceholder}
          />
          <button type="submit" className="sr-only">
            {language === 'es' ? 'Buscar' : 'Search'}
          </button>
        </form>
        <div className="ml-auto flex items-center gap-sm">
          <button
            type="button"
            className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container focus-visible:outline-3"
            aria-label={copy.languageLabel}
          >
            <span className="material-symbols-outlined">language</span>
          </button>
          <Link
            to="/"
            className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container focus-visible:outline-3"
            aria-label={copy.homeLabel}
          >
            <span className="material-symbols-outlined">home</span>
          </Link>
          <div className="mx-sm h-7 w-px bg-outline-variant" aria-hidden="true" />
          <Link
            to="/login"
            className="rounded-lg px-3 py-2 font-label-lg font-semibold text-primary hover:bg-surface-container focus-visible:outline-3"
          >
            {copy.loginLabel}
          </Link>
          <Link
            to="/register"
            className="rounded-lg bg-primary px-4 py-2 font-label-lg font-semibold text-on-primary transition-opacity hover:opacity-90 focus-visible:outline-3"
          >
            {copy.registerLabel}
          </Link>
        </div>
      </header>

      {/* Cuerpo */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={[
            'hidden shrink-0 flex-col overflow-hidden border-r border-outline-variant/40 pb-lg transition-[width] duration-300 ease-in-out md:flex',
            isSidebarOpen ? 'w-72 px-lg lg:w-80' : 'w-24 px-3 lg:w-28',
          ].join(' ')}
        >
          <div className={isSidebarOpen ? 'mb-lg px-lg' : 'mb-lg flex justify-center px-0'}>
            {isSidebarOpen ? (
              <div>
                <p className="font-title-lg font-bold leading-none text-primary">{copy.sidebarTitle}</p>
                <p className="font-label-md text-on-surface-variant">{copy.sidebarSubtitle}</p>
              </div>
            ) : (
              <div className="flex size-12 items-center justify-center rounded-2xl bg-surface-container text-primary">
                <span className="material-symbols-outlined" aria-hidden="true">
                  directions_bus
                </span>
              </div>
            )}
          </div>
          <nav className="flex-1 space-y-sm" aria-label={copy.mainNavLabel}>
            {copy.navItems.map(({ to, label }, index) => {
              const icon = ['home', 'route', 'directions_bus', 'my_location', 'account_balance_wallet', 'notifications', 'history'][index] ?? 'circle'

              return (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  [
                    'flex items-center rounded-xl py-3 transition-colors',
                    isSidebarOpen ? 'gap-md px-lg' : 'justify-center px-3',
                    isActive
                      ? 'bg-[#7fe0a6] font-semibold text-[#0b4429]'
                      : 'text-on-surface-variant hover:bg-surface-container',
                  ].join(' ')
                }
              >
                <span className="material-symbols-outlined">{icon}</span>
                <span className={isSidebarOpen ? 'font-body-md font-medium' : 'sr-only'}>{label}</span>
              </NavLink>
              )
            })}
          </nav>

          <div className="mt-lg border-t border-outline-variant pt-lg">
            <NavLink
              to="/asistente"
              className={({ isActive }) =>
                [
                  'flex items-center rounded-xl py-3 transition-colors',
                  isSidebarOpen ? 'gap-md px-lg' : 'justify-center px-3',
                  isActive
                    ? 'bg-[#7fe0a6] font-semibold text-[#0b4429]'
                    : 'text-on-surface-variant hover:bg-surface-container',
                ].join(' ')
              }
            >
              <span className="material-symbols-outlined">smart_toy</span>
              <span className={isSidebarOpen ? 'font-body-md font-medium' : 'sr-only'}>{copy.assistantLabel}</span>
            </NavLink>
          </div>

          {isSidebarOpen ? (
            <div className="mt-xl px-lg">
              <p className="font-label-md uppercase tracking-wider text-on-surface-variant">
                {copy.systemStateLabel}
              </p>
              <p className="mt-xs flex items-center gap-sm font-body-md font-semibold text-secondary">
                <span className="h-2.5 w-2.5 rounded-full bg-secondary" aria-hidden="true" />
                {copy.operationalLabel}
              </p>
            </div>
          ) : (
            <div className="mt-xl flex justify-center px-0">
              <div className="flex size-12 items-center justify-center rounded-full bg-secondary/10 text-secondary" aria-hidden="true">
                <span className="material-symbols-outlined text-[20px]">verified</span>
              </div>
            </div>
          )}
        </aside>

        {/* Contenido */}
        <main id="main-content" className="flex-1 overflow-y-auto px-lg pb-xl pt-lg" tabIndex={-1}>
          <Outlet />
        </main>
      </div>

      <AccessibilityMenu />
    </div>
  )
}

export default PassengerShell
