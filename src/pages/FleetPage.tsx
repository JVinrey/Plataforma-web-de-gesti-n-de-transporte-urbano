import { useState } from 'react';

interface Vehicle {
  id: string;
  route: string;
  driver: string;
  status: 'on-time' | 'delayed' | 'maintenance';
  load: number;
  lastUpdate: string;
}

/**
 * FleetPage - Fleet Dashboard
 * WCAG 2.2 AA compliant dashboard for fleet management
 * - Semantic HTML and ARIA labels
 * - Full keyboard navigation
 * - Screen reader friendly
 * - Accessible data tables
 */
export default function FleetPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([
    { id: '#4021', route: 'Route 12B (Express)', driver: 'Marcus Thorne', status: 'delayed', load: 85, lastUpdate: '2 mins ago' },
    { id: '#3855', route: 'Route 05 (Downtown)', driver: 'Sarah Jenkins', status: 'on-time', load: 42, lastUpdate: 'Just now' },
    { id: '#5112', route: 'Route 22A (Airport)', driver: 'Elena Rodriguez', status: 'on-time', load: 15, lastUpdate: '5 mins ago' },
    { id: '#4209', route: 'Route 09 (Harbor)', driver: 'David Chen', status: 'delayed', load: 60, lastUpdate: '8 mins ago' },
  ]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'on-time':
        return { label: 'On Time', color: 'bg-secondary-container text-on-secondary-container' };
      case 'delayed':
        return { label: 'Delayed (21m)', color: 'bg-error-container text-on-error-container' };
      case 'maintenance':
        return { label: 'Maintenance', color: 'bg-outline text-on-surface-variant' };
      default:
        return { label: 'Unknown', color: 'bg-surface-container text-on-surface' };
    }
  };

  return (
    <div className="flex h-screen bg-background text-on-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-surface-container-low border-r border-outline-variant shadow-sm flex flex-col py-lg px-md fixed left-0 top-0 h-screen z-50 overflow-y-auto">
        <div className="mb-xl flex items-center gap-md">
          <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center text-on-primary-container">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              directions_bus
            </span>
          </div>
          <div>
            <h1 className="font-title-lg font-bold text-primary leading-none">Manta Transit</h1>
            <p className="font-label-lg text-on-surface-variant">Fleet Control Center</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-xs" aria-label="Navegación principal">
          <a
            href="#fleet"
            className="bg-secondary-container text-on-secondary-container rounded-lg font-bold flex items-center gap-md px-md py-sm transition-all"
            aria-current="page"
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-label-lg">Fleet Dashboard</span>
          </a>
          <a
            href="#routes"
            className="text-on-surface-variant hover:bg-surface-container-high flex items-center gap-md px-md py-sm rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined">map</span>
            <span className="font-label-lg">Route Planning</span>
          </a>
          <a
            href="#schedules"
            className="text-on-surface-variant hover:bg-surface-container-high flex items-center gap-md px-md py-sm rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined">calendar_today</span>
            <span className="font-label-lg">Schedules</span>
          </a>
          <a
            href="#performance"
            className="text-on-surface-variant hover:bg-surface-container-high flex items-center gap-md px-md py-sm rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined">monitoring</span>
            <span className="font-label-lg">Driver Performance</span>
          </a>
        </nav>

        {/* CTA Button */}
        <button className="bg-primary text-on-primary font-bold py-md px-lg rounded-xl mb-xl flex items-center justify-center gap-sm hover:opacity-90 transition-all focus:ring-2 focus:ring-offset-2 focus:ring-primary">
          <span className="material-symbols-outlined">add</span>
          New Route
        </button>

        {/* Footer Navigation */}
        <div className="pt-lg border-t border-outline-variant space-y-xs">
          <a
            href="#settings"
            className="text-on-surface-variant hover:bg-surface-container-high flex items-center gap-md px-md py-sm rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined">settings</span>
            <span className="font-label-lg">Settings</span>
          </a>
          <a
            href="#support"
            className="text-on-surface-variant hover:bg-surface-container-high flex items-center gap-md px-md py-sm rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined">contact_support</span>
            <span className="font-label-lg">Support</span>
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-surface-bright border-b border-outline-variant shadow-sm flex items-center justify-between px-margin-desktop h-16 w-full shrink-0">
          <div className="flex items-center gap-lg flex-1">
            <div className="relative w-full max-w-md">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-on-surface-variant">
                <span className="material-symbols-outlined text-[20px]">search</span>
              </span>
              <input
                className="w-full pl-10 pr-4 py-2 bg-surface-container rounded-full border-none focus:ring-2 focus:ring-primary font-body-md"
                placeholder="Search fleet, routes, or drivers..."
                type="text"
                aria-label="Buscar flota, rutas o conductores"
              />
            </div>
          </div>
          <div className="flex items-center gap-md">
            <button
              className="hover:bg-surface-container-low rounded-full p-2 text-on-surface-variant transition-colors focus:ring-2 focus:ring-primary relative"
              aria-label="Notificaciones"
            >
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full" aria-hidden="true"></span>
            </button>
            <div className="h-8 w-px bg-outline-variant mx-sm"></div>
            <div className="flex items-center gap-sm">
              <span className="font-label-lg text-on-surface font-semibold">Admin Manager</span>
              <img
                alt="Manager Profile"
                className="w-8 h-8 rounded-full bg-surface-variant border border-outline-variant"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBiQz8vvmmW2UYIRsxxzh2BNpa9sgzf4ITbhk2Ay8jCCNabjrDJ1nc9I7QIjm35zy9jBed8Ec4QxHTE3aGfX2nBc33nh6M_NUcgbXgdVlnPQFaIYJfmh_r6mNqcj6rZSVmccx3IPsLmTneLGgNYmggVUi7F2UNhi1-CcST3UMnPPi7pAVjnsXKLSOXi4bHjNqRXAHEJm_ug0Qg18TgEmUD9GePI9PSw4LxgXG3hLZkJsr3oGVb-9LYaatR5th-IRIKWF0KKjKnD3ko"
              />
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-margin-desktop">
          {/* Header Section */}
          <div className="flex justify-between items-end mb-lg">
            <div>
              <h2 className="text-headline-lg font-bold text-on-surface">Fleet Overview</h2>
              <p className="text-body-md text-on-surface-variant">Real-time status of all 142 active transit units in Manta District.</p>
            </div>
            <div className="flex gap-sm">
              <button className="px-md py-xs rounded-full border border-outline text-on-surface-variant font-label-lg flex items-center gap-xs hover:bg-surface-container transition-colors focus:ring-2 focus:ring-primary">
                <span className="material-symbols-outlined text-[18px]">filter_list</span>
                Filter
              </button>
              <button className="px-md py-xs rounded-full border border-outline text-on-surface-variant font-label-lg flex items-center gap-xs hover:bg-surface-container transition-colors focus:ring-2 focus:ring-primary">
                <span className="material-symbols-outlined text-[18px]">download</span>
                Export Reports
              </button>
            </div>
          </div>

          {/* Metrics Cards */}
          <div className="grid grid-cols-12 gap-gutter mb-lg">
            {/* Active Buses */}
            <div className="col-span-12 md:col-span-4 bg-surface-container-lowest rounded-xl p-lg shadow-sm border border-transparent hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-md">
                <div className="p-xs bg-primary-container/10 rounded-lg">
                  <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                    directions_bus
                  </span>
                </div>
                <span className="text-secondary font-label-lg flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[16px]">trending_up</span>
                  +3%
                </span>
              </div>
              <p className="font-label-lg text-on-surface-variant uppercase tracking-wider">Active Buses</p>
              <h3 className="text-[40px] font-bold text-on-surface mt-xs leading-none">
                128<span className="text-headline-lg font-normal text-on-surface-variant ml-xs">/ 142</span>
              </h3>
              <div className="w-full bg-surface-container h-1.5 rounded-full mt-lg">
                <div className="bg-primary h-full rounded-full w-[90%]"></div>
              </div>
            </div>

            {/* On-Time Performance */}
            <div className="col-span-12 md:col-span-4 bg-surface-container-lowest rounded-xl p-lg shadow-sm border border-transparent hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-md">
                <div className="p-xs bg-secondary-container/20 rounded-lg">
                  <span className="material-symbols-outlined text-on-secondary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
                    schedule
                  </span>
                </div>
                <span className="text-secondary font-label-lg flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  Optimal
                </span>
              </div>
              <p className="font-label-lg text-on-surface-variant uppercase tracking-wider">On-Time Performance</p>
              <h3 className="text-[40px] font-bold text-on-surface mt-xs leading-none">94.2%</h3>
              <div className="w-full bg-surface-container h-1.5 rounded-full mt-lg">
                <div className="bg-secondary h-full rounded-full w-[94%]"></div>
              </div>
            </div>

            {/* Critical Alerts */}
            <div className="col-span-12 md:col-span-4 bg-error-container rounded-xl p-lg shadow-sm border border-transparent hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-md">
                <div className="p-xs bg-error/10 rounded-lg">
                  <span className="material-symbols-outlined text-error" style={{ fontVariationSettings: "'FILL' 1" }}>
                    warning
                  </span>
                </div>
                <span className="text-error font-label-lg font-bold">Requires Action</span>
              </div>
              <p className="font-label-lg text-on-error-container uppercase tracking-wider">Critical Alerts</p>
              <h3 className="text-[40px] font-bold text-on-error-container mt-xs leading-none">06</h3>
            </div>
          </div>

          {/* Vehicle Status Table */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-transparent overflow-hidden">
            <div className="px-lg py-md border-b border-outline-variant">
              <h4 className="text-title-lg font-bold text-on-surface">Vehicle Status Registry</h4>
            </div>

            <div className="overflow-x-auto">
              <table
                className="w-full text-left border-collapse"
                role="table"
                aria-label="Estado de vehículos de transporte"
              >
                <thead>
                  <tr className="bg-surface-container/50" role="row">
                    <th className="px-lg py-md font-label-lg text-on-surface-variant" role="columnheader">
                      VEHICLE ID
                    </th>
                    <th className="px-lg py-md font-label-lg text-on-surface-variant" role="columnheader">
                      ROUTE
                    </th>
                    <th className="px-lg py-md font-label-lg text-on-surface-variant" role="columnheader">
                      DRIVER
                    </th>
                    <th className="px-lg py-md font-label-lg text-on-surface-variant" role="columnheader">
                      STATUS
                    </th>
                    <th className="px-lg py-md font-label-lg text-on-surface-variant" role="columnheader">
                      LOAD
                    </th>
                    <th className="px-lg py-md font-label-lg text-on-surface-variant" role="columnheader">
                      LAST UPDATE
                    </th>
                    <th className="px-lg py-md font-label-lg text-on-surface-variant" role="columnheader">
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody role="rowgroup" className="divide-y divide-outline-variant">
                  {vehicles.map((vehicle) => {
                    const statusBadge = getStatusBadge(vehicle.status);
                    return (
                      <tr key={vehicle.id} className="hover:bg-surface-container-low transition-colors" role="row">
                        <td className="px-lg py-md font-body-md font-bold text-primary" role="cell">
                          {vehicle.id}
                        </td>
                        <td className="px-lg py-md font-body-md text-on-surface" role="cell">
                          {vehicle.route}
                        </td>
                        <td className="px-lg py-md font-body-md text-on-surface" role="cell">
                          {vehicle.driver}
                        </td>
                        <td className="px-lg py-md" role="cell">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusBadge.color}`}
                            aria-label={`Estado: ${statusBadge.label}`}
                          >
                            {statusBadge.label}
                          </span>
                        </td>
                        <td className="px-lg py-md" role="cell">
                          <div className="flex items-center gap-sm">
                            <div className="w-12 bg-surface-container h-1.5 rounded-full">
                              <div
                                className="bg-secondary h-full rounded-full"
                                style={{ width: `${vehicle.load}%` }}
                              ></div>
                            </div>
                            <span className="font-label-md text-on-surface-variant">{vehicle.load}%</span>
                          </div>
                        </td>
                        <td className="px-lg py-md font-label-md text-on-surface-variant" role="cell">
                          {vehicle.lastUpdate}
                        </td>
                        <td className="px-lg py-md" role="cell">
                          <button
                            className="text-on-surface-variant hover:text-primary focus:ring-2 focus:ring-primary rounded p-1"
                            aria-label={`Más opciones para vehículo ${vehicle.id}`}
                          >
                            <span className="material-symbols-outlined">more_vert</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-md bg-surface-container-low border-t border-outline-variant flex justify-between items-center">
              <p className="font-label-lg text-on-surface-variant">Showing 4 of 142 vehicles</p>
              <div className="flex gap-xs">
                <button
                  className="p-1 rounded border border-outline-variant hover:bg-white focus:ring-2 focus:ring-primary"
                  aria-label="Página anterior"
                >
                  <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                </button>
                <button
                  className="p-1 rounded border border-outline-variant hover:bg-white focus:ring-2 focus:ring-primary"
                  aria-label="Página siguiente"
                >
                  <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Action Button */}
      <button
        className="fixed bottom-lg right-lg w-14 h-14 rounded-2xl bg-primary text-on-primary shadow-lg flex items-center justify-center hover:shadow-xl hover:scale-105 active:scale-95 transition-all z-[60] focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        aria-label="Agregar nuevo vehículo"
      >
        <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
          add
        </span>
      </button>
    </div>
  );
}
