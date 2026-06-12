import { Link } from 'react-router-dom'
import { useDocumentTitle } from '../hooks/use-document-title'

export function NotFoundPage() {
  useDocumentTitle('Página no encontrada')

  return (
    <section aria-labelledby="notfound-title">
      <h1 id="notfound-title" className="text-3xl font-bold text-gray-900">
        Página no encontrada
      </h1>
      <p className="mt-3 text-gray-700">La dirección que buscas no existe o fue movida.</p>
      <Link
        to="/"
        className="mt-4 inline-block rounded-md bg-blue-700 px-4 py-2 text-white hover:bg-blue-800"
      >
        Volver al inicio
      </Link>
    </section>
  )
}
