import { useDocumentTitle } from '../hooks/use-document-title'

export function ProfilePage() {
  useDocumentTitle('Mi perfil')

  return (
    <section aria-labelledby="profile-title">
      <h1 id="profile-title" className="text-3xl font-bold text-gray-900">
        Mi perfil
      </h1>
      <p className="mt-3 text-gray-700">
        Gestiona tus datos personales y preferencias de accesibilidad.
      </p>
    </section>
  )
}
