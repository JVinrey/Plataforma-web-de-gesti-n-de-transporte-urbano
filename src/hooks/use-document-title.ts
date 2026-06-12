import { useEffect } from 'react'

const APP_NAME = 'Plataforma de Transporte Urbano'

/** Actualiza el título del documento (WCAG 2.4.2 Título de página). */
export function useDocumentTitle(title: string): void {
  useEffect(() => {
    document.title = `${title} — ${APP_NAME}`
  }, [title])
}
