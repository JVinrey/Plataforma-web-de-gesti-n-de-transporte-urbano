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
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Por favor ingresa tu correo electrónico')
      return
    }

    if (!password.trim()) {
      setError('Por favor ingresa tu contraseña')
      return
    }

    setIsLoading(true)
    try {
      navigate('/')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] py-6 md:py-8">
      <section className="overflow-hidden rounded-3xl border border-outline-variant bg-surface-container-lowest shadow-sm">
        <div className="grid min-h-[720px] lg:grid-cols-[1.05fr_0.95fr]">
          <aside className="relative hidden overflow-hidden bg-gradient-to-br from-primary to-primary-container p-8 text-white lg:flex lg:flex-col lg:justify-between">
            <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-10 -left-10 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[40px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  directions_bus
                </span>
                <h1 className="text-title-lg font-title-lg font-bold tracking-tight">TransitUrbano</h1>
              </div>

              <div className="space-y-4 max-w-md">
                <h2 className="text-display-lg font-display-lg leading-tight">
                  Tu ciudad,
                  <br />
                  <span className="opacity-80">en movimiento.</span>
                </h2>
                <p className="text-body-lg text-white/80">
                  Gestiona rutas, monitorea el tráfico en tiempo real y optimiza la movilidad urbana con nuestra plataforma inteligente.
                </p>
              </div>
            </div>

            <div className="relative z-10 rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-md">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                    bolt
                  </span>
                </div>
                <div>
                  <p className="text-label-lg font-semibold uppercase tracking-wider">Estado del sistema</p>
                  <p className="text-body-md text-white/85">Todas las rutas operando con normalidad.</p>
                </div>
              </div>
            </div>
          </aside>

          <section className="flex flex-col justify-between bg-surface-container-lowest p-5 sm:p-8 lg:p-10">
            <div className="space-y-8">
              <div className="lg:hidden flex items-center gap-2">
                <span className="material-symbols-outlined text-[32px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                  directions_bus
                </span>
                <h1 className="text-title-lg font-title-lg font-bold text-primary">TransitUrbano</h1>
              </div>

              <div className="max-w-[420px] space-y-2">
                <h2 className="text-headline-lg font-headline-lg text-on-surface">Bienvenido de nuevo</h2>
                <p className="text-body-md text-on-surface-variant">
                  Ingresa tus credenciales para acceder al panel de control.
                </p>
              </div>

              <form className="max-w-[420px] space-y-5" onSubmit={handleSubmit} noValidate>
                {error && (
                  <div className="flex items-start gap-3 rounded-2xl border border-error bg-error-container p-4" role="alert" aria-live="polite">
                    <span className="material-symbols-outlined mt-0.5 text-[20px] text-error" style={{ fontVariationSettings: "'FILL' 1" }}>
                      error
                    </span>
                    <p className="text-label-lg font-semibold text-on-error-container">{error}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="email" className="block text-label-lg font-semibold text-on-surface">
                    Correo electrónico
                  </label>
                  <div className="flex items-center gap-2 rounded-2xl border border-outline-variant bg-surface-container-lowest px-3 py-2 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
                    <span className="material-symbols-outlined text-outline">mail</span>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="operador@manta.gov.ec"
                      className="w-full border-none bg-transparent p-0 text-body-md outline-none placeholder:text-outline"
                      aria-required="true"
                      aria-label="Correo electrónico"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <label htmlFor="password" className="block text-label-lg font-semibold text-on-surface">
                      Contraseña
                    </label>
                    <button
                      type="button"
                      onClick={() => navigate('/register')}
                      className="text-label-md font-semibold text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                  <div className="flex items-center gap-2 rounded-2xl border border-outline-variant bg-surface-container-lowest px-3 py-2 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
                    <span className="material-symbols-outlined text-outline">lock</span>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full border-none bg-transparent p-0 text-body-md outline-none placeholder:text-outline"
                      aria-required="true"
                      aria-label="Contraseña"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="rounded-full p-1 text-outline hover:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary"
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      aria-pressed={showPassword}
                    >
                      <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility' : 'visibility_off'}</span>
                    </button>
                  </div>
                </div>

                <label className="flex items-center gap-3 text-body-md text-on-surface-variant">
                  <input
                    id="remember"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-5 w-5 rounded border-outline-variant text-primary focus:ring-primary"
                    aria-label="Recordar sesión"
                  />
                  Recordar sesión
                </label>

                <div className="space-y-4 pt-1">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 font-bold text-on-primary transition-colors hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    aria-busy={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="material-symbols-outlined animate-spin">hourglass_empty</span>
                        Iniciando sesión...
                      </>
                    ) : (
                      'Iniciar sesión'
                    )}
                  </button>

                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-outline-variant" />
                    <span className="text-label-md font-semibold uppercase tracking-widest text-outline">o</span>
                    <div className="h-px flex-1 bg-outline-variant" />
                  </div>

                  <button
                    type="button"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-outline-variant bg-surface-container-low px-5 py-3 font-semibold text-on-surface transition-colors hover:bg-surface-container-high focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-label="Continuar con Google"
                    onClick={() => navigate('/')}
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Continúa con Google
                  </button>
                </div>
              </form>

              <div className="max-w-[420px] space-y-3 text-center">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="text-body-md font-semibold text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded"
                >
                  Continuar como invitado
                </button>
                <p className="text-label-md text-on-surface-variant">
                  ¿No tienes una cuenta?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/register')}
                    className="font-bold text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded"
                  >
                    Regístrate ahora
                  </button>
                </p>
              </div>
            </div>

            <footer className="mt-8 flex flex-wrap items-center justify-center gap-4 border-t border-outline-variant/30 pt-5 text-label-md text-outline">
              <a href="#privacy" className="rounded focus:outline-none focus:ring-2 focus:ring-primary">
                Privacidad
              </a>
              <a href="#terms" className="rounded focus:outline-none focus:ring-2 focus:ring-primary">
                Términos
              </a>
              <a href="#support" className="rounded focus:outline-none focus:ring-2 focus:ring-primary">
                Soporte Técnico
              </a>
            </footer>
          </section>
        </div>
      </section>
    </div>
  )
}

export default LoginPage
