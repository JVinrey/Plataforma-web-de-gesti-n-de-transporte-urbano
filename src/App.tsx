import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { PassengerShell } from './components/layout/PassengerShell'
import { AdminShell } from './components/layout/AdminShell'
import {
  AlertsPage,
  AssistantPage,
  DriverPerformancePage,
  ElderlyModePage,
  FleetPage,
  GuestHomePage,
  HistoryNotificationsPage,
  LoginPage,
  NotFoundPage,
  ProfilePage,
  RegisterPage,
  RoutePlanningPage,
  RoutesPage,
  SchedulesPage,
  TripPage,
  TripPlannerPage,
  TripRatingPage,
  TrackingPaymentPage,
  WalletPage,
  HelpPage,
} from './pages'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ZONE 1 — App de pasajeros (home + sidebar PassengerShell) */}
        <Route element={<PassengerShell />}>
          <Route index element={<GuestHomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/planificar-viaje" element={<TripPlannerPage />} />
          <Route path="/rutas" element={<RoutesPage />} />
          <Route path="/adulto-mayor" element={<ElderlyModePage />} />
          <Route path="/seguimiento-pago" element={<TrackingPaymentPage />} />
          <Route path="/historial" element={<HistoryNotificationsPage />} />
          <Route path="/asistente" element={<AssistantPage />} />
          <Route path="/alertas" element={<AlertsPage />} />
          <Route path="/calificar" element={<TripRatingPage />} />
          <Route path="/billetera" element={<WalletPage />} />
          <Route path="/ayuda" element={<HelpPage />} />
        </Route>

        {/* ZONE 2 — Sitio público (cabecera + nav superior) */}
        <Route element={<AppLayout />}>
          <Route path="/rutas" element={<RoutesPage />} />
          <Route path="/viaje/:id" element={<TripPage />} />
          <Route path="/perfil" element={<ProfilePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* ZONE 3 — Panel de administración (sidebar AdminShell) */}
        <Route element={<AdminShell />}>
          <Route path="/fleet" element={<FleetPage />} />
          <Route path="/route-planning" element={<RoutePlanningPage />} />
          <Route path="/schedules" element={<SchedulesPage />} />
          <Route path="/driver-performance" element={<DriverPerformancePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
