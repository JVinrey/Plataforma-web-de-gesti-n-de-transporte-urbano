import { useParams } from 'react-router-dom'
import { useDocumentTitle } from '../hooks/use-document-title'

export function TripPage() {
  const { id } = useParams<{ id: string }>()
  useDocumentTitle('Seguimiento de viaje')

  return (
    <section aria-labelledby="trip-title">
      <h1 id="trip-title" className="text-3xl font-bold text-gray-900">
        Seguimiento de viaje
      </h1>
      <p className="mt-3 text-gray-700">
        Estado en tiempo real del viaje <span className="font-mono">{id}</span>.
      </p>
    </section>
  )
}
