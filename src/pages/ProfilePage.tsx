import { useNavigate } from 'react-router-dom'
import { useDocumentTitle } from '../hooks/use-document-title'
import { useProfile } from '../hooks/use-profile'
import { useAuthStore } from '../stores/auth-store'

const USER_TYPE_LABELS: Record<string, string> = {
  comun: 'Usuario común',
  adulto_mayor: 'Adulto mayor',
  turista: 'Turista',
  operador: 'Operador',
  admin: 'Administrador',
}

export function ProfilePage() {
  useDocumentTitle('Mi perfil')

  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const loading = useAuthStore((state) => state.loading)
  const signOut = useAuthStore((state) => state.signOut)
  const { data: profile, isLoading: profileLoading } = useProfile()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  // Sin sesión: invitar a iniciar sesión.
  if (!loading && !user) {
    return (
      <section aria-labelledby="profile-title" className="space-y-4">
        <h1 id="profile-title" className="text-3xl font-bold text-gray-900">
          Mi perfil
        </h1>
        <p className="text-gray-700">Inicia sesión para ver y gestionar tu perfil.</p>
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="rounded-md bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2"
        >
          Iniciar sesión
        </button>
      </section>
    )
  }

  const isLoading = loading || profileLoading

  return (
    <section aria-labelledby="profile-title" className="space-y-6">
      <div className="space-y-2">
        <h1 id="profile-title" className="text-3xl font-bold text-gray-900">
          Mi perfil
        </h1>
        <p className="text-gray-700">Gestiona tus datos personales y preferencias de accesibilidad.</p>
      </div>

      {isLoading ? (
        <p className="text-gray-700" role="status" aria-live="polite">
          Cargando perfil…
        </p>
      ) : (
        <article className="max-w-xl space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-semibold uppercase tracking-wide text-gray-500">Nombre</dt>
              <dd className="mt-1 text-lg text-gray-900">
                {profile?.full_name || 'Sin nombre registrado'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                Correo electrónico
              </dt>
              <dd className="mt-1 text-lg text-gray-900">{profile?.email ?? user?.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                Tipo de usuario
              </dt>
              <dd className="mt-1 text-lg text-gray-900">
                {profile ? (USER_TYPE_LABELS[profile.user_type] ?? profile.user_type) : '—'}
              </dd>
            </div>
          </dl>

          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-md border border-gray-300 bg-white px-5 py-3 font-semibold text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2"
          >
            Cerrar sesión
          </button>
        </article>
      )}
    </section>
  )
}

export default ProfilePage
