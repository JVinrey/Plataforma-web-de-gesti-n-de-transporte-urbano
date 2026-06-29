import { useDocumentTitle } from '../hooks/use-document-title'
import { useAccessibilityStore } from '../stores/accessibility-store'

export default function HelpPage() {
  useDocumentTitle('Ayuda y soporte')
  const { preferences } = useAccessibilityStore()
  const lang = preferences.language as 'es' | 'en'

  const t = {
    es: {
      title: 'Ayuda y soporte',
      subtitle: 'Encuentra respuestas rápidas y contacta al equipo de Manta Transit.',
      sections: [
        {
          heading: 'Preguntas frecuentes',
          items: [
            { q: '¿Cómo planificar un viaje?', a: 'Ve a "Planificar viaje" en el menú lateral, ingresa tu origen y destino, y selecciona la mejor ruta.' },
            { q: '¿Cómo recargar mi billetera?', a: 'Accede a "Billetera" desde el menú, elige un monto y confirma la recarga.' },
            { q: '¿Cómo activar el modo adulto mayor?', a: 'En el menú de accesibilidad (botón azul, esquina inferior derecha), activa "Modo adulto mayor".' },
          ],
        },
        {
          heading: 'Contacto',
          items: [
            { q: 'Correo de soporte', a: 'soporte@mantatransit.gob.ec' },
            { q: 'Línea directa', a: '1800-TRANSIT (disponible lun–vie 7:00–19:00)' },
            { q: 'Oficinas', a: 'Av. 4 de Noviembre y Malecón, Manta, Manabí' },
          ],
        },
      ],
    },
    en: {
      title: 'Help & support',
      subtitle: 'Find quick answers and contact the Manta Transit team.',
      sections: [
        {
          heading: 'Frequently asked questions',
          items: [
            { q: 'How do I plan a trip?', a: 'Go to "Plan trip" in the sidebar, enter your origin and destination, and select the best route.' },
            { q: 'How do I top up my wallet?', a: 'Go to "Wallet" in the menu, choose an amount, and confirm the top-up.' },
            { q: 'How do I activate senior mode?', a: 'In the accessibility menu (blue button, bottom right), enable "Senior mode".' },
          ],
        },
        {
          heading: 'Contact',
          items: [
            { q: 'Support email', a: 'support@mantatransit.gob.ec' },
            { q: 'Direct line', a: '1800-TRANSIT (available Mon–Fri 7:00–19:00)' },
            { q: 'Offices', a: 'Av. 4 de Noviembre and Malecón, Manta, Manabí' },
          ],
        },
      ],
    },
  }[lang]

  return (
    <main id="main-content" className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold text-on-surface">{t.title}</h1>
      <p className="mt-2 text-base text-on-surface-variant">{t.subtitle}</p>

      {t.sections.map((section) => (
        <section key={section.heading} className="mt-8" aria-labelledby={`help-${section.heading}`}>
          <h2
            id={`help-${section.heading}`}
            className="mb-4 text-lg font-semibold text-on-surface"
          >
            {section.heading}
          </h2>
          <dl className="flex flex-col gap-4">
            {section.items.map((item) => (
              <div
                key={item.q}
                className="rounded-xl border border-outline-variant bg-surface-container-low px-5 py-4"
              >
                <dt className="font-semibold text-on-surface">{item.q}</dt>
                <dd className="mt-1 text-on-surface-variant">{item.a}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </main>
  )
}
