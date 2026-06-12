import { useDocumentTitle } from '../hooks/use-document-title'

export function HomePage() {
  useDocumentTitle('Inicio')

  return (
    <section aria-labelledby="home-title">
      <h1 id="home-title" className="text-3xl font-bold text-gray-900">
        Plataforma de Transporte Urbano
      </h1>
      <p className="mt-3 max-w-prose text-gray-700">
        Busca rutas, sigue tu bus en tiempo real y paga de forma digital. Una plataforma pensada
        para todas las personas.
      </p>
    </section>
  )
}
