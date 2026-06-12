import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import {
  HomePage,
  LoginPage,
  NotFoundPage,
  ProfilePage,
  RegisterPage,
  RoutesPage,
  TripPage,
} from './pages'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/rutas" element={<RoutesPage />} />
          <Route path="/viaje/:id" element={<TripPage />} />
          <Route path="/perfil" element={<ProfilePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
