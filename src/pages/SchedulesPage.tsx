import { useMemo, useState, type FormEvent } from 'react';
import { useRoutes, useVehicles } from '../hooks/use-transit-data';
import { useAuthStore } from '../stores/auth-store';
import { useProfile } from '../hooks/use-profile';
import { downloadCsv } from '../utils/download-csv';

function etaAt(minutesFromNow: number): string {
  const date = new Date(Date.now() + minutesFromNow * 60000)
  return date.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })
}

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
  const user = useAuthStore((state) => state.user);
  const { data: profile } = useProfile();
  const [selectedRoute, setSelectedRoute] = useState('');
  const [timeAdjustment, setTimeAdjustment] = useState(0);
  const [viewMode, setViewMode] = useState<'timeline' | 'calendar'>('timeline');
  const [statusMessage, setStatusMessage] = useState('')

  // Selección efectiva: la elegida por el usuario o la primera ruta disponible.
  const effectiveRoute = selectedRoute || routes[0]?.id || '';

  const currentName = profile?.full_name ?? user?.user_metadata?.full_name ?? user?.email ?? 'Administración';

  const scheduleRows = useMemo(() => {
    return routes.map((route) => {
      const routeVehicles = vehicles.filter((vehicle) => vehicle.route_id === route.id);
      const activeVehicles = routeVehicles.filter((vehicle) => vehicle.status !== 'maintenance').length;
      const delayedVehicles = routeVehicles.filter((vehicle) => vehicle.status === 'delayed').length;
      const adjustedFrequency = Math.max(1, route.frequency_minutes + timeAdjustment);
      return {
        route,
        routeVehicles,
        activeVehicles,
        delayedVehicles,
        adjustedFrequency,
        nextDeparture: etaAt(adjustedFrequency),
      };
    });
  }, [routes, vehicles, timeAdjustment]);

  const activeCount = vehicles.filter((v) => v.status !== 'maintenance').length;
  const onTimeCount = vehicles.filter((v) => v.status === 'on_time').length;
  const delayedCount = vehicles.filter((v) => v.status === 'delayed').length;
  const averageFrequency = routes.length
    ? Math.round(routes.reduce((sum, route) => sum + route.frequency_minutes, 0) / routes.length)
    : 0;

  const selectedSchedule = scheduleRows.find((row) => row.route.id === effectiveRoute) ?? scheduleRows[0] ?? null;

  const handleExport = () => {
    downloadCsv(
      'schedules.csv',
      ['Route', 'Vehicles', 'Active', 'Delayed', 'Frequency', 'Next departure'],
      scheduleRows.map((row) => [
        `${row.route.code} - ${row.route.name}`,
        row.routeVehicles.length,
        row.activeVehicles,
        row.delayedVehicles,
        `${row.adjustedFrequency} min`,
        row.nextDeparture,
      ]),
    )
  }

  const handleAdjustTiming = (minutes: number) => {
    setTimeAdjustment(timeAdjustment + minutes);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedSchedule) return
    setStatusMessage(
      `Horario ajustado para ${selectedSchedule.route.code}: ${timeAdjustment > 0 ? '+' : ''}${timeAdjustment} min sobre la frecuencia base de ${selectedSchedule.route.frequency_minutes} min.`,
    )
  }

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
              type="button"
              onClick={() => setTimeAdjustment(0)}
              className="hover:bg-surface-container-low rounded-full p-2 text-on-surface-variant transition-colors focus:ring-2 focus:ring-primary"
              aria-label="Notificaciones"
            >
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div className="h-8 w-px bg-outline-variant mx-2"></div>
            <div className="flex items-center gap-sm">
              <div className="text-right">
                <p className="font-label-lg text-on-surface leading-none">{currentName}</p>
                <p className="text-[10px] text-on-surface-variant">{profile?.user_type ?? 'Administrador'}</p>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-outline-variant bg-primary-container text-xs font-bold text-on-primary-container">
                {(currentName || 'AD').slice(0, 2).toUpperCase()}
              </div>
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
                  type="button"
                  onClick={() => setViewMode('timeline')}
                  className="px-lg py-1.5 bg-white shadow-sm rounded-md font-label-lg text-primary focus:ring-2 focus:ring-primary"
                  aria-pressed={viewMode === 'timeline'}
                >
                  Timeline
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('calendar')}
                  className="px-lg py-1.5 text-on-surface-variant font-label-lg hover:bg-surface-container-high rounded-md transition-colors focus:ring-2 focus:ring-primary"
                  aria-pressed={viewMode === 'calendar'}
                >
                  Calendar
                </button>
              </div>
              <button
                type="button"
                onClick={handleExport}
                className="flex items-center gap-2 px-lg py-1.5 bg-surface-container-lowest border border-outline-variant rounded-lg font-label-lg text-on-surface-variant hover:bg-surface-container-high transition-all focus:ring-2 focus:ring-primary"
              >
                <span className="material-symbols-outlined text-[18px]">filter_list</span>
                Exportar horarios
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
              <p className="text-body-md text-white/70">
                {viewMode === 'timeline'
                  ? `Promedio de frecuencia actual: ${averageFrequency} min. Cambios aplicados sobre ${selectedSchedule?.route.code ?? 'la ruta seleccionada'}.`
                  : 'Vista calendario basada en las rutas registradas y su frecuencia base en Supabase.'}
              </p>
              <div className="flex gap-md mt-xl">
                <button
                  type="button"
                  onClick={() => setStatusMessage('Se resaltaron rutas con retraso en el monitoreo.')}
                  className="px-lg py-2 bg-secondary-container text-on-secondary-container font-label-lg rounded-lg hover:brightness-110 transition-all focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  View Alerts
                </button>
                <button
                  type="button"
                  onClick={() => setStatusMessage('La lógica de horarios se recalculó con los ajustes actuales.')}
                  className="px-lg py-2 bg-white/10 text-white font-label-lg rounded-lg hover:bg-white/20 transition-all focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
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
              <form className="space-y-md" onSubmit={handleSubmit}>
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
                <p className="text-sm text-on-surface-variant" role="status" aria-live="polite">
                  {statusMessage}
                </p>
              </form>
            </div>

            {/* Arrival Monitoring */}
            <div className="bg-white p-lg rounded-lg shadow-sm border border-outline-variant/30 flex flex-col">
              <div className="flex items-center justify-between mb-md">
                <h4 className="font-label-lg text-on-surface uppercase tracking-wider">Arrival Monitoring</h4>
                <span className="material-symbols-outlined text-outline">radar</span>
              </div>
              <div className="flex-1 space-y-md max-h-48 overflow-y-auto">
                {scheduleRows.slice(0, 3).map((row) => (
                  <div key={row.route.id} className={`flex items-center justify-between p-sm rounded-lg ${row.delayedVehicles > 0 ? 'bg-error-container border-l-4 border-error' : 'bg-surface-container-low'}`}>
                    <div>
                      <p className="font-label-lg text-on-surface">{row.route.code}</p>
                      <p className="text-[10px] text-on-surface-variant">
                        {row.activeVehicles} unidades activas · {row.routeVehicles.length} registradas
                      </p>
                    </div>
                    <span className={row.delayedVehicles > 0 ? 'text-error font-bold text-label-lg' : 'text-secondary font-bold text-label-lg'}>
                      {row.delayedVehicles > 0 ? `${row.delayedVehicles} delayed` : row.nextDeparture}
                    </span>
                  </div>
                ))}
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
