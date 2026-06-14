import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import {
  AlertsPage,
  AssistantPage,
  DriverPerformancePage,
  FleetPage,
  GuestHomePage,
  HomePage,
  ElderlyModePage,
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
} from './pages'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Sitio público (cabecera + pie + menú de accesibilidad) */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/rutas" element={<RoutesPage />} />
          <Route path="/viaje/:id" element={<TripPage />} />
          <Route path="/perfil" element={<ProfilePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* App de pasajeros con shell propio (sidebar + mapa a pantalla completa) */}
        <Route path="/inicio" element={<GuestHomePage />} />
        <Route path="/planificar-viaje" element={<TripPlannerPage />} />
        <Route path="/adulto-mayor" element={<ElderlyModePage />} />
        <Route path="/seguimiento-pago" element={<TrackingPaymentPage />} />
        <Route path="/historial" element={<HistoryNotificationsPage />} />
        <Route path="/asistente" element={<AssistantPage />} />
        <Route path="/alertas" element={<AlertsPage />} />
        <Route path="/calificar" element={<TripRatingPage />} />

        {/* Panel de administración de flota (layout propio a pantalla completa) */}
        <Route path="/fleet" element={<FleetPage />} />
        <Route path="/route-planning" element={<RoutePlanningPage />} />
        <Route path="/schedules" element={<SchedulesPage />} />
        <Route path="/driver-performance" element={<DriverPerformancePage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
