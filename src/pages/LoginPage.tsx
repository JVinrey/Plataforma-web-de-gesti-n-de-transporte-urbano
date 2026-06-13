import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDocumentTitle } from '../hooks/use-document-title'

export function LoginPage() {
  useDocumentTitle('Iniciar sesión')

  const navigate = useNavigate()
  const [email, setEmail] = useState('operador@manta.gov.ec')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [error, setError] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!email.trim()) {
      setError('Ingresa tu correo electrónico.')
      return
    }

    if (!password.trim()) {
      setError('Ingresa tu contraseña.')
      return
    }

    setError('')
    navigate('/')
  }

  return (
    <section aria-labelledby="login-title" className="space-y-8">
      <div className="space-y-3">
        <h1 id="login-title" className="text-3xl font-bold text-gray-900 md:text-4xl">
          Iniciar sesión
        </h1>
        <p className="max-w-2xl text-gray-700">
          Accede al panel del sistema para gestionar rutas, seguimiento y tus preferencias.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Acceso seguro</p>
            <h2 className="mt-1 text-2xl font-bold text-gray-900">Bienvenido de nuevo</h2>
            <p className="mt-2 text-gray-700">Ingresa tus credenciales para acceder al panel de control.</p>
          </div>

          {error && (
            <div className="mb-5 rounded-md border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800" role="alert" aria-live="polite">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-semibold text-gray-900">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="operador@manta.gov.ec"
                autoComplete="email"
                aria-required="true"
                className="w-full rounded-md border border-gray-300 px-4 py-3 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-900">
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="rounded text-sm font-medium text-blue-700 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-700"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  aria-required="true"
                  className="w-full rounded-md border border-gray-300 px-4 py-3 pr-16 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-700"
                  aria-pressed={showPassword}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
              <input
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-700 focus:ring-blue-700"
                aria-label="Recordar sesión"
              />
              Recordar sesión
            </label>

            <button type="submit" className="w-full rounded-md bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2">
              Iniciar sesión
            </button>

            <div className="relative flex items-center py-1">
              <div className="flex-grow border-t border-gray-300" />
              <span className="mx-3 text-sm font-semibold uppercase tracking-widest text-gray-500">o</span>
              <div className="flex-grow border-t border-gray-300" />
            </div>

            <button type="button" onClick={() => navigate('/')} className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-5 py-3 font-semibold text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2" aria-label="Continuar con Google">
              <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continúa con Google
            </button>
          </form>

          <div className="mt-6 text-center">
            <button type="button" onClick={() => navigate('/')} className="rounded text-sm font-semibold text-blue-700 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-700">
              Continuar como invitado
            </button>
          </div>
        </article>

        <aside className="rounded-2xl border border-gray-200 bg-gray-50 p-6 shadow-sm">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Consejos de acceso</p>
            <h2 className="text-xl font-bold text-gray-900">Mantén tu sesión segura</h2>
            <p className="text-gray-700">
              Usa tu cuenta institucional para guardar preferencias, consultar rutas y revisar actividad reciente.
            </p>
          </div>

          <div className="mt-6 space-y-3">
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-sm font-semibold text-gray-900">Correo institucional</p>
              <p className="mt-1 text-sm text-gray-700">Usa tu usuario de operador o administrador.</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-sm font-semibold text-gray-900">Acceso rápido</p>
              <p className="mt-1 text-sm text-gray-700">Si solo quieres revisar información, vuelve al inicio o entra a rutas.</p>
            </div>
            <button type="button" onClick={() => navigate('/rutas')} className="w-full rounded-md bg-gray-900 px-4 py-3 font-semibold text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2">
              Ir a rutas
            </button>
          </div>
        </aside>
      </div>
    </section>
  )
}

export default LoginPage
