import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDocumentTitle } from '../hooks/use-document-title'
import { ADMIN_DEMO, useAuthStore } from '../stores/auth-store'

export function LoginPage() {
  useDocumentTitle('Iniciar sesión')

  const navigate = useNavigate()
  const signIn = useAuthStore((state) => state.signIn)
  const signUp = useAuthStore((state) => state.signUp)
  const resetPassword = useAuthStore((state) => state.resetPassword)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const goToDestination = (userType?: string | null) => {
    navigate(userType === 'admin' ? '/fleet' : '/')
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
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
    setSuccess('')
    setSubmitting(true)
    const { error: authError, userType } = await signIn(email.trim(), password)
    setSubmitting(false)

    if (authError) {
      setError(
        authError === 'Invalid login credentials'
          ? 'Correo o contraseña incorrectos. Si no recuerdas tu contraseña, usa el enlace "¿Olvidaste tu contraseña?" debajo del campo de contraseña.'
          : authError,
      )
      return
    }

    goToDestination(userType)
  }

  const handleAdminAccess = async () => {
    setError('')
    setSuccess('')
    setSubmitting(true)

    const { error: signInError, userType } = await signIn(ADMIN_DEMO.email, ADMIN_DEMO.password)

    if (!signInError) {
      setSubmitting(false)
      goToDestination(userType)
      return
    }

    if (signInError !== 'Invalid login credentials') {
      setSubmitting(false)
      setError(signInError)
      return
    }

    const { error: signUpError, userType: createdType } = await signUp(
      ADMIN_DEMO.email,
      ADMIN_DEMO.password,
      ADMIN_DEMO.fullName,
      ADMIN_DEMO.userType,
    )

    if (signUpError) {
      setSubmitting(false)
      setError(signUpError)
      return
    }

    const { error: retryError, userType: retryType } = await signIn(
      ADMIN_DEMO.email,
      ADMIN_DEMO.password,
    )
    setSubmitting(false)

    if (retryError) {
      setSuccess('La cuenta administradora se creó en Supabase. Si el proveedor exige confirmación de email, revisa la bandeja antes de volver a entrar.')
      return
    }

    goToDestination(retryType ?? createdType)
  }

  const handlePasswordReset = async () => {
    if (!email.trim()) {
      setError('Ingresa tu correo electrónico para recuperar la contraseña.')
      return
    }

    setError('')
    setSuccess('')
    setSubmitting(true)
    const { error: resetError } = await resetPassword(email.trim())
    setSubmitting(false)

    if (resetError) {
      setError(resetError)
      return
    }

    setSuccess('Te enviamos un enlace de recuperación a tu correo electrónico.')
  }

  return (
    <main id="main-content" aria-labelledby="login-title" className="w-full py-0">
      <div className="grid min-h-[calc(100vh-10rem)] w-full overflow-hidden rounded-[1.75rem] border border-white/70 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.10)] lg:grid-cols-[1fr_1fr] xl:min-h-[calc(100vh-11rem)]">
        <aside className="relative isolate flex min-h-[22rem] flex-col justify-between overflow-hidden bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.28),_transparent_28%),linear-gradient(135deg,_#0b4f8a_0%,_#133d72_55%,_#0f5d9a_100%)] px-8 py-8 text-white sm:px-10 sm:py-10 lg:px-12 lg:py-12 xl:px-14 xl:py-14">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center opacity-12" aria-hidden="true" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-transparent to-black/15" aria-hidden="true" />

          <div className="relative flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full border border-white/30 bg-white/10">
              <span className="material-symbols-outlined text-[20px]">directions_bus</span>
            </div>
            <span className="text-lg font-bold tracking-tight">TransitUrbano</span>
          </div>

          <div className="relative max-w-2xl space-y-6 xl:space-y-8">
            <h1 id="login-title" className="max-w-2xl text-5xl font-black leading-[0.95] tracking-tight sm:text-6xl xl:text-7xl">
              Tu ciudad,
              <span className="block text-white/85">en movimiento.</span>
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-white/85 sm:text-base xl:text-lg">
              Gestiona rutas, monitorea el tráfico en tiempo real y optimiza la movilidad urbana con nuestra plataforma inteligente.
            </p>
          </div>

          <div className="relative rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm sm:p-5">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-[#78f0a4] text-[#0a5c2d]">
                <span className="material-symbols-outlined text-[20px]">bolt</span>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">Estado del sistema</p>
                <p className="text-sm text-white/90">Todas las rutas operando con normalidad.</p>
              </div>
            </div>
          </div>
        </aside>

        <article className="flex flex-col justify-center px-8 py-8 sm:px-10 lg:px-12 lg:py-12 xl:px-16">
          <div className="mx-auto w-full max-w-3xl">
            <div className="mb-8 space-y-2">
              <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Bienvenido de nuevo</h2>
              <p className="max-w-none text-sm leading-6 text-slate-600 sm:text-base">
                Ingresa tus credenciales para acceder al panel de control.
              </p>
            </div>

            <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50/80 p-4 text-sm text-slate-700">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-950">Acceso administrador demo</p>
                  <p className="mt-1 text-slate-600">
                    {ADMIN_DEMO.email} / {ADMIN_DEMO.password}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEmail(ADMIN_DEMO.email)
                      setPassword(ADMIN_DEMO.password)
                    }}
                    className="rounded-full border border-blue-200 bg-white px-4 py-2 font-semibold text-blue-700 transition-colors hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
                  >
                    Usar credenciales
                  </button>
                  <button
                    type="button"
                    onClick={handleAdminAccess}
                    disabled={submitting}
                    className="rounded-full bg-blue-700 px-4 py-2 font-semibold text-white transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? 'Preparando admin…' : 'Crear/entrar como admin'}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div
                id="login-error"
                className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
                role="alert"
                aria-live="polite"
              >
                {error}
              </div>
            )}

            {success && (
              <div
                className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
                role="status"
                aria-live="polite"
              >
                {success}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold uppercase tracking-[0.15em] text-slate-700">
                  Correo electrónico
                </label>
                <div className="flex min-h-14 items-center gap-3 rounded-2xl border border-slate-500 bg-white px-5 py-4 transition-colors focus-within:border-blue-700 focus-within:ring-4 focus-within:ring-blue-100">
                  <span className="material-symbols-outlined text-[22px] text-slate-500" aria-hidden="true">
                    mail
                  </span>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="operador@manta.gov.ec"
                    autoComplete="email"
                    aria-required="true"
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? 'login-error' : undefined}
                    className="w-full bg-transparent text-base text-slate-950 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <label
                    htmlFor="password"
                    className={`block text-sm font-semibold uppercase tracking-[0.15em] ${
                      error ? 'text-red-600' : 'text-slate-700'
                    }`}
                  >
                    Contraseña
                  </label>
                  <button
                    type="button"
                    onClick={handlePasswordReset}
                    className="text-sm font-semibold text-blue-700 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <div className={`flex min-h-14 items-center gap-3 rounded-2xl border bg-white px-5 py-4 transition-colors focus-within:ring-4 ${error ? 'border-red-500 ring-red-100 focus-within:border-red-500 focus-within:ring-red-100' : 'border-slate-500 focus-within:border-blue-700 focus-within:ring-blue-100'}`}>
                  <span className={`material-symbols-outlined text-[22px] ${error ? 'text-red-600' : 'text-slate-500'}`} aria-hidden="true">
                    lock
                  </span>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••••"
                    autoComplete="current-password"
                    aria-required="true"
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? 'login-error' : undefined}
                    className="w-full bg-transparent text-base text-slate-950 outline-none placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
                    aria-pressed={showPassword}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    <span className="material-symbols-outlined text-[22px]" aria-hidden="true">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                {error && (
                  <p className="flex items-center gap-2 text-sm font-medium text-red-600">
                    <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                      error
                    </span>
                    {error}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between gap-4">
                <label className="flex items-center gap-3 text-sm text-slate-700">
                  <input
                    id="remember"
                    type="checkbox"
                    checked
                    readOnly
                    className="size-4 rounded border-slate-300 text-blue-700 focus:ring-blue-700"
                    aria-label="Recordar sesión"
                  />
                  Recordar sesión
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                aria-busy={submitting}
                className="flex min-h-14 w-full items-center justify-center rounded-full bg-[#0e4f89] px-6 py-4 text-base font-semibold text-white shadow-sm transition-opacity hover:opacity-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Iniciando sesión…' : 'Iniciar sesión'}
              </button>

              <div className="relative flex items-center py-1">
                <div className="flex-grow border-t border-slate-300" />
                <span className="mx-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">o</span>
                <div className="flex-grow border-t border-slate-300" />
              </div>

              <button
                type="button"
                onClick={() => navigate('/')}
                className="flex w-full items-center justify-center rounded-full border border-blue-100 bg-slate-50 px-6 py-4 text-sm font-semibold text-[#0e4f89] transition-colors hover:bg-slate-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
              >
                Continuar como invitado
              </button>

              <div className="border-t border-slate-200 pt-4 text-center text-sm text-slate-600">
                ¿No tienes una cuenta?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="font-semibold text-blue-700 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
                >
                  Regístrate ahora
                </button>
              </div>

              <div className="flex flex-wrap justify-center gap-6 pt-2 text-xs text-slate-500">
                <span>Privacidad</span>
                <span>Términos</span>
                <span>Soporte Técnico</span>
              </div>
            </form>
          </div>
        </article>
      </div>
    </main>
  )
}

export default LoginPage
