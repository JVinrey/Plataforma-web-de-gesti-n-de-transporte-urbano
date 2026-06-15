import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDocumentTitle } from '../hooks/use-document-title'
import { useAuthStore } from '../stores/auth-store'

export function RegisterPage() {
  useDocumentTitle('Crear cuenta')

  const navigate = useNavigate()
  const signUp = useAuthStore((state) => state.signUp)

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!fullName.trim()) {
      setError('Ingresa tu nombre completo.')
      return
    }
    if (!email.trim()) {
      setError('Ingresa tu correo electrónico.')
      return
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setError('')
    setSuccess('')
    setSubmitting(true)
    const { error: authError } = await signUp(email.trim(), password, fullName.trim())
    setSubmitting(false)

    if (authError) {
      setError(authError)
      return
    }

    setSuccess('Cuenta creada. Revisa tu correo para confirmar el acceso si Supabase solicita verificación.')
    navigate('/login')
  }

  return (
    <section aria-labelledby="register-title" className="w-full py-0">
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
            <h1 id="register-title" className="max-w-2xl text-5xl font-black leading-[0.95] tracking-tight sm:text-6xl xl:text-7xl">
              Crea tu
              <span className="block text-white/85">cuenta ahora.</span>
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-white/85 sm:text-base xl:text-lg">
              Regístrate para guardar tus rutas frecuentes, sincronizar preferencias y acceder a todas las funciones de la plataforma.
            </p>
          </div>

          <div className="relative rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm sm:p-5">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-[#78f0a4] text-[#0a5c2d]">
                <span className="material-symbols-outlined text-[20px]">verified</span>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">Registro seguro</p>
                <p className="text-sm text-white/90">Tu cuenta se crea con soporte de Supabase Auth.</p>
              </div>
            </div>
          </div>
        </aside>

        <article className="flex flex-col justify-center px-8 py-8 sm:px-10 lg:px-12 lg:py-12 xl:px-16">
          <div className="mx-auto w-full max-w-3xl">
            <div className="mb-8 space-y-2">
              <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Regístrate</h2>
              <p className="max-w-none text-sm leading-6 text-slate-600 sm:text-base">
                Completa tus datos para crear la cuenta y acceder al sistema.
              </p>
            </div>

            {error && (
              <div
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
                <label htmlFor="fullName" className="block text-sm font-semibold uppercase tracking-[0.15em] text-slate-700">
                  Nombre completo
                </label>
                <div className="flex min-h-14 items-center gap-3 rounded-2xl border border-slate-300 bg-white px-5 py-4 transition-colors focus-within:border-blue-700 focus-within:ring-4 focus-within:ring-blue-100">
                  <span className="material-symbols-outlined text-[22px] text-slate-500" aria-hidden="true">
                    badge
                  </span>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    autoComplete="name"
                    aria-required="true"
                    className="w-full bg-transparent text-base text-slate-950 outline-none placeholder:text-slate-400"
                    placeholder="Ingresa tu nombre completo"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold uppercase tracking-[0.15em] text-slate-700">
                  Correo electrónico
                </label>
                <div className="flex min-h-14 items-center gap-3 rounded-2xl border border-slate-300 bg-white px-5 py-4 transition-colors focus-within:border-blue-700 focus-within:ring-4 focus-within:ring-blue-100">
                  <span className="material-symbols-outlined text-[22px] text-slate-500" aria-hidden="true">
                    mail
                  </span>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    aria-required="true"
                    className="w-full bg-transparent text-base text-slate-950 outline-none placeholder:text-slate-400"
                    placeholder="operador@manta.gov.ec"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-semibold uppercase tracking-[0.15em] text-slate-700">
                  Contraseña
                </label>
                <div className="flex min-h-14 items-center gap-3 rounded-2xl border border-slate-300 bg-white px-5 py-4 transition-colors focus-within:border-blue-700 focus-within:ring-4 focus-within:ring-blue-100">
                  <span className="material-symbols-outlined text-[22px] text-slate-500" aria-hidden="true">
                    lock
                  </span>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="new-password"
                    aria-required="true"
                    aria-describedby="password-hint"
                    className="w-full bg-transparent text-base text-slate-950 outline-none placeholder:text-slate-400"
                    placeholder="Mínimo 6 caracteres"
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
                <p id="password-hint" className="text-sm text-slate-500">
                  La contraseña debe tener al menos 6 caracteres.
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="confirm" className="block text-sm font-semibold uppercase tracking-[0.15em] text-slate-700">
                  Confirmar contraseña
                </label>
                <div className="flex min-h-14 items-center gap-3 rounded-2xl border border-slate-300 bg-white px-5 py-4 transition-colors focus-within:border-blue-700 focus-within:ring-4 focus-within:ring-blue-100">
                  <span className="material-symbols-outlined text-[22px] text-slate-500" aria-hidden="true">
                    lock_reset
                  </span>
                  <input
                    id="confirm"
                    type={showPassword ? 'text' : 'password'}
                    value={confirm}
                    onChange={(event) => setConfirm(event.target.value)}
                    autoComplete="new-password"
                    aria-required="true"
                    className="w-full bg-transparent text-base text-slate-950 outline-none placeholder:text-slate-400"
                    placeholder="Repite tu contraseña"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                aria-busy={submitting}
                className="flex min-h-14 w-full items-center justify-center rounded-full bg-[#0e4f89] px-6 py-4 text-base font-semibold text-white shadow-sm transition-opacity hover:opacity-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Creando cuenta…' : 'Crear cuenta'}
              </button>

              <div className="relative flex items-center py-1">
                <div className="flex-grow border-t border-slate-300" />
                <span className="mx-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">o</span>
                <div className="flex-grow border-t border-slate-300" />
              </div>

              <button
                type="button"
                onClick={() => navigate('/login')}
                className="flex w-full items-center justify-center rounded-full border border-blue-100 bg-slate-50 px-6 py-4 text-sm font-semibold text-[#0e4f89] transition-colors hover:bg-slate-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
              >
                Ya tengo cuenta
              </button>

              <div className="border-t border-slate-200 pt-4 text-center text-sm text-slate-600">
                ¿Quieres volver al inicio?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="font-semibold text-blue-700 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
                >
                  Ir al home
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
    </section>
  )
}

export default RegisterPage
