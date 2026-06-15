import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { AccessibilityMenu } from '../accessibility/AccessibilityMenu'
import { useAccessibilityStore } from '../../stores/accessibility-store'
import { getUiCopy } from '../../utils/ui-copy'
import { cn } from '../../utils/cn'

export function AppLayout() {
  const location = useLocation()
  const language = useAccessibilityStore((state) => state.preferences.language)
  const copy = getUiCopy(language).appLayout
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register'

  return (
    <div className="flex min-h-screen flex-col">
      {/* Skip link (WCAG 2.4.1 Evitar bloques) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-md focus:bg-blue-700 focus:px-4 focus:py-2 focus:text-white"
      >
        {copy.skipLink}
      </a>

      <header role="banner" className="border-b border-gray-300 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3">
          <NavLink to="/" className="text-lg font-bold text-blue-800">
            {copy.brand}
          </NavLink>
          <nav aria-label={copy.mainNavLabel}>
            <ul className="flex flex-wrap gap-2">
              {copy.navItems.map(({ to, label }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    className={({ isActive }) =>
                      cn(
                        'rounded-md px-3 py-2 text-gray-900 hover:bg-blue-50 hover:text-blue-800',
                        isActive && 'bg-blue-100 font-semibold text-blue-900',
                      )
                    }
                  >
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <main
        id="main-content"
        tabIndex={-1}
        className={cn(
          'flex-1 pb-20',
          isAuthPage ? 'w-full px-4 py-4' : 'mx-auto w-full max-w-6xl px-4 py-6',
        )}
      >
        <Outlet />
      </main>

      <footer role="contentinfo" className="border-t border-gray-300 bg-gray-50">
        <div className="mx-auto w-full max-w-6xl px-4 py-4 text-sm text-gray-700">
          <p>{copy.footer}</p>
        </div>
      </footer>

      <AccessibilityMenu />
    </div>
  )
}
