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
    setSubmitting(true)
    const { error: authError } = await signUp(email.trim(), password, fullName.trim())
    setSubmitting(false)

    if (authError) {
      setError(authError)
      return
    }

    // Tras registrarse, Supabase puede requerir confirmación por correo.
    navigate('/')
  }

  return (
    <section aria-labelledby="register-title" className="space-y-8">
      <div className="space-y-3">
        <h1 id="register-title" className="text-3xl font-bold text-gray-900 md:text-4xl">
          Crear cuenta
        </h1>
        <p className="max-w-2xl text-gray-700">
          Regístrate para guardar tus rutas frecuentes y preferencias de accesibilidad.
        </p>
      </div>

      <div className="max-w-xl">
        <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          {error && (
            <div
              className="mb-5 rounded-md border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800"
              role="alert"
              aria-live="polite"
            >
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <div>
              <label htmlFor="fullName" className="mb-2 block text-sm font-semibold text-gray-900">
                Nombre completo
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                autoComplete="name"
                aria-required="true"
                className="w-full rounded-md border border-gray-300 px-4 py-3 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-semibold text-gray-900">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                aria-required="true"
                className="w-full rounded-md border border-gray-300 px-4 py-3 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-semibold text-gray-900">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="new-password"
                  aria-required="true"
                  aria-describedby="password-hint"
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
              <p id="password-hint" className="mt-1 text-sm text-gray-600">
                Mínimo 6 caracteres.
              </p>
            </div>

            <div>
              <label htmlFor="confirm" className="mb-2 block text-sm font-semibold text-gray-900">
                Confirmar contraseña
              </label>
              <input
                id="confirm"
                type={showPassword ? 'text' : 'password'}
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                autoComplete="new-password"
                aria-required="true"
                className="w-full rounded-md border border-gray-300 px-4 py-3 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              aria-busy={submitting}
              className="w-full rounded-md bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Creando cuenta…' : 'Crear cuenta'}
            </button>

            <p className="text-center text-sm text-gray-700">
              ¿Ya tienes cuenta?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="rounded font-semibold text-blue-700 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-700"
              >
                Inicia sesión
              </button>
            </p>
          </form>
        </article>
      </div>
    </section>
  )
}

export default RegisterPage
