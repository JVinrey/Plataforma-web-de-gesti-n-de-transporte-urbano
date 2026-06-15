import { useMemo, useState } from 'react'
import { CreditCard, LocateFixed, QrCode, RefreshCw, Wallet } from 'lucide-react'
import { MantaMap } from '../components/map'
import type { MapVehicle } from '../components/map'
import { useDocumentTitle } from '../hooks/use-document-title'
import { useRouteStops, useRoutes, useVehicles } from '../hooks/use-transit-data'

const PAYMENT_METHODS = [
  { id: 'saldo', label: 'Saldo App', detail: 'Disponible ahora', icon: Wallet },
  { id: 'tarjeta', label: 'Tarjeta **** 4242', detail: 'Visa debito', icon: CreditCard },
  { id: 'contactless', label: 'Pago sin contacto', detail: 'NFC / billetera movil', icon: LocateFixed },
]

function QrPattern() {
  return (
    <div
      aria-hidden="true"
      className="grid size-48 grid-cols-7 grid-rows-7 gap-1 rounded-lg bg-white p-3 shadow-inner"
    >
      {Array.from({ length: 49 }).map((_, index) => {
        const dark = [0, 1, 2, 7, 9, 14, 15, 16, 4, 5, 6, 11, 13, 18, 19, 20, 28, 30, 31, 33, 35, 36, 41, 43, 45, 46, 48].includes(index)
        return <span key={index} className={dark ? 'rounded-sm bg-gray-950' : 'rounded-sm bg-gray-100'} />
      })}
    </div>
  )
}

export function TrackingPaymentPage() {
  useDocumentTitle('Seguimiento y pago')

  const { data: routes = [] } = useRoutes()
  const { data: vehicles = [] } = useVehicles()
  const [selectedRouteId, setSelectedRouteId] = useState('')
  const [selectedPayment, setSelectedPayment] = useState(PAYMENT_METHODS[0].id)
  const [paid, setPaid] = useState(false)

  const activeRouteId = selectedRouteId || routes.find((route) => route.status !== 'off_line')?.id || ''
  const activeRoute = routes.find((route) => route.id === activeRouteId)
  const { data: routePath = [] } = useRouteStops(activeRouteId || null)

  const mapVehicles = useMemo<MapVehicle[]>(
    () =>
      vehicles
        .filter((vehicle) => vehicle.route_id === activeRouteId)
        .map((vehicle) => ({
          id: vehicle.id,
          plate: vehicle.plate,
          lat: vehicle.lat,
          lng: vehicle.lng,
          status: vehicle.status,
          routeLabel: vehicle.route ? `${vehicle.route.code} - ${vehicle.route.name}` : undefined,
        })),
    [vehicles, activeRouteId],
  )

  const firstVehicle = vehicles.find((vehicle) => vehicle.route_id === activeRouteId)
  const eta = activeRoute ? Math.max(3, Math.round(activeRoute.frequency_minutes / 2)) : 4
  const balance = paid && activeRoute ? Math.max(0, 5 - activeRoute.cost) : 5

  return (
    <div className="text-on-background">
      <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[1fr_25rem]">
        <section aria-labelledby="tracking-title" className="min-h-[34rem] overflow-hidden rounded-lg border border-outline-variant bg-surface-container">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant bg-white p-4">
            <div>
              <p className="text-sm font-semibold uppercase text-primary">Tracking en vivo</p>
              <h1 id="tracking-title" className="text-2xl font-black text-on-surface">
                {activeRoute ? `${activeRoute.code} - ${activeRoute.name}` : 'Selecciona una ruta'}
              </h1>
            </div>
            <label className="flex items-center gap-2 text-sm font-semibold text-on-surface">
              Ruta
              <select
                value={activeRouteId}
                onChange={(event) => setSelectedRouteId(event.target.value)}
                className="min-h-11 rounded-md border border-outline px-3 py-2"
              >
                {routes.map((route) => (
                  <option key={route.id} value={route.id}>
                    {route.code} - {route.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="relative h-[34rem]">
            <div className="absolute left-4 right-4 top-4 z-[500] rounded-lg border border-amber-300 bg-amber-100 px-4 py-3 text-amber-950 shadow-sm" role="status" aria-live="polite">
              Bus {firstVehicle?.plate ?? 'asignado'} llega en {eta} min. Mantente cerca de una zona segura de espera.
            </div>
            <MantaMap
              routePath={routePath}
              vehicles={mapVehicles}
              ariaLabel={
                activeRoute
                  ? `Mapa con seguimiento en vivo de la ruta ${activeRoute.code}`
                  : 'Mapa con seguimiento en vivo'
              }
            />
          </div>
        </section>

        <aside aria-labelledby="ticket-title" className="rounded-lg border border-outline-variant bg-white shadow-sm">
          <div className="border-b border-outline-variant p-5">
            <h2 id="ticket-title" className="text-2xl font-black text-primary">
              Ticket digital
            </h2>
            <p className="mt-1 text-on-surface-variant">Escanea el codigo al subir al transporte.</p>
          </div>

          <div className="space-y-5 p-5">
            <section aria-labelledby="qr-title" className="rounded-lg bg-surface-container-high p-5 text-center">
              <h3 id="qr-title" className="sr-only">
                Codigo QR del ticket
              </h3>
              <div className="flex justify-center">
                <QrPattern />
              </div>
              <p className="mt-4 text-sm font-semibold uppercase text-on-surface-variant">ID de ticket</p>
              <p className="font-mono text-xl font-black text-primary">
                MT-{activeRoute?.code ?? '000'}-9942
              </p>
            </section>

            <section aria-labelledby="balance-title" className="rounded-lg bg-secondary-container p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 id="balance-title" className="font-semibold text-on-secondary-container">
                    Saldo actual
                  </h3>
                  <p className="text-3xl font-black text-on-secondary-container">${balance.toFixed(2)}</p>
                </div>
                <button
                  type="button"
                  className="inline-flex min-h-11 items-center gap-2 rounded-md bg-green-950 px-4 py-2 font-bold text-white hover:bg-green-900"
                >
                  <RefreshCw aria-hidden="true" className="size-5" />
                  Recargar
                </button>
              </div>
            </section>

            <fieldset>
              <legend className="mb-3 text-sm font-black uppercase text-on-surface-variant">
                Opciones de pago
              </legend>
              <div className="space-y-2">
                {PAYMENT_METHODS.map(({ id, label, detail, icon: Icon }) => (
                  <label
                    key={id}
                    className="flex min-h-14 cursor-pointer items-center gap-3 rounded-lg border border-outline-variant p-3 hover:bg-surface-container"
                  >
                    <input
                      type="radio"
                      name="payment-method"
                      value={id}
                      checked={selectedPayment === id}
                      onChange={() => setSelectedPayment(id)}
                      className="size-5 accent-blue-800"
                    />
                    <Icon aria-hidden="true" className="size-6 text-primary" />
                    <span>
                      <span className="block font-bold text-on-surface">{label}</span>
                      <span className="text-sm text-on-surface-variant">{detail}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          <div className="border-t border-outline-variant bg-surface-container-low p-5">
            <button
              type="button"
              onClick={() => setPaid(true)}
              className="flex min-h-14 w-full items-center justify-center gap-3 rounded-lg bg-primary px-5 py-3 text-xl font-black text-on-primary hover:opacity-90"
            >
              <QrCode aria-hidden="true" className="size-6" />
              Pagar pasaje
            </button>
            <p className="mt-3 text-center text-sm text-on-surface-variant" role="status" aria-live="polite">
              {paid ? 'Pago registrado. Ticket listo para escanear.' : 'Pago seguro con confirmacion inmediata.'}
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default TrackingPaymentPage
