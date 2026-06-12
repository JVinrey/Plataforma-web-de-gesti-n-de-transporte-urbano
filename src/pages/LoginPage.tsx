import { useDocumentTitle } from '../hooks/use-document-title'

export function LoginPage() {
  useDocumentTitle('Iniciar sesión')

  return (
    <section aria-labelledby="login-title">
      <h1 id="login-title" className="text-3xl font-bold text-gray-900">
        Iniciar sesión
      </h1>
      <p className="mt-3 text-gray-700">Accede a tu cuenta para planificar y pagar tus viajes.</p>
    </section>
  )
}
