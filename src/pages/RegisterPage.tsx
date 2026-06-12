import { useDocumentTitle } from '../hooks/use-document-title'

export function RegisterPage() {
  useDocumentTitle('Crear cuenta')

  return (
    <section aria-labelledby="register-title">
      <h1 id="register-title" className="text-3xl font-bold text-gray-900">
        Crear cuenta
      </h1>
      <p className="mt-3 text-gray-700">
        Regístrate para guardar tus rutas frecuentes y preferencias de accesibilidad.
      </p>
    </section>
  )
}
