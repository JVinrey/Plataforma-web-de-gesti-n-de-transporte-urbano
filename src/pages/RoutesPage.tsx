import { useDocumentTitle } from '../hooks/use-document-title'

export function RoutesPage() {
  useDocumentTitle('Búsqueda de rutas')

  return (
    <section aria-labelledby="routes-title">
      <h1 id="routes-title" className="text-3xl font-bold text-gray-900">
        Búsqueda de rutas
      </h1>
      <p className="mt-3 text-gray-700">
        Encuentra la mejor ruta entre tu origen y tu destino.
      </p>
    </section>
  )
}
