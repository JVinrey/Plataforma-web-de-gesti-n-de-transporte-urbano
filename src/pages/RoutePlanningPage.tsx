import { useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useRoutes, useRouteStops, useStops, useVehicles } from '../hooks/use-transit-data';
import type { RouteRow } from '../hooks/use-transit-data';
import { MantaMap } from '../components/map';
import type { MapVehicle } from '../components/map';

type RouteStatus = RouteRow['status']; // 'on_time' | 'delayed' | 'off_line'

interface PlannedRoute {
  id: string;
  code: string;
  name: string;
  origin: string;
  destination: string;
  buses: number;
  /** Métrica secundaria mostrada junto al nº de buses */
  metric: string;
  metricIcon: string;
  status: RouteStatus;
  frequency: string;
}

const SIDEBAR_LINKS = [
  { to: '/fleet', label: 'Fleet Dashboard', icon: 'dashboard' },
  { to: '/route-planning', label: 'Route Planning', icon: 'map' },
  { to: '/schedules', label: 'Schedules', icon: 'calendar_today' },
  { to: '/driver-performance', label: 'Driver Performance', icon: 'monitoring' },
];

function getStatusBadge(status: RouteStatus) {
  switch (status) {
    case 'on_time':
      return { label: 'On Time', color: 'bg-secondary-container text-on-secondary-container' };
    case 'delayed':
      return { label: 'Delayed', color: 'bg-error-container text-on-error-container' };
    case 'off_line':
      return { label: 'Off-Line', color: 'bg-surface-container-highest text-on-surface-variant' };
  }
}

interface RouteEditPanelProps {
  route: PlannedRoute;
  onClose: () => void;
  onUpdate: (values: { routeName: string; buses: string; frequency: string }) => void;
  onSuspend: () => void;
}

/**
 * Panel de edición de despliegue de una ruta. Mantiene su propio estado de
 * formulario inicializado desde la ruta; el padre lo monta con `key={route.id}`
 * para reiniciarlo al cambiar de ruta (en lugar de sincronizar con un efecto).
 */
function RouteEditPanel({ route, onClose, onUpdate, onSuspend }: RouteEditPanelProps) {
  const [routeName, setRouteName] = useState(route.name);
  const [buses, setBuses] = useState(String(route.buses));
  const [frequency, setFrequency] = useState(route.frequency);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({ routeName, buses, frequency });
  };

  return (
    <form
      onSubmit={handleSubmit}
      aria-label={`Editar despliegue de ${route.code}`}
      className="absolute right-4 top-4 z-[1000] w-72 rounded-xl bg-surface-bright/95 p-lg shadow-lg backdrop-blur"
    >
      <div className="mb-md flex items-center justify-between">
        <h3 className="text-title-lg font-bold text-primary">{route.code}</h3>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-1 text-on-surface-variant transition-colors hover:bg-surface-container focus-visible:outline-3"
          aria-label="Cerrar panel de edición"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      <div className="space-y-md">
        <div>
          <label htmlFor="route-name" className="mb-1 block font-label-md text-on-surface-variant">
            Route Name
          </label>
          <input
            id="route-name"
            type="text"
            value={routeName}
            onChange={(e) => setRouteName(e.target.value)}
            className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 font-body-md text-on-surface focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="grid grid-cols-2 gap-sm">
          <div>
            <label htmlFor="route-buses" className="mb-1 block font-label-md text-on-surface-variant">
              Buses
            </label>
            <select
              id="route-buses"
              value={buses}
              onChange={(e) => setBuses(e.target.value)}
              className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-2 py-2 font-body-md text-on-surface focus:ring-2 focus:ring-primary"
            >
              <option value="0">0 Units</option>
              <option value="2">2 Units</option>
              <option value="4">4 Units</option>
              <option value="6">6 Units</option>
              <option value="8">8 Units</option>
            </select>
          </div>
          <div>
            <label htmlFor="route-freq" className="mb-1 block font-label-md text-on-surface-variant">
              Freq.
            </label>
            <select
              id="route-freq"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-2 py-2 font-body-md text-on-surface focus:ring-2 focus:ring-primary"
            >
              <option value="5m">5m</option>
              <option value="8m">8m</option>
              <option value="10m">10m</option>
              <option value="12m">12m</option>
              <option value="15m">15m</option>
              <option value="20m">20m</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="flex w-full items-center justify-center gap-sm rounded-lg bg-primary px-lg py-2.5 font-label-lg font-bold text-on-primary transition-opacity hover:opacity-90 focus-visible:outline-3"
        >
          <span className="material-symbols-outlined text-[18px]">save</span>
          Update Deployment
        </button>
        <button
          type="button"
          onClick={onSuspend}
          className="w-full rounded-lg py-1 text-center font-label-lg font-bold text-error transition-colors hover:bg-error-container focus-visible:outline-3"
        >
          Suspend Route
        </button>
      </div>
    </form>
  );
}

/**
 * RoutePlanningPage — Route Planning & Optimization
 * Panel de administración WCAG 2.2 AA para planificar y optimizar rutas.
 * - HTML semántico + ARIA (1.3.1, 4.1.2)
 * - Navegable por teclado (2.1.1) con foco visible
 * - Paleta con contraste >= 4.5:1 (1.4.3)
 */
export default function RoutePlanningPage() {
  const { data: routeRows = [], isLoading } = useRoutes();
  const { data: vehicles = [] } = useVehicles();

  // Construye el modelo de vista de rutas a partir de los datos reales,
  // contando los buses asignados a cada ruta desde la tabla vehicles.
  const ROUTES = useMemo<PlannedRoute[]>(() => {
    return routeRows.map((r) => {
      const buses = vehicles.filter((v) => v.route_id === r.id).length;
      return {
        id: r.id,
        code: r.code,
        name: r.name,
        origin: r.origin ?? '—',
        destination: r.destination ?? '—',
        buses,
        metric: `${r.frequency_minutes}m Interval`,
        metricIcon: 'schedule',
        status: r.status,
        frequency: `${r.frequency_minutes}m`,
      };
    });
  }, [routeRows, vehicles]);

  // Selección efectiva: la elegida por el usuario o la primera ruta disponible.
  const [selectedId, setSelectedId] = useState('');
  const selected = ROUTES.find((r) => r.id === selectedId) ?? ROUTES[0];

  const [panelOpen, setPanelOpen] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');

  // Datos reales para el mapa de telemetría: recorrido de la ruta seleccionada,
  // toda la red y vehículos en vivo posicionados sobre Manta.
  const { data: routePath = [] } = useRouteStops(selected?.id ?? null);
  const { data: allStops = [] } = useStops();
  const mapVehicles = useMemo<MapVehicle[]>(
    () =>
      vehicles
        .filter((v) => v.lat != null && v.lng != null)
        .map((v) => ({
          id: v.id,
          plate: v.plate,
          lat: v.lat,
          lng: v.lng,
          status: v.status,
          routeLabel: v.route ? `${v.route.code} · ${v.route.name}` : undefined,
        })),
    [vehicles],
  );

  const selectRoute = (route: PlannedRoute) => {
    setSelectedId(route.id);
    setPanelOpen(true);
    setStatusMessage('');
  };

  const handleUpdate = (values: { routeName: string; buses: string; frequency: string }) => {
    if (!selected) return;
    setStatusMessage(
      `Despliegue actualizado para ${selected.code}: ${values.routeName}, ${values.buses} unidades, frecuencia ${values.frequency}.`,
    );
  };

  const handleSuspend = () => {
    if (!selected) return;
    setStatusMessage(`Ruta ${selected.code} suspendida.`);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background text-on-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-50 flex h-screen w-64 flex-col overflow-y-auto border-r border-outline-variant bg-surface-container-low px-md py-lg shadow-sm">
        <div className="mb-xl flex items-center gap-md px-xs">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-container text-on-primary-container">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              directions_bus
            </span>
          </div>
          <div>
            <h1 className="font-title-lg font-bold leading-none text-primary">Manta Transit</h1>
            <p className="font-label-md text-on-surface-variant">Fleet Control Center</p>
          </div>
        </div>

        <nav className="flex-1 space-y-xs" aria-label="Navegación principal">
          {SIDEBAR_LINKS.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                [
                  'flex items-center gap-md rounded-lg px-md py-sm transition-colors',
                  isActive
                    ? 'bg-secondary-container font-bold text-on-secondary-container'
                    : 'text-on-surface-variant hover:bg-surface-container-high',
                ].join(' ')
              }
            >
              <span className="material-symbols-outlined">{icon}</span>
              <span className="font-label-lg">{label}</span>
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          className="mb-xl mt-md flex items-center justify-center gap-sm rounded-xl bg-primary px-lg py-md font-bold text-on-primary transition-opacity hover:opacity-90 focus-visible:outline-3 focus-visible:outline-offset-2"
        >
          <span className="material-symbols-outlined">add</span>
          New Route
        </button>

        <div className="space-y-xs border-t border-outline-variant pt-lg">
          <a
            href="#settings"
            className="flex items-center gap-md rounded-lg px-md py-sm text-on-surface-variant transition-colors hover:bg-surface-container-high"
          >
            <span className="material-symbols-outlined">settings</span>
            <span className="font-label-lg">Settings</span>
          </a>
          <a
            href="#support"
            className="flex items-center gap-md rounded-lg px-md py-sm text-on-surface-variant transition-colors hover:bg-surface-container-high"
          >
            <span className="material-symbols-outlined">contact_support</span>
            <span className="font-label-lg">Support</span>
          </a>
        </div>
      </aside>

      {/* Main */}
      <div className="ml-64 flex h-screen flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 w-full shrink-0 items-center justify-between border-b border-outline-variant bg-surface-bright px-margin-desktop shadow-sm">
          <div className="relative w-full max-w-md">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-on-surface-variant">
              <span className="material-symbols-outlined text-[20px]">search</span>
            </span>
            <input
              type="search"
              className="w-full rounded-full border-none bg-surface-container py-2 pl-10 pr-4 font-body-md focus:ring-2 focus:ring-primary"
              placeholder="Search routes, vehicles, or stops..."
              aria-label="Buscar rutas, vehículos o paradas"
            />
          </div>
          <div className="flex items-center gap-md">
            <button
              type="button"
              className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container-low focus-visible:outline-3"
              aria-label="Notificaciones"
            >
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button
              type="button"
              className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container-low focus-visible:outline-3"
              aria-label="Historial de actividad"
            >
              <span className="material-symbols-outlined">history</span>
            </button>
            <div className="mx-sm h-8 w-px bg-outline-variant" aria-hidden="true" />
            <div className="flex items-center gap-sm">
              <span className="font-label-lg font-semibold text-on-surface">Transit Manager</span>
              <img
                alt="Foto de perfil de la persona gestora de tránsito"
                className="h-8 w-8 rounded-full border border-outline-variant bg-surface-variant"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBiQz8vvmmW2UYIRsxxzh2BNpa9sgzf4ITbhk2Ay8jCCNabjrDJ1nc9I7QIjm35zy9jBed8Ec4QxHTE3aGfX2nBc33nh6M_NUcgbXgdVlnPQFaIYJfmh_r6mNqcj6rZSVmccx3IPsLmTneLGgNYmggVUi7F2UNhi1-CcST3UMnPPi7pAVjnsXKLSOXi4bHjNqRXAHEJm_ug0Qg18TgEmUD9GePI9PSw4LxgXG3hLZkJsr3oGVb-9LYaatR5th-IRIKWF0KKjKnD3ko"
              />
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-margin-desktop">
          {/* Live region para anuncios de cambios (4.1.3) */}
          <p role="status" aria-live="polite" className="sr-only">
            {statusMessage}
          </p>

          {/* Title row */}
          <div className="mb-lg flex flex-col gap-md md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-headline-lg font-bold text-on-surface">Route Planning &amp; Optimization</h2>
              <p className="text-body-md text-on-surface-variant">
                Manage real-time bus routes and visual telemetry for Manta city network.
              </p>
            </div>
            <div className="flex gap-sm">
              <button
                type="button"
                className="flex items-center gap-xs rounded-lg border border-outline px-lg py-2 font-label-lg text-on-surface-variant transition-colors hover:bg-surface-container focus-visible:outline-3"
              >
                <span className="material-symbols-outlined text-[18px]">download</span>
                Export CSV
              </button>
              <button
                type="button"
                className="flex items-center gap-xs rounded-lg bg-primary px-lg py-2 font-label-lg text-on-primary transition-opacity hover:opacity-90 focus-visible:outline-3"
              >
                <span className="material-symbols-outlined text-[18px]">insights</span>
                Analyze Coverage
              </button>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-gutter">
            {/* Left column */}
            <div className="col-span-12 space-y-lg lg:col-span-4">
              {/* Fleet Status Overview */}
              <section
                aria-labelledby="fleet-status-title"
                className="rounded-xl border border-outline-variant/40 bg-surface-container-lowest p-lg shadow-sm"
              >
                <h3
                  id="fleet-status-title"
                  className="font-label-md uppercase tracking-wider text-on-surface-variant"
                >
                  Fleet Status Overview
                </h3>
                <dl className="mt-md grid grid-cols-3 gap-sm text-center">
                  <div>
                    <dd className="text-[32px] font-bold leading-none text-secondary">
                      {vehicles.filter((v) => v.status === 'on_time').length}
                    </dd>
                    <dt className="mt-xs font-label-md text-on-surface-variant">Active</dt>
                  </div>
                  <div>
                    <dd className="text-[32px] font-bold leading-none text-[#9a5b00]">
                      {vehicles.filter((v) => v.status === 'delayed').length}
                    </dd>
                    <dt className="mt-xs font-label-md text-on-surface-variant">Delayed</dt>
                  </div>
                  <div>
                    <dd className="text-[32px] font-bold leading-none text-error">
                      {vehicles.filter((v) => v.status === 'maintenance').length}
                    </dd>
                    <dt className="mt-xs font-label-md text-on-surface-variant">Inactive</dt>
                  </div>
                </dl>
              </section>

              {/* Active Routes */}
              <section
                aria-labelledby="active-routes-title"
                className="rounded-xl border border-outline-variant/40 bg-surface-container-lowest shadow-sm"
              >
                <div className="flex items-center justify-between border-b border-outline-variant px-lg py-md">
                  <h3 id="active-routes-title" className="text-title-lg font-bold text-on-surface">
                    Active Routes
                  </h3>
                  <button
                    type="button"
                    className="rounded-lg p-1 text-on-surface-variant transition-colors hover:bg-surface-container focus-visible:outline-3"
                    aria-label="Filtrar rutas activas"
                  >
                    <span className="material-symbols-outlined">filter_list</span>
                  </button>
                </div>
                <ul className="divide-y divide-outline-variant" role="list">
                  {isLoading && (
                    <li className="px-lg py-md font-label-lg text-on-surface-variant">Cargando rutas…</li>
                  )}
                  {!isLoading && ROUTES.length === 0 && (
                    <li className="px-lg py-md font-label-lg text-on-surface-variant">No hay rutas registradas.</li>
                  )}
                  {ROUTES.map((route) => {
                    const badge = getStatusBadge(route.status);
                    const isSelected = route.id === selectedId;
                    return (
                      <li key={route.id}>
                        <button
                          type="button"
                          onClick={() => selectRoute(route)}
                          aria-pressed={isSelected}
                          className={[
                            'flex w-full flex-col gap-xs px-lg py-md text-left transition-colors hover:bg-surface-container-low focus-visible:outline-3 focus-visible:-outline-offset-2',
                            isSelected ? 'border-l-4 border-primary bg-surface-container-low' : 'border-l-4 border-transparent',
                          ].join(' ')}
                        >
                          <div className="flex items-center justify-between gap-sm">
                            <span className="font-body-md font-bold text-on-surface">{route.code}</span>
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge.color}`}
                            >
                              {badge.label}
                            </span>
                          </div>
                          <span className="font-label-lg text-on-surface-variant">
                            {route.origin} → {route.destination}
                          </span>
                          <div className="flex items-center gap-md font-label-md text-on-surface-variant">
                            <span className="flex items-center gap-xs">
                              <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                                directions_bus
                              </span>
                              {route.buses} Buses
                            </span>
                            <span className="flex items-center gap-xs">
                              <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                                {route.metricIcon}
                              </span>
                              {route.metric}
                            </span>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            </div>

            {/* Right column */}
            <div className="col-span-12 space-y-lg lg:col-span-8">
              {/* Map telemetry panel */}
              <section
                aria-label="Mapa de telemetría de rutas en Manta"
                className="relative h-[420px] overflow-hidden rounded-xl border border-outline-variant/40 shadow-sm"
              >
                {/* Layer chip */}
                <div className="pointer-events-none absolute left-4 top-4 z-[500] flex items-center gap-xs rounded-lg bg-black/50 px-3 py-1.5 font-label-lg text-white backdrop-blur-sm">
                  <span className="material-symbols-outlined text-[18px]">layers</span>
                  {selected ? `Ruta ${selected.code} · ${mapVehicles.length} buses` : 'Route Telemetry'}
                </div>

                <MantaMap
                  routePath={routePath}
                  stops={allStops}
                  vehicles={mapVehicles}
                  ariaLabel={
                    selected
                      ? `Mapa de telemetría de la ruta ${selected.code} en Manta`
                      : 'Mapa de telemetría de la red de Manta'
                  }
                />

                {/* Route edit card — keyed por ruta para reiniciar el formulario al cambiar */}
                {panelOpen && selected && (
                  <RouteEditPanel
                    key={selected.id}
                    route={selected}
                    onClose={() => setPanelOpen(false)}
                    onUpdate={handleUpdate}
                    onSuspend={handleSuspend}
                  />
                )}
              </section>

              {/* Stats bar */}
              <section
                aria-label="Métricas globales de la flota"
                className="flex flex-wrap items-center justify-around gap-lg rounded-xl border border-outline-variant/40 bg-surface-container-lowest px-lg py-md shadow-sm"
              >
                <div className="flex items-center gap-md">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-container/40 text-primary">
                    <span className="material-symbols-outlined">speed</span>
                  </span>
                  <div>
                    <p className="text-headline-lg font-bold leading-none text-on-surface">
                      22 <span className="text-body-md font-normal text-on-surface-variant">km/h</span>
                    </p>
                    <p className="font-label-md text-on-surface-variant">Avg Fleet Speed</p>
                  </div>
                </div>
                <div className="flex items-center gap-md">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-container/40 text-primary">
                    <span className="material-symbols-outlined">group</span>
                  </span>
                  <div>
                    <p className="text-headline-lg font-bold leading-none text-on-surface">12.4k</p>
                    <p className="font-label-md text-on-surface-variant">Daily Passengers</p>
                  </div>
                </div>
                <div className="flex items-center gap-md">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary-container text-secondary">
                    <span className="material-symbols-outlined">eco</span>
                  </span>
                  <div>
                    <p className="text-headline-lg font-bold leading-none text-on-surface">94%</p>
                    <p className="font-label-md text-on-surface-variant">Efficiency Rating</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        type="button"
        className="fixed bottom-lg right-lg z-[60] flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-on-secondary shadow-lg transition-transform hover:scale-105 active:scale-95 focus-visible:outline-3 focus-visible:outline-offset-2"
        aria-label="Crear nueva ruta"
      >
        <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
          add
        </span>
      </button>
    </div>
  );
}
