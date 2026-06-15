import { useState } from 'react';
import { useRoutes, useVehicles } from '../hooks/use-transit-data';

/**
 * SchedulesPage - Transit Schedules & Dispatch
 * WCAG 2.2 AA compliant schedule management interface
 * - Semantic HTML and ARIA labels
 * - Full keyboard navigation
 * - Accessible form controls
 * - Screen reader friendly tables
 * Datos en vivo desde Supabase (routes + vehicles).
 */
export default function SchedulesPage() {
  const { data: routes = [] } = useRoutes();
  const { data: vehicles = [] } = useVehicles();
  const [selectedRoute, setSelectedRoute] = useState('');
  const [timeAdjustment, setTimeAdjustment] = useState(0);

  // Selección efectiva: la elegida por el usuario o la primera ruta disponible.
  const effectiveRoute = selectedRoute || routes[0]?.id || '';

  const activeCount = vehicles.filter((v) => v.status !== 'maintenance').length;
  const onTimeCount = vehicles.filter((v) => v.status === 'on_time').length;
  const delayedCount = vehicles.filter((v) => v.status === 'delayed').length;

  const handleAdjustTiming = (minutes: number) => {
    setTimeAdjustment(timeAdjustment + minutes);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
        {/* Header */}
        <header className="fixed top-0 ml-64 right-0 bg-surface-bright border-b border-outline-variant shadow-sm flex items-center justify-between px-margin-desktop h-16 z-40" style={{ width: 'calc(100% - 16rem)' }}>
          <div className="flex items-center gap-lg flex-1">
            <div className="relative w-64">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-outline">
                <span className="material-symbols-outlined text-[20px]">search</span>
              </span>
              <input
                className="w-full pl-10 pr-4 py-1.5 bg-surface-container rounded-full border-none focus:ring-2 focus:ring-primary font-body-md"
                placeholder="Search routes or drivers..."
                type="text"
                aria-label="Buscar rutas o conductores"
              />
            </div>
          </div>
          <div className="flex items-center gap-md">
            <button
              className="hover:bg-surface-container-low rounded-full p-2 text-on-surface-variant transition-colors focus:ring-2 focus:ring-primary"
              aria-label="Notificaciones"
            >
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div className="h-8 w-px bg-outline-variant mx-2"></div>
            <div className="flex items-center gap-sm">
              <div className="text-right">
                <p className="font-label-lg text-on-surface leading-none">Alex Rivera</p>
                <p className="text-[10px] text-on-surface-variant">Fleet Manager</p>
              </div>
              <img
                alt="Manager Profile"
                className="h-8 w-8 rounded-full border border-outline-variant"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAtXvS2gHTHgoGkrxoEgxWeG5MpEdJwkbnEhQmYSPOg9QH5W6LB1MjdbwBd9lqi1wwyju80iudWQuiFucBzZLRoXrWMfmRJj5u51jhFN6d4fZcMuFIzP4PPKsMWBB2TZfb4tmOJ5fUHgk8-akt-p2h93F5-U7J55fuBwyXUg0j0M7DYR6aW37ZbSzwx191hlo2mkpgexKtm5TNXiQON-6hw0E2cwV34l_Q1UJmL1NDUDYt7xfRluP-Z16eKR0dDbw20vPZx3ieaocU"
              />
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 mt-16 overflow-y-auto p-lg">
          {/* Dashboard Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-lg gap-md">
            <div>
              <h2 className="text-headline-lg text-on-surface font-bold">Transit Schedules</h2>
              <p className="text-body-md text-on-surface-variant">Manage and optimize real-time departures across the Manta network.</p>
            </div>
            <div className="flex gap-sm">
              <div className="bg-surface-container flex p-1 rounded-lg">
                <button
                  className="px-lg py-1.5 bg-white shadow-sm rounded-md font-label-lg text-primary focus:ring-2 focus:ring-primary"
                  aria-pressed="true"
                >
                  Timeline
                </button>
                <button
                  className="px-lg py-1.5 text-on-surface-variant font-label-lg hover:bg-surface-container-high rounded-md transition-colors focus:ring-2 focus:ring-primary"
                  aria-pressed="false"
                >
                  Calendar
                </button>
              </div>
              <button className="flex items-center gap-2 px-lg py-1.5 bg-surface-container-lowest border border-outline-variant rounded-lg font-label-lg text-on-surface-variant hover:bg-surface-container-high transition-all focus:ring-2 focus:ring-primary">
                <span className="material-symbols-outlined text-[18px]">filter_list</span>
                Filters
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-12 gap-lg mb-lg">
            <div className="col-span-12 lg:col-span-4 bg-white p-lg rounded-lg shadow-sm border border-outline-variant/30">
              <span className="text-label-md font-label-md text-primary bg-primary/10 px-2 py-1 rounded inline-block">Active Now</span>
              <h3 className="text-display-lg font-bold text-on-surface mt-sm">{activeCount}</h3>
              <p className="text-body-md text-on-surface-variant">Buses currently in service</p>
              <div className="mt-lg flex items-center gap-lg">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-secondary"></div>
                  <span className="text-label-lg text-on-surface-variant">{onTimeCount} On-Time</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-error"></div>
                  <span className="text-label-lg text-on-surface-variant">{delayedCount} Delayed</span>
                </div>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-8 bg-inverse-surface text-white p-lg rounded-lg shadow-sm">
              <h3 className="font-title-lg text-white">System Efficiency</h3>
              <p className="text-body-md text-white/70">Optimization engine is active. Peak hour adjustments predicted for Route 102.</p>
              <div className="flex gap-md mt-xl">
                <button className="px-lg py-2 bg-secondary-container text-on-secondary-container font-label-lg rounded-lg hover:brightness-110 transition-all focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                  View Alerts
                </button>
                <button className="px-lg py-2 bg-white/10 text-white font-label-lg rounded-lg hover:bg-white/20 transition-all focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                  Manage Logic
                </button>
              </div>
            </div>
          </div>

          {/* Quick Dispatch Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg mb-lg">
            {/* Quick Dispatch */}
            <div className="bg-white p-lg rounded-lg shadow-sm border border-outline-variant/30">
              <div className="flex items-center justify-between mb-md">
                <h4 className="font-label-lg text-on-surface uppercase tracking-wider">Quick Dispatch</h4>
                <span className="material-symbols-outlined text-outline">bolt</span>
              </div>
              <form className="space-y-md" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <label htmlFor="fleet-id" className="block text-[10px] font-bold text-on-surface-variant mb-1 uppercase">
                    Target Fleet ID
                  </label>
                  <select
                    id="fleet-id"
                    value={effectiveRoute}
                    onChange={(e) => setSelectedRoute(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md py-2 px-3 focus:ring-2 focus:ring-primary"
                    aria-label="Seleccionar ruta de flota"
                  >
                    {routes.length === 0 && <option value="">Sin rutas disponibles</option>}
                    {routes.map((route) => (
                      <option key={route.id} value={route.id}>
                        {route.code} - {route.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant mb-1 uppercase">Adjust Timings (Minutes)</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleAdjustTiming(-5)}
                      className="flex-1 py-2 bg-surface-container-high rounded-lg text-label-lg hover:bg-error-container hover:text-on-error-container transition-colors focus:ring-2 focus:ring-primary"
                      aria-label="Reducir 5 minutos"
                    >
                      -5
                    </button>
                    <button
                      type="button"
                      className="flex-1 py-2 bg-surface-container-high rounded-lg text-label-lg hover:bg-surface-container-highest transition-colors focus:ring-2 focus:ring-primary"
                      aria-label="Mantener horario"
                    >
                      Hold
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAdjustTiming(5)}
                      className="flex-1 py-2 bg-surface-container-high rounded-lg text-label-lg hover:bg-secondary-container hover:text-on-secondary-container transition-colors focus:ring-2 focus:ring-primary"
                      aria-label="Aumentar 5 minutos"
                    >
                      +5
                    </button>
                  </div>
                </div>
                <p className="text-label-lg text-on-surface-variant">Ajuste actual: {timeAdjustment > 0 ? '+' : ''}{timeAdjustment} min</p>
                <button
                  type="submit"
                  className="w-full py-2 bg-primary text-white rounded-lg font-label-lg mt-md shadow-sm active:scale-95 transition-all focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  aria-label="Ejecutar cambio de horario"
                >
                  Execute Shift
                </button>
              </form>
            </div>

            {/* Arrival Monitoring */}
            <div className="bg-white p-lg rounded-lg shadow-sm border border-outline-variant/30 flex flex-col">
              <div className="flex items-center justify-between mb-md">
                <h4 className="font-label-lg text-on-surface uppercase tracking-wider">Arrival Monitoring</h4>
                <span className="material-symbols-outlined text-outline">radar</span>
              </div>
              <div className="flex-1 space-y-md max-h-48 overflow-y-auto">
                <div className="flex items-center justify-between p-sm bg-surface-container-low rounded-lg">
                  <div>
                    <p className="font-label-lg text-on-surface">Manta Central</p>
                    <p className="text-[10px] text-on-surface-variant">4 Active Arrivals</p>
                  </div>
                  <span className="text-secondary font-bold text-label-lg">Stable</span>
                </div>
                <div className="flex items-center justify-between p-sm bg-surface-container-low rounded-lg border-l-4 border-error">
                  <div>
                    <p className="font-label-lg text-on-surface">West Terminal</p>
                    <p className="text-[10px] text-on-surface-variant">Congestion Warning</p>
                  </div>
                  <span className="text-error font-bold text-label-lg">+12m</span>
                </div>
                <div className="flex items-center justify-between p-sm bg-surface-container-low rounded-lg">
                  <div>
                    <p className="font-label-lg text-on-surface">Skyline Peak</p>
                    <p className="text-[10px] text-on-surface-variant">2 Active Arrivals</p>
                  </div>
                  <span className="text-secondary font-bold text-label-lg">Stable</span>
                </div>
              </div>
            </div>

            {/* Driver Comms */}
            <div className="bg-white p-lg rounded-lg shadow-sm border border-outline-variant/30">
              <div className="flex items-center justify-between mb-md">
                <h4 className="font-label-lg text-on-surface uppercase tracking-wider">Driver Comms</h4>
                <span className="material-symbols-outlined text-outline">forum</span>
              </div>
              <div className="space-y-sm">
                <div className="flex items-center gap-md">
                  <div className="relative">
                    <img
                      alt="Marcus T. Avatar"
                      className="w-8 h-8 rounded-full"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBroYpNFQ-zbLEcdBL6HbMrE_yYkGXj-zGBig0hQLjGS2tZ8ut5d72YibI-kHeUsTEH8Q-Ju3IzeBHcoGvhLIf0ZrTzOOGBtp9bLSrFlzUTvWOIQmOvQbZubfmGFOLoBI_f9fFXEzBK-QrALgyx8ib8ItyIy8dmKt39l7oNVgaWypPeV5PTSQYStAYwlzGltGMDhu5wMqNpMxpZmiXk-KkN4vGsPcxh-zyTUTC_jUSTjoW4w6trqNhQ6G9zVD1fHcOGjvzuz7aF4jc"
                    />
                    <div className="absolute bottom-0 right-0 w-2 h-2 bg-secondary rounded-full border border-white"></div>
                  </div>
                  <div className="flex-1">
                    <p className="text-label-lg text-on-surface">
                      Marcus T. <span className="font-normal opacity-60 ml-2">Route 101</span>
                    </p>
                    <p className="text-[10px] text-on-surface-variant">"Approaching Harbor Bridge..."</p>
                  </div>
                </div>
              </div>
              <button className="w-full py-2 bg-surface-container-highest text-on-surface-variant rounded-lg font-label-lg flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-all mt-lg focus:ring-2 focus:ring-primary">
                <span className="material-symbols-outlined text-[18px]">broadcast_on_personal</span>
                Broadcast To Fleet
              </button>
            </div>
          </div>
        </div>
    </div>
  );
}
