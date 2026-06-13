import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import {
  FleetPage,
  HomePage,
  LoginPage,
  NotFoundPage,
  ProfilePage,
  RegisterPage,
  RoutePlanningPage,
  RoutesPage,
  SchedulesPage,
  TripPage,
  TripPlannerPage,
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
        <Route path="/planificar-viaje" element={<TripPlannerPage />} />

        {/* Panel de administración de flota (layout propio a pantalla completa) */}
        <Route path="/fleet" element={<FleetPage />} />
        <Route path="/route-planning" element={<RoutePlanningPage />} />
        <Route path="/schedules" element={<SchedulesPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
