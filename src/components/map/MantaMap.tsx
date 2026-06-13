import { useEffect, useMemo } from 'react'
import {
  CircleMarker,
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
} from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// =====================================================================
// MantaMap — Mapa Leaflet real centrado en Manta (Ecuador).
// Dibuja paradas, el recorrido de una línea y los vehículos en vivo a
// partir de los datos reales de Supabase.
//
// Accesibilidad (WCAG 2.2):
// - El mapa es contenido visual (canvas + tiles), por lo que se ofrece
//   una alternativa textual (lista sr-only) con las paradas del recorrido.
// - El contenedor se etiqueta con role="application" y aria-label.
// =====================================================================

/** Centro aproximado del casco urbano de Manta. */
const MANTA_CENTER: [number, number] = [-0.9583, -80.7137]

const COLORS = {
  primary: '#1b3a57', // navy — paradas / recorrido
  secondary: '#0f6b32', // verde — vehículos a tiempo
  error: '#b3261e', // rojo — destino / vehículos con retraso
  amber: '#9a5b00',
  outline: '#94a3b8',
}

export interface MapStop {
  id: string
  name: string
  lat: number
  lng: number
  accessible?: boolean
}

export interface MapVehicle {
  id: string
  plate: string
  lat: number | null
  lng: number | null
  status: 'on_time' | 'delayed' | 'maintenance'
  routeLabel?: string
}

export interface MantaMapProps {
  /** Paradas a mostrar (todas las de la red o solo las del recorrido). */
  stops?: MapStop[]
  /** Recorrido ordenado de la línea seleccionada (se dibuja como polilínea). */
  routePath?: MapStop[]
  /** Vehículos con posición en vivo. */
  vehicles?: MapVehicle[]
  /** Altura CSS del mapa (por defecto ocupa todo el contenedor). */
  className?: string
  /** Etiqueta accesible del mapa. */
  ariaLabel?: string
}

/** Ícono de autobús (divIcon) coloreado según el estado del vehículo. */
function busIcon(status: MapVehicle['status']): L.DivIcon {
  const bg =
    status === 'on_time' ? COLORS.secondary : status === 'delayed' ? COLORS.amber : COLORS.outline
  return L.divIcon({
    className: 'manta-bus-icon',
    html: `<span style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:9999px;background:${bg};color:#fff;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4);font-size:16px;line-height:1">🚌</span>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  })
}

/** Encaja la vista a los límites del recorrido cuando cambia la ruta. */
function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap()
  useEffect(() => {
    if (points.length === 0) {
      map.setView(MANTA_CENTER, 13)
      return
    }
    if (points.length === 1) {
      map.setView(points[0], 15)
      return
    }
    map.fitBounds(L.latLngBounds(points), { padding: [40, 40] })
  }, [map, points])
  return null
}

export function MantaMap({
  stops = [],
  routePath = [],
  vehicles = [],
  className = 'h-full w-full',
  ariaLabel = 'Mapa de la red de transporte de Manta',
}: MantaMapProps) {
  const pathPoints = useMemo<[number, number][]>(
    () => routePath.map((s) => [s.lat, s.lng]),
    [routePath],
  )

  // Las paradas del recorrido se priorizan; si no hay ruta, se muestran todas.
  const visibleStops = routePath.length > 0 ? routePath : stops
  const origin = routePath[0]
  const destination = routePath[routePath.length - 1]

  return (
    <div className={className} role="application" aria-label={ariaLabel}>
      <MapContainer
        center={MANTA_CENTER}
        zoom={13}
        scrollWheelZoom
        className="h-full w-full rounded-2xl"
        style={{ minHeight: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitBounds points={pathPoints} />

        {/* Recorrido de la línea seleccionada */}
        {pathPoints.length > 1 && (
          <Polyline
            positions={pathPoints}
            pathOptions={{ color: COLORS.primary, weight: 5, opacity: 0.8 }}
          />
        )}

        {/* Paradas */}
        {visibleStops.map((stop) => {
          const isOrigin = origin && stop.id === origin.id
          const isDest = destination && stop.id === destination.id
          const color = isDest ? COLORS.error : isOrigin ? COLORS.secondary : COLORS.primary
          return (
            <CircleMarker
              key={stop.id}
              center={[stop.lat, stop.lng]}
              radius={isOrigin || isDest ? 8 : 6}
              pathOptions={{
                color: '#fff',
                weight: 2,
                fillColor: color,
                fillOpacity: 1,
              }}
            >
              <Tooltip direction="top" offset={[0, -6]}>
                {stop.name}
                {stop.accessible ? ' · ♿ Accesible' : ''}
              </Tooltip>
            </CircleMarker>
          )
        })}

        {/* Vehículos en vivo */}
        {vehicles
          .filter((v) => v.lat != null && v.lng != null)
          .map((v) => (
            <Marker
              key={v.id}
              position={[v.lat as number, v.lng as number]}
              icon={busIcon(v.status)}
            >
              <Popup>
                <strong>{v.plate}</strong>
                {v.routeLabel ? <br /> : null}
                {v.routeLabel}
                <br />
                Estado:{' '}
                {v.status === 'on_time'
                  ? 'A tiempo'
                  : v.status === 'delayed'
                    ? 'Con retraso'
                    : 'En mantenimiento'}
              </Popup>
            </Marker>
          ))}
      </MapContainer>

      {/* Alternativa textual para lectores de pantalla */}
      <div className="sr-only">
        {routePath.length > 0 ? (
          <p>
            Recorrido con {routePath.length} paradas, desde {origin?.name} hasta {destination?.name}.
          </p>
        ) : (
          <p>Mapa con {stops.length} paradas de la red de transporte de Manta.</p>
        )}
        <ul>
          {visibleStops.map((s) => (
            <li key={s.id}>
              {s.name}
              {s.accessible ? ' (parada accesible)' : ''}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default MantaMap
