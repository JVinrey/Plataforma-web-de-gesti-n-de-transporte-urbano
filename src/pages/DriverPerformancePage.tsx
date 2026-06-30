import { useMemo, useState } from 'react'
import { useDocumentTitle } from '../hooks/use-document-title'
import { useDriverPerformance, usePerformanceStats } from '../hooks/use-transit-data'
import type { DriverWithMetrics } from '../hooks/use-transit-data'
import { useAuthStore } from '../stores/auth-store'
import { useProfile } from '../hooks/use-profile'
import { downloadCsv } from '../utils/download-csv'

// =====================================================================
// DriverPerformancePage — Análisis de Desempeño de Conductores.
// Panel de administración de flota (dentro de AdminShell).
// Datos reales desde Supabase (driver_metrics + drivers).
// WCAG 2.2 AA: HTML semántico, tabla accesible, navegación por teclado,
// nombres/roles en controles y contraste >= 4.5:1.
// =====================================================================

/** Iniciales para el avatar de respaldo cuando no hay foto. */
function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
}

/** Barra de progreso etiquetada para lectores de pantalla. */
function MetricBar({ value, tone }: { value: number; tone: 'primary' | 'secondary' }) {
  return (
    <div
      className="h-2 w-full rounded-full bg-surface-container"
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={`h-full rounded-full ${tone === 'primary' ? 'bg-primary' : 'bg-secondary'}`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}

export default function DriverPerformancePage() {
  useDocumentTitle('Desempeño de conductores')
  const { data: drivers = [], isLoading, isError } = useDriverPerformance()
  const { stats } = usePerformanceStats()
  const user = useAuthStore((state) => state.user)
  const { data: profile } = useProfile()
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const currentName = profile?.full_name ?? user?.user_metadata?.full_name ?? user?.email ?? 'Administración'

  const filteredDrivers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) return drivers
    return drivers.filter((driver) => {
      const name = driver.driver?.full_name ?? ''
      return (
        name.toLowerCase().includes(normalizedQuery) ||
        driver.driver_id.toLowerCase().includes(normalizedQuery) ||
        (driver.route_code ?? '').toLowerCase().includes(normalizedQuery) ||
        driver.role_title.toLowerCase().includes(normalizedQuery)
      )
    })
  }, [drivers, query])

  const selected = useMemo<DriverWithMetrics | null>(
    () => filteredDrivers.find((d) => d.driver_id === selectedId) ?? filteredDrivers[0] ?? null,
    [filteredDrivers, selectedId],
  )

  const maxSafety = Math.max(100, ...filteredDrivers.flatMap((d) => d.monthlySafety))

  const handleExport = () => {
    downloadCsv(
      'driver-performance.csv',
      ['Driver', 'Route', 'Safety', 'Trips', 'Attendance', 'Status', 'Violations'],
      filteredDrivers.map((driver) => [
        driver.driver?.full_name ?? 'Conductor',
        driver.route_code ?? 'Sin ruta',
        driver.safety_score,
        driver.trips,
        `${driver.attendance}%`,
        driver.status,
        driver.violations,
      ]),
    )
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
        {/* Cabecera */}
        <header className="flex h-16 w-full shrink-0 items-center justify-between border-b border-outline-variant bg-surface-bright px-margin-desktop shadow-sm">
          <div className="relative w-full max-w-form">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-on-surface-variant">
              <span className="material-symbols-outlined text-[20px]">search</span>
            </span>
            <input
              className="w-full rounded-full border-none bg-surface-container py-2 pl-10 pr-4 font-body-md focus:ring-2 focus:ring-primary"
              placeholder="Buscar conductores, rutas o IDs..."
              type="search"
              aria-label="Buscar conductores, rutas o IDs"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <div className="flex items-center gap-md">
            <button
              className="relative rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container-low focus:ring-2 focus:ring-primary"
              aria-label="Notificaciones"
            >
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-error" aria-hidden="true" />
            </button>
            <div className="mx-sm h-8 w-px bg-outline-variant" aria-hidden="true" />
            <div className="text-right">
              <p className="font-label-lg font-semibold leading-tight text-on-surface">{currentName}</p>
              <p className="font-label-md uppercase tracking-wide text-on-surface-variant">
                {profile?.user_type ?? 'Administrador'}
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-container font-label-lg font-bold text-on-primary-container">
              {(currentName || 'AD').slice(0, 2).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-margin-desktop">
          {/* Encabezado de sección */}
          <nav aria-label="Ruta de navegación" className="mb-xs">
            <ol className="flex items-center gap-xs font-label-lg text-on-surface-variant">
              <li>Control de Flota</li>
              <li aria-hidden="true">›</li>
              <li className="font-semibold text-primary">Desempeño de Conductores</li>
            </ol>
          </nav>
          <div className="mb-lg flex flex-wrap items-end justify-between gap-md">
            <h2 className="text-headline-lg font-bold text-on-surface">Análisis de Desempeño</h2>
            <div className="flex gap-sm">
              <button
                type="button"
                className="flex items-center gap-xs rounded-full border border-outline px-md py-xs font-label-lg text-on-surface-variant transition-colors hover:bg-surface-container focus:ring-2 focus:ring-primary"
                onClick={handleExport}
              >
                <span className="material-symbols-outlined text-[18px]">filter_list</span>
                Todas las flotas
              </button>
              <button
                type="button"
                onClick={handleExport}
                className="flex items-center gap-xs rounded-lg bg-primary px-md py-sm font-label-lg font-semibold text-on-primary transition-opacity hover:opacity-90 focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                <span className="material-symbols-outlined text-[18px]">download</span>
                Exportar Reporte
              </button>
            </div>
          </div>

          {isError && (
            <p role="alert" className="mb-lg rounded-xl bg-error-container p-md font-body-md text-on-error-container">
              No se pudo cargar el desempeño de conductores. Reintenta más tarde.
            </p>
          )}

          {/* Tarjetas de KPI */}
          <div className="mb-lg grid grid-cols-1 gap-gutter sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              icon="groups"
              tone="primary"
              label="Conductores Activos"
              value={String(stats.activeDrivers || drivers.length)}
              trend="+12%"
              trendUp
              progress={stats.totalDrivers ? (stats.activeDrivers / stats.totalDrivers) * 100 : 0}
            />
            <KpiCard
              icon="verified_user"
              tone="secondary"
              label="Puntaje de Seguridad Prom."
              value={`${stats.safetyAvg}%`}
              trend="+2.4%"
              trendUp
              progress={stats.safetyAvg}
            />
            <KpiCard
              icon="schedule"
              tone="amber"
              label="Asistencia Promedio"
              value={`${stats.attendanceAvg}%`}
              trend="-1.5%"
              progress={stats.attendanceAvg}
            />
            <KpiCard
              icon="warning"
              tone="error"
              label="Alertas de Seguridad"
              value={String(stats.safetyAlerts).padStart(2, '0')}
              alert
            />
          </div>

          {/* Cuerpo: leaderboard + detalle */}
          <div className="grid grid-cols-1 gap-gutter xl:grid-cols-[1.7fr_1fr]">
            {/* Leaderboard */}
            <section
              aria-labelledby="leaderboard-title"
              className="overflow-hidden rounded-xl border border-transparent bg-surface-container-lowest shadow-sm"
            >
              <div className="flex items-center justify-between border-b border-outline-variant px-lg py-md">
                <h3 id="leaderboard-title" className="text-title-lg font-bold text-on-surface">
                  Ranking de Conductores
                </h3>
                <span className="rounded-full bg-primary-container px-3 py-1 font-label-md font-semibold text-on-primary-container">
                  Mejor Desempeño
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left" aria-label="Ranking de desempeño de conductores">
                  <thead>
                    <tr className="bg-surface-container/50">
                      <th scope="col" className="px-lg py-md font-label-lg text-on-surface-variant">#</th>
                      <th scope="col" className="px-lg py-md font-label-lg text-on-surface-variant">Conductor</th>
                      <th scope="col" className="px-lg py-md font-label-lg text-on-surface-variant">Seguridad</th>
                      <th scope="col" className="px-lg py-md font-label-lg text-on-surface-variant">Viajes</th>
                      <th scope="col" className="px-lg py-md font-label-lg text-on-surface-variant">Asistencia</th>
                      <th scope="col" className="px-lg py-md font-label-lg text-on-surface-variant">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {isLoading && (
                      <tr>
                        <td colSpan={6} className="px-lg py-xl text-center font-body-md text-on-surface-variant">
                          Cargando conductores…
                        </td>
                      </tr>
                    )}
                    {!isLoading &&
                      filteredDrivers.map((d, index) => {
                        const isSelected = selected?.driver_id === d.driver_id
                        const name = d.driver?.full_name ?? 'Conductor'
                        return (
                          <tr
                            key={d.driver_id}
                            className={`cursor-pointer transition-colors hover:bg-surface-container-low ${
                              isSelected ? 'bg-primary-container/40' : ''
                            }`}
                            onClick={() => setSelectedId(d.driver_id)}
                          >
                            <td className="px-lg py-md">
                              <span
                                className={`inline-flex h-8 w-8 items-center justify-center rounded-full font-label-lg font-bold ${
                                  index === 0
                                    ? 'bg-secondary text-on-secondary'
                                    : 'bg-surface-container text-on-surface-variant'
                                }`}
                              >
                                {String(index + 1).padStart(2, '0')}
                              </span>
                            </td>
                            <td className="px-lg py-md">
                              <button
                                type="button"
                                onClick={() => setSelectedId(d.driver_id)}
                                className="flex items-center gap-sm text-left focus:outline-none focus-visible:underline"
                                aria-pressed={isSelected}
                              >
                                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-variant font-label-md font-bold text-on-surface-variant">
                                  {initials(name)}
                                </span>
                                <span>
                                  <span className="block font-body-md font-semibold text-on-surface">{name}</span>
                                  <span className="block font-label-md text-on-surface-variant">
                                    ID: #DRV-{d.driver_id.slice(0, 4).toUpperCase()}
                                  </span>
                                </span>
                              </button>
                            </td>
                            <td className="px-lg py-md">
                              <div className="flex items-center gap-sm">
                                <div className="w-16">
                                  <MetricBar value={Number(d.safety_score)} tone="secondary" />
                                </div>
                                <span className="font-body-md font-semibold text-on-surface">{d.safety_score}</span>
                              </div>
                            </td>
                            <td className="px-lg py-md font-body-md text-on-surface">{d.trips}</td>
                            <td className="px-lg py-md font-body-md text-on-surface">{d.attendance}%</td>
                            <td className="px-lg py-md">
                              <span
                                className={`inline-flex items-center gap-xs rounded-full px-2.5 py-0.5 font-label-md font-semibold ${
                                  d.status === 'on_duty'
                                    ? 'bg-secondary-container text-on-secondary-container'
                                    : 'bg-[#f3e6c4] text-[#6b4e00]'
                                }`}
                              >
                                {d.status === 'on_duty' ? 'En servicio' : 'Día libre'}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Tarjeta de detalle del conductor seleccionado */}
            <aside aria-label="Detalle del conductor seleccionado" className="space-y-gutter">
              {selected && (
                <article className="overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm">
                  <div className="flex items-start justify-between bg-primary px-lg pb-xl pt-lg">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-bright font-title-lg font-bold text-primary shadow-md">
                      {initials(selected.driver?.full_name ?? 'NA')}
                    </div>
                    <div className="flex gap-xs">
                      <a
                        href={`mailto:operaciones@mantatransit.ec`}
                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 text-on-primary transition-colors hover:bg-white/25 focus:ring-2 focus:ring-white"
                        aria-label={`Enviar correo a ${selected.driver?.full_name ?? 'conductor'}`}
                      >
                        <span className="material-symbols-outlined text-[20px]">mail</span>
                      </a>
                      <a
                        href={`tel:${selected.driver?.phone ?? ''}`}
                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 text-on-primary transition-colors hover:bg-white/25 focus:ring-2 focus:ring-white"
                        aria-label={`Llamar a ${selected.driver?.full_name ?? 'conductor'}`}
                      >
                        <span className="material-symbols-outlined text-[20px]">call</span>
                      </a>
                    </div>
                  </div>
                  <div className="px-lg pb-lg">
                    <h3 className="-mt-6 text-title-lg font-bold text-on-surface">
                      {selected.driver?.full_name ?? 'Conductor'}
                    </h3>
                    <p className="mt-xs font-body-md text-on-surface-variant">
                      {selected.role_title}
                      {selected.route_code ? ` · Ruta ${selected.route_code}` : ''}
                    </p>

                    <dl className="mt-lg space-y-md">
                      <div>
                        <div className="flex items-center justify-between">
                          <dt className="font-body-md text-on-surface-variant">Eficiencia</dt>
                          <dd className="font-body-md font-bold text-on-surface">{selected.efficiency}%</dd>
                        </div>
                        <div className="mt-xs">
                          <MetricBar value={selected.efficiency} tone="primary" />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between">
                          <dt className="font-body-md text-on-surface-variant">Consumo de Combustible</dt>
                          <dd className="font-body-md font-bold text-secondary">{selected.fuel_consumption}</dd>
                        </div>
                        <div className="mt-xs">
                          <MetricBar
                            value={
                              selected.fuel_consumption === 'Óptimo'
                                ? 92
                                : selected.fuel_consumption === 'Bueno'
                                  ? 74
                                  : 55
                            }
                            tone="secondary"
                          />
                        </div>
                      </div>
                    </dl>

                    <div className="mt-lg grid grid-cols-2 gap-md border-t border-outline-variant pt-md">
                      <div>
                        <p className="font-label-md uppercase tracking-wide text-on-surface-variant">
                          Horas Totales
                        </p>
                        <p className="text-title-lg font-bold text-on-surface">{selected.total_hours}</p>
                      </div>
                      <div>
                        <p className="font-label-md uppercase tracking-wide text-on-surface-variant">
                          Infracciones
                        </p>
                        <p
                          className={`text-title-lg font-bold ${
                            selected.violations === 0 ? 'text-secondary' : 'text-error'
                          }`}
                        >
                          {selected.violations}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              )}

              {/* Tendencia mensual de seguridad */}
              {selected && selected.monthlySafety.length > 0 && (
                <section
                  aria-labelledby="trend-title"
                  className="rounded-xl bg-surface-container-lowest p-lg shadow-sm"
                >
                  <h3 id="trend-title" className="mb-md font-label-lg font-bold uppercase tracking-wide text-on-surface-variant">
                    Tendencia de Seguridad Mensual
                  </h3>
                  <div className="flex h-32 items-end gap-sm" role="img" aria-label={`Tendencia de seguridad de ${selected.driver?.full_name ?? 'conductor'}: ${selected.monthlySafety.join(', ')}`}>
                    {selected.monthlySafety.map((v, i) => (
                      <div key={i} className="flex flex-1 flex-col items-center gap-xs">
                        <div
                          className="w-full rounded-t bg-primary/80"
                          style={{ height: `${(v / maxSafety) * 100}%` }}
                        />
                        <span className="font-label-md text-on-surface-variant">{i + 1}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </aside>
          </div>
        </div>
      </div>
  )
}

interface KpiCardProps {
  icon: string
  tone: 'primary' | 'secondary' | 'amber' | 'error'
  label: string
  value: string
  trend?: string
  trendUp?: boolean
  progress?: number
  alert?: boolean
}

function KpiCard({ icon, tone, label, value, trend, trendUp, progress, alert }: KpiCardProps) {
  const toneClasses: Record<KpiCardProps['tone'], string> = {
    primary: 'bg-primary-container/40 text-primary',
    secondary: 'bg-secondary-container/50 text-on-secondary-container',
    amber: 'bg-[#f3e6c4] text-[#6b4e00]',
    error: 'bg-error-container text-error',
  }
  const barTone: Record<KpiCardProps['tone'], string> = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    amber: 'bg-[#c47d00]',
    error: 'bg-error',
  }
  return (
    <div className="rounded-xl border border-transparent bg-surface-container-lowest p-lg shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-md flex items-start justify-between">
        <div className={`rounded-lg p-2 ${toneClasses[tone]}`}>
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
            {icon}
          </span>
        </div>
        {trend && (
          <span
            className={`flex items-center gap-xs font-label-lg font-semibold ${
              trendUp ? 'text-secondary' : 'text-error'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">
              {trendUp ? 'trending_up' : 'trending_down'}
            </span>
            {trend}
          </span>
        )}
        {alert && <span className="font-label-lg font-bold text-error">Crítico</span>}
      </div>
      <p className="font-label-lg text-on-surface-variant">{label}</p>
      <p className="mt-xs text-[36px] font-bold leading-none text-on-surface">{value}</p>
      {typeof progress === 'number' ? (
        <div className="mt-lg h-1.5 w-full rounded-full bg-surface-container">
          <div className={`h-full rounded-full ${barTone[tone]}`} style={{ width: `${Math.min(100, progress)}%` }} />
        </div>
      ) : (
        <p className="mt-lg font-label-lg font-bold text-error">Requiere acción inmediata</p>
      )}
    </div>
  )
}
