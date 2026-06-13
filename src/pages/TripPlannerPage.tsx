import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/use-document-title';

type Congestion = 'baja' | 'media' | 'alta';

interface RouteOption {
  id: string;
  durationMin: number;
  arrival: string;
  cost: string;
  congestion: Congestion;
  line: string;
  /** Tono del chip de línea (azul marino para la recomendada, claro para el resto) */
  lineTone: 'primary' | 'soft';
  walkMin: number;
  recommended?: boolean;
}

const ROUTE_OPTIONS: RouteOption[] = [
  {
    id: 'opt-1',
    durationMin: 22,
    arrival: '14:42',
    cost: '$0.35',
    congestion: 'baja',
    line: 'L-14',
    lineTone: 'primary',
    walkMin: 4,
    recommended: true,
  },
  {
    id: 'opt-2',
    durationMin: 28,
    arrival: '14:48',
    cost: '$0.35',
    congestion: 'media',
    line: 'L-08',
    lineTone: 'soft',
    walkMin: 6,
  },
];

const NAV_LINKS = [
  { to: '/', label: 'Home', icon: 'home' },
  { to: '/planificar-viaje', label: 'Routes', icon: 'directions_bus' },
  { to: '#tracking', label: 'Tracking', icon: 'my_location' },
  { to: '#history', label: 'History', icon: 'history' },
];

const CONGESTION_BADGE: Record<Congestion, { label: string; color: string }> = {
  baja: { label: 'Congestión Baja', color: 'bg-secondary-container text-on-secondary-container' },
  media: { label: 'Media', color: 'bg-[#f3e6c4] text-[#6b4e00]' },
  alta: { label: 'Alta', color: 'bg-error-container text-on-error-container' },
};

const PAGE_BG = '#edf3fb';

/**
 * TripPlannerPage — Planificar Viaje (app de pasajeros)
 * Pantalla pública para buscar y comparar rutas en Manta.
 * WCAG 2.2 AA: HTML semántico (1.3.1), navegable por teclado (2.1.1),
 * nombres/roles en controles custom (4.1.2) y contraste >= 4.5:1 (1.4.3).
 */
export default function TripPlannerPage() {
  useDocumentTitle('Planificar viaje');

  const [origin, setOrigin] = useState('Terminal Terrestre');
  const [destination, setDestination] = useState('');
  const [lowFloor, setLowFloor] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState('opt-1');

  const swapEnds = () => {
    setOrigin(destination);
    setDestination(origin);
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden text-on-background" style={{ backgroundColor: PAGE_BG }}>
      {/* Top bar */}
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
            placeholder="Buscar paradas o líneas..."
            aria-label="Buscar paradas o líneas"
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
          <button
            type="button"
            className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container focus-visible:outline-3"
            aria-label="Opciones de accesibilidad"
          >
            <span className="material-symbols-outlined">accessibility_new</span>
          </button>
          <div className="mx-sm h-7 w-px bg-outline-variant" aria-hidden="true" />
          <Link
            to="/login"
            className="rounded-lg px-3 py-2 font-label-lg font-semibold text-primary hover:bg-surface-container focus-visible:outline-3"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="rounded-lg bg-primary px-4 py-2 font-label-lg font-semibold text-on-primary transition-opacity hover:opacity-90 focus-visible:outline-3"
          >
            Register
          </Link>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="flex w-56 shrink-0 flex-col px-md pb-lg">
          <nav className="flex-1 space-y-xs" aria-label="Navegación principal">
            {NAV_LINKS.map(({ to, label, icon }) =>
              to.startsWith('#') ? (
                <a
                  key={to}
                  href={to}
                  className="flex items-center gap-md rounded-xl px-md py-sm text-on-surface-variant transition-colors hover:bg-surface-container"
                >
                  <span className="material-symbols-outlined">{icon}</span>
                  <span className="font-body-md font-medium">{label}</span>
                </a>
              ) : (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    [
                      'flex items-center gap-md rounded-xl px-md py-sm transition-colors',
                      isActive
                        ? 'bg-[#7fe0a6] font-semibold text-[#0b4429]'
                        : 'text-on-surface-variant hover:bg-surface-container',
                    ].join(' ')
                  }
                >
                  <span className="material-symbols-outlined">{icon}</span>
                  <span className="font-body-md font-medium">{label}</span>
                </NavLink>
              ),
            )}
          </nav>

          <div className="mt-lg">
            <p className="font-label-md uppercase tracking-wider text-on-surface-variant">Estado del sistema</p>
            <p className="mt-xs flex items-center gap-sm font-body-md font-semibold text-secondary">
              <span className="h-2.5 w-2.5 rounded-full bg-secondary" aria-hidden="true" />
              Operativo
            </p>
          </div>
        </aside>

        {/* Trip planner form */}
        <main className="w-[26rem] shrink-0 overflow-y-auto px-lg pb-lg">
          <h1 className="text-4xl font-bold text-primary">Planificar Viaje</h1>
          <p className="mt-1 text-body-md text-on-surface-variant">Encuentra la mejor ruta en Manta.</p>

          <form className="mt-lg space-y-sm" onSubmit={(e) => e.preventDefault()}>
            {/* Origen */}
            <div className="relative rounded-xl border border-outline-variant bg-surface-container-lowest px-md py-3">
              <label
                htmlFor="trip-origin"
                className="absolute -top-2 left-3 px-1 font-label-md font-semibold text-primary"
                style={{ backgroundColor: PAGE_BG }}
              >
                Origen
              </label>
              <div className="flex items-center gap-sm">
                <span className="material-symbols-outlined text-primary" aria-hidden="true">
                  trip_origin
                </span>
                <input
                  id="trip-origin"
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full bg-transparent font-body-md text-on-surface focus:outline-none"
                />
              </div>
            </div>

            {/* Swap */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={swapEnds}
                className="-my-1 flex h-9 w-9 items-center justify-center rounded-full bg-primary-container text-primary shadow-sm transition-colors hover:brightness-95 focus-visible:outline-3"
                aria-label="Intercambiar origen y destino"
              >
                <span className="material-symbols-outlined text-[20px]">swap_vert</span>
              </button>
            </div>

            {/* Destino */}
            <div className="relative rounded-xl border border-outline-variant bg-surface-container-lowest px-md py-3">
              <label
                htmlFor="trip-destination"
                className="absolute -top-2 left-3 px-1 font-label-md font-semibold text-on-surface-variant"
                style={{ backgroundColor: PAGE_BG }}
              >
                Destino
              </label>
              <div className="flex items-center gap-sm">
                <span className="material-symbols-outlined text-error" aria-hidden="true">
                  location_on
                </span>
                <input
                  id="trip-destination"
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="¿A dónde vas?"
                  className="w-full bg-transparent font-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none"
                />
              </div>
            </div>

            {/* Fecha / Hora */}
            <div className="grid grid-cols-2 gap-sm pt-sm">
              <div>
                <label htmlFor="trip-date" className="mb-1 block font-label-md text-on-surface-variant">
                  Fecha
                </label>
                <div className="flex items-center gap-sm rounded-xl border border-outline-variant bg-surface-container-lowest px-md py-2.5">
                  <span className="material-symbols-outlined text-[20px] text-on-surface-variant" aria-hidden="true">
                    calendar_today
                  </span>
                  <select
                    id="trip-date"
                    className="w-full bg-transparent font-body-md text-on-surface focus:outline-none"
                    defaultValue="hoy"
                  >
                    <option value="hoy">Hoy</option>
                    <option value="manana">Mañana</option>
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="trip-time" className="mb-1 block font-label-md text-on-surface-variant">
                  Hora
                </label>
                <div className="flex items-center gap-sm rounded-xl border border-outline-variant bg-surface-container-lowest px-md py-2.5">
                  <span className="material-symbols-outlined text-[20px] text-on-surface-variant" aria-hidden="true">
                    schedule
                  </span>
                  <select
                    id="trip-time"
                    className="w-full bg-transparent font-body-md text-on-surface focus:outline-none"
                    defaultValue="ahora"
                  >
                    <option value="ahora">Ahora</option>
                    <option value="programar">Programar…</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Piso Bajo toggle */}
            <div className="mt-sm flex items-center gap-md rounded-xl border border-outline-variant bg-surface-container-lowest px-md py-3">
              <span className="material-symbols-outlined text-primary" aria-hidden="true">
                accessible
              </span>
              <div className="flex-1">
                <p className="font-body-md font-semibold text-on-surface">Piso Bajo</p>
                <p className="font-label-md text-on-surface-variant">Preferir buses accesibles</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={lowFloor}
                aria-label="Preferir buses de piso bajo accesibles"
                onClick={() => setLowFloor((v) => !v)}
                className={[
                  'relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-3 focus-visible:outline-offset-2',
                  lowFloor ? 'bg-primary' : 'bg-outline',
                ].join(' ')}
              >
                <span
                  className={[
                    'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all',
                    lowFloor ? 'left-[1.375rem]' : 'left-0.5',
                  ].join(' ')}
                  aria-hidden="true"
                />
              </button>
            </div>
          </form>

          {/* Mejores Rutas */}
          <h2 className="mt-lg text-2xl font-bold text-on-surface">Mejores Rutas</h2>
          <ul className="mt-md space-y-md" role="list">
            {ROUTE_OPTIONS.map((opt) => {
              const badge = CONGESTION_BADGE[opt.congestion];
              const isSelected = opt.id === selectedRoute;
              return (
                <li key={opt.id} className="relative">
                  {opt.recommended && (
                    <span className="absolute -top-2.5 left-4 z-10 inline-flex items-center gap-xs rounded-full bg-secondary px-3 py-0.5 text-xs font-bold uppercase tracking-wide text-on-secondary">
                      <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                        auto_awesome
                      </span>
                      Recomendada por IA
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setSelectedRoute(opt.id)}
                    aria-pressed={isSelected}
                    className={[
                      'w-full rounded-2xl border-2 bg-surface-container-lowest px-lg pb-md pt-lg text-left transition-colors focus-visible:outline-3',
                      isSelected ? 'border-secondary' : 'border-outline-variant/60 hover:border-outline',
                    ].join(' ')}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-3xl font-bold text-on-surface">{opt.durationMin} min</p>
                        <p className="mt-0.5 font-label-lg text-on-surface-variant">Llegada: {opt.arrival}</p>
                      </div>
                      <div className="flex flex-col items-end gap-sm">
                        <span className="text-2xl font-bold text-secondary">{opt.cost}</span>
                        <span
                          className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${badge.color}`}
                        >
                          {badge.label}
                        </span>
                      </div>
                    </div>
                    <div className="mt-md flex items-center gap-sm">
                      <span
                        className={[
                          'inline-flex items-center gap-xs rounded-md px-2.5 py-1 font-label-lg font-bold',
                          opt.lineTone === 'primary'
                            ? 'bg-primary text-on-primary'
                            : 'bg-primary-container text-on-primary-container',
                        ].join(' ')}
                      >
                        <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                          directions_bus
                        </span>
                        {opt.line}
                      </span>
                      <span className="material-symbols-outlined text-on-surface-variant" aria-hidden="true">
                        chevron_right
                      </span>
                      <span className="flex items-center gap-xs font-label-lg text-on-surface-variant">
                        <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                          directions_walk
                        </span>
                        {opt.walkMin} min
                      </span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </main>

        {/* Map */}
        <section
          aria-label="Mapa del viaje planificado en Manta"
          className="relative m-lg flex-1 overflow-hidden rounded-2xl border border-outline-variant/50"
          style={{
            backgroundColor: '#e3edfa',
            backgroundImage: 'radial-gradient(rgba(27, 58, 87, 0.18) 1px, transparent 1.5px)',
            backgroundSize: '22px 22px',
          }}
        >
          {/* Weather chip */}
          <div className="absolute right-4 top-4 flex items-center gap-xs rounded-full bg-surface-bright px-4 py-2 font-label-lg font-semibold text-on-surface shadow-md">
            <span className="material-symbols-outlined text-[18px] text-[#c47d00]" aria-hidden="true">
              sunny
            </span>
            Manta: 28°C
          </div>

          {/* Route line + endpoints */}
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 800 600"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M 110 540 C 220 470, 230 300, 430 270 C 600 245, 640 180, 720 150"
              fill="none"
              stroke="#3f6f9e"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="2 14"
            />
          </svg>
          {/* Origin dot */}
          <span
            className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-primary shadow"
            style={{ left: '13.75%', top: '90%' }}
            aria-hidden="true"
          />
          {/* Destination pin */}
          <span
            className="material-symbols-outlined absolute -translate-x-1/2 -translate-y-full text-[36px] text-error"
            style={{ left: '90%', top: '25%', fontVariationSettings: "'FILL' 1" }}
            aria-hidden="true"
          >
            location_on
          </span>

          {/* Vehicle popup */}
          <div className="absolute left-1/2 top-[46%] flex -translate-x-1/2 items-center gap-md rounded-xl border-2 border-secondary bg-surface-bright px-4 py-3 shadow-lg">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-on-secondary">
              <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                directions_bus
              </span>
            </span>
            <div>
              <p className="font-body-md font-bold text-on-surface">Línea 14</p>
              <p className="font-label-md text-on-surface-variant">A 2 min de tu ubicación</p>
            </div>
          </div>

          {/* Map controls */}
          <button
            type="button"
            className="absolute bottom-32 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-surface-bright text-on-surface shadow-md transition-colors hover:bg-surface-container focus-visible:outline-3"
            aria-label="Centrar en mi ubicación"
          >
            <span className="material-symbols-outlined">my_location</span>
          </button>
          <div className="absolute bottom-16 right-4 flex flex-col overflow-hidden rounded-full bg-surface-bright shadow-md">
            <button
              type="button"
              className="px-2.5 py-2 text-on-surface transition-colors hover:bg-surface-container focus-visible:outline-3"
              aria-label="Acercar mapa"
            >
              <span className="material-symbols-outlined">add</span>
            </button>
            <div className="mx-2 h-px bg-outline-variant" aria-hidden="true" />
            <button
              type="button"
              className="px-2.5 py-2 text-on-surface transition-colors hover:bg-surface-container focus-visible:outline-3"
              aria-label="Alejar mapa"
            >
              <span className="material-symbols-outlined">remove</span>
            </button>
          </div>
          <button
            type="button"
            className="absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-primary text-on-primary shadow-md transition-opacity hover:opacity-90 focus-visible:outline-3"
            aria-label="Cambiar capas del mapa"
          >
            <span className="material-symbols-outlined">layers</span>
          </button>
        </section>
      </div>
    </div>
  );
}
