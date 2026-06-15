import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/use-document-title';
import { useRoutes, useRouteStops, useStops, useVehicles } from '../hooks/use-transit-data';
import type { RouteRow } from '../hooks/use-transit-data';
import { useAiContext, useAiRecommend } from '../hooks/use-ai';
import { fastestRoute, filterRoutesByDestination } from '../utils/route-matching';
import { MantaMap } from '../components/map';
import type { MapVehicle } from '../components/map';

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

/** Mapea el estado de una ruta real al nivel de congestión mostrado al pasajero. */
function congestionFromStatus(status: RouteRow['status']): Congestion {
  switch (status) {
    case 'on_time':
      return 'baja';
    case 'delayed':
      return 'alta';
    default:
      return 'media';
  }
}

/** Formatea una hora de llegada sumando los minutos de duración a la hora actual. */
function arrivalIn(minutes: number): string {
  const d = new Date(Date.now() + minutes * 60000);
  return d.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit', hour12: false });
}

const CONGESTION_BADGE: Record<Congestion, { label: string; color: string }> = {
  baja: { label: 'Congestión Baja', color: 'bg-secondary-container text-on-secondary-container' },
  media: { label: 'Media', color: 'bg-[#f3e6c4] text-[#6b4e00]' },
  alta: { label: 'Alta', color: 'bg-error-container text-on-error-container' },
};

const PAGE_BG = '#edf3fb';

/**
 * TripPlannerPage — Planificar Viaje (app de pasajeros)
 * Pantalla pública para buscar y comparar rutas en Manta. Los candidatos se
 * calculan de forma determinista (filtro por destino) y la Edge Function
 * `ai-recommend` PRIORIZA y JUSTIFICA la mejor según tiempo, congestión,
 * frecuencia y accesibilidad. Si la IA no responde, se recomienda la más rápida.
 * WCAG 2.2 AA: HTML semántico (1.3.1), navegable por teclado (2.1.1),
 * nombres/roles en controles custom (4.1.2) y contraste >= 4.5:1 (1.4.3).
 */
export default function TripPlannerPage() {
  useDocumentTitle('Planificar viaje');

  const { data: routeRows = [], isLoading } = useRoutes();
  const [searchParams] = useSearchParams();
  const context = useAiContext();
  const recommend = useAiRecommend();

  const [origin, setOrigin] = useState(() => searchParams.get('origen') ?? 'Terminal Terrestre');
  const [destination, setDestination] = useState(() => searchParams.get('destino') ?? '');
  const [lowFloor, setLowFloor] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState('');
  // Recomendación de la IA: id elegido + justificación en lenguaje natural.
  const [aiRec, setAiRec] = useState<{ id: string; reason: string } | null>(null);

  // Candidatos deterministas: rutas disponibles que coinciden con el destino.
  const filtered = useMemo(
    () => filterRoutesByDestination(routeRows, destination),
    [routeRows, destination],
  );
  const filteredKey = useMemo(() => filtered.map((r) => r.id).join(','), [filtered]);
  const localFastestId = useMemo(() => fastestRoute(filtered)?.id ?? '', [filtered]);

  // Pide a la IA que priorice/justifique entre los candidatos (con debounce).
  useEffect(() => {
    setAiRec(null);
    const term = destination.trim();
    if (!term || filtered.length < 2) return;
    const candidates = filtered.map((r) => ({
      id: r.id,
      code: r.code,
      name: r.name,
      durationMin: r.estimated_time_minutes,
      cost: r.cost,
      congestion: congestionFromStatus(r.status),
      frequencyMin: r.frequency_minutes,
    }));
    const handle = setTimeout(() => {
      recommend.mutate(
        { origin, destination: term, candidates, lowFloorPreferred: lowFloor, context },
        {
          onSuccess: (res) => {
            if (candidates.some((c) => c.id === res.recommendedId)) {
              setAiRec({ id: res.recommendedId, reason: res.reason });
            }
          },
          onError: () => setAiRec(null),
        },
      );
    }, 600);
    return () => clearTimeout(handle);
    // origin/lowFloor/context se leen al disparar; el efecto se reevalúa con el destino y los candidatos.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destination, filteredKey, lowFloor]);

  // Id recomendado efectivo: el de la IA si sigue siendo válido, o el más rápido.
  const recommendedId =
    aiRec && filtered.some((r) => r.id === aiRec.id) ? aiRec.id : localFastestId;

  const routeOptions = useMemo<RouteOption[]>(
    () =>
      filtered
        .map((r) => ({
          id: r.id,
          durationMin: r.estimated_time_minutes,
          arrival: arrivalIn(r.estimated_time_minutes),
          cost: `$${r.cost.toFixed(2)}`,
          congestion: congestionFromStatus(r.status),
          line: r.code,
          lineTone: r.id === recommendedId ? 'primary' : 'soft',
          walkMin: Math.max(2, Math.round(r.frequency_minutes / 3)),
          recommended: r.id === recommendedId,
        }))
        // La ruta recomendada por la IA siempre va de primera.
        .sort((a, b) => Number(b.recommended) - Number(a.recommended)),
    [filtered, recommendedId],
  );

  // Selección efectiva: la elegida por el usuario o la ruta recomendada por defecto.
  const effectiveRoute = selectedRoute || recommendedId || routeOptions[0]?.id || '';

  // Datos reales para el mapa: paradas del recorrido seleccionado, toda la
  // red (cuando no hay selección) y vehículos en vivo de esa línea.
  const { data: routePath = [] } = useRouteStops(effectiveRoute || null);
  const { data: allStops = [] } = useStops();
  const { data: vehicles = [] } = useVehicles();

  const selectedRouteRow = routeRows.find((r) => r.id === effectiveRoute);
  const mapVehicles = useMemo<MapVehicle[]>(
    () =>
      vehicles
        .filter((v) => v.route_id === effectiveRoute)
        .map((v) => ({
          id: v.id,
          plate: v.plate,
          lat: v.lat,
          lng: v.lng,
          status: v.status,
          routeLabel: v.route ? `${v.route.code} · ${v.route.name}` : undefined,
        })),
    [vehicles, effectiveRoute],
  );

  const swapEnds = () => {
    setOrigin(destination);
    setDestination(origin);
  };

  return (
    <div
      className="-mx-lg -mt-lg flex h-[calc(100vh-5rem)] overflow-hidden text-on-background"
      style={{ backgroundColor: PAGE_BG }}
    >
        {/* Trip planner form */}
        <div className="w-[26rem] shrink-0 overflow-y-auto px-lg py-lg">
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
          <div className="mt-lg flex items-baseline justify-between gap-sm">
            <h2 className="text-2xl font-bold text-on-surface">Mejores Rutas</h2>
            {!isLoading && (
              <p className="font-label-lg text-on-surface-variant" role="status" aria-live="polite">
                {routeOptions.length}{' '}
                {routeOptions.length === 1 ? 'ruta encontrada' : 'rutas encontradas'}
              </p>
            )}
          </div>
          {isLoading && <p className="mt-md text-body-md text-on-surface-variant">Buscando rutas…</p>}
          {!isLoading && routeOptions.length === 0 && (
            <p className="mt-md rounded-xl bg-surface-container px-md py-lg text-body-md text-on-surface-variant">
              {destination.trim()
                ? `No encontramos rutas hacia “${destination.trim()}”. Prueba con otro destino o un punto de referencia (Terminal, Playa, ULEAM…).`
                : 'No hay rutas disponibles en este momento.'}
            </p>
          )}
          {recommend.isPending && (
            <p className="mt-md flex items-center gap-xs text-body-md text-on-surface-variant" role="status" aria-live="polite">
              <span className="material-symbols-outlined animate-spin text-[18px]" aria-hidden="true">
                progress_activity
              </span>
              La IA está analizando la mejor ruta…
            </p>
          )}
          <ul className="mt-md space-y-md" role="list">
            {routeOptions.map((opt) => {
              const badge = CONGESTION_BADGE[opt.congestion];
              const isSelected = opt.id === effectiveRoute;
              const showReason = opt.recommended && aiRec?.id === opt.id && aiRec.reason;
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
                    {/* Justificación en lenguaje natural generada por la IA */}
                    {showReason && (
                      <p className="mt-md flex items-start gap-xs rounded-lg bg-secondary-container px-3 py-2 font-label-lg text-on-secondary-container">
                        <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                          auto_awesome
                        </span>
                        <span>{aiRec.reason}</span>
                      </p>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Map — Leaflet real centrado en Manta con el recorrido seleccionado */}
        <section
          aria-label="Mapa del viaje planificado en Manta"
          className="relative m-lg flex-1 overflow-hidden rounded-2xl border border-outline-variant/50"
        >
          {/* Weather chip */}
          <div className="pointer-events-none absolute right-4 top-4 z-[500] flex items-center gap-xs rounded-full bg-surface-bright px-4 py-2 font-label-lg font-semibold text-on-surface shadow-md">
            <span className="material-symbols-outlined text-[18px] text-[#c47d00]" aria-hidden="true">
              sunny
            </span>
            Manta: 28°C
          </div>

          {/* Chip con la línea recomendada en vivo */}
          {selectedRouteRow && (
            <div className="absolute left-4 top-4 z-[500] flex items-center gap-sm rounded-xl border-2 border-secondary bg-surface-bright px-4 py-2 shadow-md">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-on-secondary">
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                  directions_bus
                </span>
              </span>
              <div>
                <p className="font-body-md font-bold leading-tight text-on-surface">
                  {selectedRouteRow.code}
                </p>
                <p className="font-label-md leading-tight text-on-surface-variant">
                  {selectedRouteRow.name}
                </p>
              </div>
            </div>
          )}

          <MantaMap
            routePath={routePath}
            stops={allStops}
            vehicles={mapVehicles}
            ariaLabel={
              selectedRouteRow
                ? `Mapa del recorrido de la línea ${selectedRouteRow.code} en Manta`
                : 'Mapa de la red de transporte de Manta'
            }
          />
        </section>
    </div>
  );
}
