import { useMemo, useState } from 'react'
import { Bell, CheckCircle2, Filter, Gift, Info, Route, Wallet, X } from 'lucide-react'
import { useDocumentTitle } from '../hooks/use-document-title'
import { useRoutes } from '../hooks/use-transit-data'

type FilterValue = 'all' | 'completed' | 'planned'

const NOTIFICATIONS = [
  {
    id: 'delay',
    title: 'Alerta de retraso',
    detail: 'La ruta con más demanda presenta congestión. Estimamos 15 min adicionales.',
    time: '10 min',
    tone: 'border-amber-500 bg-amber-50 text-amber-950',
    icon: Bell,
  },
  {
    id: 'reward',
    title: 'Nueva recompensa',
    detail: 'Ganaste 50 puntos de movilidad por tus viajes frecuentes de esta semana.',
    time: '2 h',
    tone: 'border-green-700 bg-green-50 text-green-950',
    icon: Gift,
  },
  {
    id: 'schedule',
    title: 'Cambio de horario',
    detail: 'El horario nocturno fue extendido hasta la medianoche en rutas principales.',
    time: 'ayer',
    tone: 'border-blue-700 bg-blue-50 text-blue-950',
    icon: Info,
  },
]

function formatCurrency(value: number) {
  return `$${value.toFixed(2)}`
}

export function HistoryNotificationsPage() {
  useDocumentTitle('Historial y notificaciones')

  const { data: routes = [] } = useRoutes()
  const [filter, setFilter] = useState<FilterValue>('all')
  const [dismissedSuggestion, setDismissedSuggestion] = useState(false)
  const [readNotifications, setReadNotifications] = useState<string[]>([])

  const history = useMemo(
    () =>
      routes.slice(0, 5).map((route, index) => ({
        id: route.id,
        routeName: `${route.code}: ${route.name}`,
        date: index === 0 ? 'Hoy, 08:45' : index === 1 ? 'Ayer, 18:15' : `Hace ${index + 1} días`,
        status: index === 4 ? 'planned' : 'completed',
        duration: route.estimated_time_minutes,
        cost: route.cost,
        payment: index % 2 === 0 ? 'Saldo App' : 'Tarjeta **** 4242',
      })),
    [routes],
  )

  const filteredHistory = history.filter((item) => filter === 'all' || item.status === filter)
  const totalSpent = history
    .filter((item) => item.status === 'completed')
    .reduce((sum, item) => sum + item.cost, 0)
  const bestRoute = routes.find((route) => route.status === 'on_time') ?? routes[0]

  const markAllRead = () => setReadNotifications(NOTIFICATIONS.map((notification) => notification.id))

  return (
    <div className="text-on-background">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <section aria-labelledby="history-title" className="space-y-5">
          <div>
            <h1 id="history-title" className="text-3xl font-black text-on-surface">
              Historial de viajes
            </h1>
            <p className="mt-1 text-on-surface-variant">
              Revisa tus trayectos, consumos y estados recientes.
            </p>
          </div>

          {!dismissedSuggestion && bestRoute && (
            <article className="flex items-start gap-3 rounded-lg bg-primary-container p-4 text-on-primary-container">
              <Route aria-hidden="true" className="mt-1 size-6" />
              <div className="flex-1">
                <p className="text-sm font-black uppercase">Sugerencia</p>
                <h2 className="text-lg font-bold">
                  Basado en tus viajes, {bestRoute.code} es una buena opción hoy.
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setDismissedSuggestion(true)}
                className="rounded-md p-2 hover:bg-white/40"
                aria-label="Cerrar sugerencia"
              >
                <X aria-hidden="true" className="size-5" />
              </button>
            </article>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-outline-variant bg-white p-4">
            <div className="flex items-center gap-2">
              <Filter aria-hidden="true" className="size-5 text-primary" />
              <label htmlFor="history-filter" className="font-bold text-on-surface">
                Filtrar viajes
              </label>
            </div>
            <select
              id="history-filter"
              value={filter}
              onChange={(event) => setFilter(event.target.value as FilterValue)}
              className="min-h-11 rounded-md border border-outline px-3 py-2"
            >
              <option value="all">Todos</option>
              <option value="completed">Completados</option>
              <option value="planned">Planificados</option>
            </select>
          </div>

          <ol className="rounded-lg border border-outline-variant bg-white" aria-label="Ultimos viajes">
            {filteredHistory.map((item, index) => (
              <li key={item.id} className="grid gap-3 border-b border-outline-variant p-4 last:border-b-0 sm:grid-cols-[auto_1fr_auto]">
                <div className="flex size-12 items-center justify-center rounded-full bg-primary text-on-primary">
                  <Route aria-hidden="true" className="size-6" />
                </div>
                <div>
                  <p className="text-sm text-on-surface-variant">{item.date}</p>
                  <h2 className="text-lg font-black text-on-surface">{item.routeName}</h2>
                  <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-on-surface-variant">
                    <span className="inline-flex items-center gap-1 text-green-800">
                      <CheckCircle2 aria-hidden="true" className="size-4" />
                      {item.status === 'completed' ? 'Completado' : 'Planificado'}
                    </span>
                    <span aria-hidden="true">-</span>
                    <span>{item.duration} min</span>
                    <span aria-hidden="true">-</span>
                    <span>{item.payment}</span>
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xl font-black text-primary">{formatCurrency(item.cost)}</p>
                  <p className="text-sm text-on-surface-variant">Viaje #{index + 1}</p>
                </div>
              </li>
            ))}
            {filteredHistory.length === 0 && (
              <li className="p-4 text-on-surface-variant">No hay viajes para este filtro.</li>
            )}
          </ol>
        </section>

        <aside className="space-y-5" aria-labelledby="notifications-title">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 id="notifications-title" className="text-2xl font-black text-on-surface">
                Notificaciones
              </h2>
              <p className="text-on-surface-variant">Alertas y novedades de la red.</p>
            </div>
            <button
              type="button"
              onClick={markAllRead}
              className="rounded-md px-3 py-2 font-semibold text-primary hover:bg-surface-container"
            >
              Marcar leídas
            </button>
          </div>

          <div className="space-y-3" role="list" aria-live="polite">
            {NOTIFICATIONS.map(({ id, title, detail, time, tone, icon: Icon }) => {
              const isRead = readNotifications.includes(id)
              return (
                <article
                  key={id}
                  role="listitem"
                  className={`rounded-lg border-l-4 p-4 shadow-sm ${tone} ${isRead ? 'opacity-70' : ''}`}
                >
                  <div className="flex gap-3">
                    <Icon aria-hidden="true" className="mt-1 size-6" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="font-black">{title}</h3>
                        <span className="text-sm">{time}</span>
                      </div>
                      <p className="mt-1">{detail}</p>
                      {!isRead && (
                        <button
                          type="button"
                          onClick={() => setReadNotifications((current) => [...current, id])}
                          className="mt-3 rounded-md bg-white px-3 py-2 text-sm font-bold text-gray-950 hover:bg-gray-100"
                        >
                          Marcar como leída
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>

          <section aria-labelledby="summary-title" className="rounded-lg bg-[#1e293b] p-5">
            <div className="flex items-center gap-3">
              <Wallet aria-hidden="true" className="size-6 text-[#7dd3af]" />
              <h2 id="summary-title" className="text-xl font-black text-white">
                Resumen mensual
              </h2>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-slate-300">Total gastado</dt>
                <dd className="text-3xl font-black text-white">{formatCurrency(totalSpent)}</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-300">Viajes</dt>
                <dd className="text-3xl font-black text-white">{history.length}</dd>
              </div>
            </dl>
          </section>
        </aside>
      </div>
    </div>
  )
}

export default HistoryNotificationsPage
