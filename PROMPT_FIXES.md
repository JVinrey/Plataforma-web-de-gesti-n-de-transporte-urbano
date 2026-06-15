# Prompt para Claude Code — Corrección arquitectural del proyecto Manta Transit

Carga este prompt en Claude Code desde la raíz del proyecto (`Plataforma-web-de-gesti-n-de-transporte-urbano/`).

---

## Contexto del problema

El proyecto tiene **tres sistemas de layout en conflicto** que causan que la sidebar/navegación cambie inconsistentemente al navegar:

1. **`AppLayout`** (cabecera pública con nav superior) — envuelve rutas públicas via `<Route element={<AppLayout />}>` con Outlet  
2. **`PassengerShell`** (sidebar de pasajero) — algunas páginas lo importan y envuelven su contenido manualmente (`<PassengerShell>{...}</PassengerShell>`), otras páginas del mismo "zone" no lo usan en absoluto  
3. **Sidebars admin inline** — duplicadas en cada uno de los 4 archivos de admin (FleetPage, RoutePlanningPage, SchedulesPage, DriverPerformancePage)  

Además hay **cross-contamination de navegación**:
- `AppLayout` NAV_LINKS incluye rutas `/adulto-mayor`, `/seguimiento-pago`, `/historial` que pertenecen al zone PassengerShell → al hacer clic el layout cambia
- `PassengerShell` PRIMARY_LINKS tiene `{ to: '/', ... }` que lleva al zone AppLayout → mismo problema

## Tareas a realizar

### TAREA 1 — Refactorizar PassengerShell para usar Outlet

**Archivo: `src/components/layout/PassengerShell.tsx`**

Actualmente `PassengerShell` acepta `children: ReactNode`. Cámbialo para usar `<Outlet />` de `react-router-dom` en lugar de `{children}`, y elimina la prop `children` (y `activePath`, `showAssistant`, `searchPlaceholder` si son hardcodeables internamente o conviértelas en valores fijos razonables).

El cambio clave:
```tsx
// ANTES
import type { ReactNode } from 'react'
// ...
interface PassengerShellProps {
  children: ReactNode
  activePath?: string
  showAssistant?: boolean
  searchPlaceholder?: string
}
export function PassengerShell({ children, ... }: PassengerShellProps) {
  return (
    <div ...>
      {/* header + sidebar */}
      <main>
        {children}
      </main>
    </div>
  )
}

// DESPUÉS
import { Outlet } from 'react-router-dom'
// Sin props - PassengerShell es un layout puro
export function PassengerShell() {
  return (
    <div ...>
      {/* header + sidebar - igual que antes */}
      <main id="main-content" className="flex-1 overflow-y-auto p-lg" tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  )
}
```

También corrige el link de inicio en PRIMARY_LINKS:
```tsx
// ANTES
{ to: '/', label: 'Inicio', icon: 'home' },
// DESPUÉS  
{ to: '/inicio', label: 'Inicio', icon: 'home' },
```

---

### TAREA 2 — Crear AdminShell como layout compartido

**Crear archivo: `src/components/layout/AdminShell.tsx`**

Extrae la sidebar duplicada de las 4 páginas admin en un componente layout único que use `<Outlet />`. Basa el diseño en el sidebar existente de FleetPage (que tiene el mejor markup).

```tsx
import { NavLink, Outlet } from 'react-router-dom'

const ADMIN_LINKS = [
  { to: '/fleet', label: 'Panel de Flota', icon: 'dashboard' },
  { to: '/route-planning', label: 'Planificación de Rutas', icon: 'map' },
  { to: '/schedules', label: 'Horarios', icon: 'calendar_today' },
  { to: '/driver-performance', label: 'Desempeño de Conductores', icon: 'monitoring' },
]

export function AdminShell() {
  return (
    <div className="flex h-screen bg-background text-on-background overflow-hidden">
      {/* Sidebar fijo */}
      <aside
        className="w-64 bg-surface-container-low border-r border-outline-variant shadow-sm flex flex-col py-lg px-md fixed left-0 top-0 h-screen z-50 overflow-y-auto"
        aria-label="Panel de administración"
      >
        <div className="mb-xl flex items-center gap-md">
          <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center text-on-primary-container">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              directions_bus
            </span>
          </div>
          <div>
            <p className="font-title-lg font-bold text-primary leading-none">Manta Transit</p>
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
                    ? 'bg-secondary-container text-on-secondary-container'
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
      <main
        id="main-content"
        className="ml-64 flex-1 overflow-y-auto"
        tabIndex={-1}
      >
        <Outlet />
      </main>
    </div>
  )
}
```

---

### TAREA 3 — Reorganizar App.tsx con los tres zones correctos

**Archivo: `src/App.tsx`**

Reemplaza la lógica de routing actual con tres grupos bien definidos. Importa `PassengerShell` y el nuevo `AdminShell`:

```tsx
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { PassengerShell } from './components/layout/PassengerShell'
import { AdminShell } from './components/layout/AdminShell'
import {
  AlertsPage,
  AssistantPage,
  DriverPerformancePage,
  ElderlyModePage,
  FleetPage,
  GuestHomePage,
  HistoryNotificationsPage,
  HomePage,
  LoginPage,
  NotFoundPage,
  ProfilePage,
  RegisterPage,
  RouteDetailPage,
  RoutePlanningPage,
  RoutesPage,
  SchedulesPage,
  TripPage,
  TripPlannerPage,
  TripRatingPage,
  TrackingPaymentPage,
  WalletPage,
} from './pages'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ZONE 1 — Sitio público (cabecera + nav superior) */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/rutas" element={<RoutesPage />} />
          <Route path="/viaje/:id" element={<TripPage />} />
          <Route path="/perfil" element={<ProfilePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* ZONE 2 — App de pasajeros (sidebar PassengerShell) */}
        <Route element={<PassengerShell />}>
          <Route path="/inicio" element={<GuestHomePage />} />
          <Route path="/planificar-viaje" element={<TripPlannerPage />} />
          <Route path="/adulto-mayor" element={<ElderlyModePage />} />
          <Route path="/seguimiento-pago" element={<TrackingPaymentPage />} />
          <Route path="/historial" element={<HistoryNotificationsPage />} />
          <Route path="/asistente" element={<AssistantPage />} />
          <Route path="/alertas" element={<AlertsPage />} />
          <Route path="/calificar" element={<TripRatingPage />} />
          <Route path="/billetera" element={<WalletPage />} />
          <Route path="/rutas/:id" element={<RouteDetailPage />} />
        </Route>

        {/* ZONE 3 — Panel de administración (sidebar AdminShell) */}
        <Route element={<AdminShell />}>
          <Route path="/fleet" element={<FleetPage />} />
          <Route path="/route-planning" element={<RoutePlanningPage />} />
          <Route path="/schedules" element={<SchedulesPage />} />
          <Route path="/driver-performance" element={<DriverPerformancePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
```

---

### TAREA 4 — Eliminar PassengerShell de las páginas que lo importan directamente

Las siguientes páginas actualmente importan y usan `PassengerShell` como wrapper. Como ahora el layout viene del router, cada página solo debe retornar su contenido sin el wrapper:

**Páginas afectadas:**
- `src/pages/AssistantPage.tsx`
- `src/pages/AlertsPage.tsx`
- `src/pages/TripRatingPage.tsx`
- `src/pages/WalletPage.tsx`
- `src/pages/RouteDetailPage.tsx`

En cada una:
1. Elimina el `import { PassengerShell } from '../components/layout/PassengerShell'`
2. El componente ya no envuelve su return en `<PassengerShell ...>`. El contenido interno (lo que estaba dentro del PassengerShell) pasa a ser el return directo del componente.
3. Si había props como `activePath` o `showAssistant` en el PassengerShell wrapper, elimínalas.

Ejemplo de patrón antes/después:

```tsx
// ANTES
export function AlertsPage() {
  return (
    <PassengerShell activePath="/alertas">
      <div className="...">
        {/* contenido */}
      </div>
    </PassengerShell>
  )
}

// DESPUÉS
export function AlertsPage() {
  return (
    <div className="...">
      {/* mismo contenido */}
    </div>
  )
}
```

---

### TAREA 5 — Limpiar páginas standalone del zone Pasajero

Estas páginas del zone Pasajero tienen su propia cabecera/nav embebida que ahora es redundante con PassengerShell. Deben eliminarse sus headers/navs propios para que solo retornen el contenido de la página:

**`src/pages/TripPlannerPage.tsx`** — Tiene un NavLink-based nav bar y un `<AccessibilityMenu />` propio. Elimina:
- El bloque `<nav>` superior con los NavLinks de navegación (Inicio, Rutas, etc.)
- El `<AccessibilityMenu />` embebido (ya lo provee PassengerShell)
- Los imports correspondientes (`NavLink`, `AccessibilityMenu`)
- El fondo/wrapper superior si era parte del nav propio

**`src/pages/HistoryNotificationsPage.tsx`** — Tiene `<AccessibilityMenu />` propio. Elimina ese componente y su import.

**`src/pages/TrackingPaymentPage.tsx`** — Tiene `<AccessibilityMenu />` propio. Elimina ese componente y su import.

**`src/pages/GuestHomePage.tsx`** — Tiene su propio header completo con logo, nav links y `<AccessibilityMenu />`. Elimina todo el header (logo, nav, accessibility menu) ya que PassengerShell lo provee. Solo conserva el contenido de la página (el hero, secciones, etc.).

**`src/pages/ElderlyModePage.tsx`** — Si tiene nav/header propio, elimínalo. El contenido de la página (modo adulto mayor) se renderiza directamente.

---

### TAREA 6 — Limpiar sidebar duplicada de las páginas Admin

Las siguientes páginas tienen su sidebar hardcodeada internamente. Como ahora `AdminShell` provee la sidebar via Outlet, hay que eliminar ese bloque de cada página:

**Páginas afectadas:**
- `src/pages/FleetPage.tsx`
- `src/pages/RoutePlanningPage.tsx`
- `src/pages/SchedulesPage.tsx`
- `src/pages/DriverPerformancePage.tsx`

En cada una:
1. Elimina el `<aside>` completo que contiene la sidebar de navegación admin
2. Elimina el `<div className="flex h-screen ... overflow-hidden">` wrapper externo (ese ahora lo provee AdminShell)
3. El contenido principal (el `<main>` o el div de contenido) pasa a ser el return directo del componente
4. Elimina imports de `Link` si solo se usaban para la sidebar (verifica si se usan en el contenido también)

---

### TAREA 7 — Corregir AppLayout NAV_LINKS

**Archivo: `src/components/layout/AppLayout.tsx`**

Los NAV_LINKS actuales contienen rutas del zone Pasajero que causan el cambio de layout. Corrígelos:

```tsx
// ANTES — Links incorrectos que cruzan a PassengerShell zone
const NAV_LINKS = [
  { to: '/', label: 'Inicio' },
  { to: '/rutas', label: 'Rutas' },
  { to: '/adulto-mayor', label: 'Adulto mayor' },      // ← INCORRECTO: zone PassengerShell
  { to: '/seguimiento-pago', label: 'Seguimiento/QR' }, // ← INCORRECTO: zone PassengerShell
  { to: '/historial', label: 'Historial' },             // ← INCORRECTO: zone PassengerShell
  { to: '/perfil', label: 'Perfil' },
  { to: '/login', label: 'Iniciar sesión' },
]

// DESPUÉS — Solo rutas dentro del zone AppLayout
const NAV_LINKS = [
  { to: '/', label: 'Inicio' },
  { to: '/rutas', label: 'Rutas' },
  { to: '/perfil', label: 'Perfil' },
  { to: '/login', label: 'Iniciar sesión' },
]
```

Si quieres mantener un link para entrar al app de pasajero, agrega:
```tsx
{ to: '/inicio', label: 'Abrir App' },  // Entra al zone PassengerShell
```

---

### TAREA 8 — Verificar exports en `src/pages/index.ts`

Confirma que `PassengerShell` y `AdminShell` **no** están en el index de páginas (son layouts, van en `src/components/layout/`). Si hay exports de layouts en pages/index.ts, muévelos.

---

### TAREA 9 — Verificar que el build compila sin errores

Después de todos los cambios:

```bash
npm run build
```

Si hay errores de TypeScript por props eliminadas (`activePath`, `showAssistant`, etc. de PassengerShell), corrígelos — esas props ya no existen.

Si hay errores por imports no encontrados, revisa que los eliminaste correctamente.

```bash
npm run lint
```

Corrige cualquier import sin usar que quedara tras los refactors.

---

### TAREA 10 — (Opcional pero recomendado) Agregar skip-link de accesibilidad en layouts

En `PassengerShell` y `AdminShell`, agrega un skip-link al inicio del componente (antes del header/sidebar) para cumplir WCAG 2.4.1:

```tsx
{/* Skip-link WCAG 2.4.1 */}
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:m-2 focus:rounded focus:bg-primary focus:px-4 focus:py-2 focus:text-on-primary"
>
  Saltar al contenido principal
</a>
```

El `<main id="main-content">` que ya especifiqué en AdminShell y PassengerShell actúa como destino del skip-link.

---

## Orden de ejecución recomendado

1. TAREA 2 (crear AdminShell) — no depende de nada, se puede hacer primero
2. TAREA 1 (refactorizar PassengerShell) — cambio de children a Outlet
3. TAREA 3 (reorganizar App.tsx) — depende de que PassengerShell y AdminShell estén listos
4. TAREA 4 (quitar PassengerShell de páginas) — depende de TAREA 3
5. TAREA 5 (limpiar páginas standalone pasajero) — depende de TAREA 3
6. TAREA 6 (limpiar sidebar de páginas admin) — depende de TAREA 3
7. TAREA 7 (corregir AppLayout NAV_LINKS) — independiente, hacer en cualquier momento
8. TAREA 9 (build + lint) — al final para verificar
