import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import GuestHomePage from './GuestHomePage'
import { useAccessibilityStore } from '../stores/accessibility-store'

vi.mock('../hooks/use-transit-data', () => ({
  useRoutes: () => ({ data: [] }),
  useStops: () => ({ data: [] }),
}))

vi.mock('../hooks/use-profile-data', () => ({
  useFavoriteRoutes: () => ({ data: [] }),
}))

beforeEach(() => {
  useAccessibilityStore.getState().resetPreferences()
})

describe('GuestHomePage', () => {
  it('muestra el video promocional con transcripcion y descripcion en espanol', () => {
    const { container } = render(
      <MemoryRouter>
        <GuestHomePage />
      </MemoryRouter>,
    )

    const video = screen.getByLabelText('Video promocional de Manta Transit')
    expect(video).toBeInTheDocument()
    expect(video).toHaveAttribute('controls')
    expect(video).toHaveAttribute('preload', 'metadata')
    expect(container.querySelector('track[srclang="es"]')).toBeInTheDocument()
    expect(container.querySelector('track[srclang="en"]')).toBeInTheDocument()

    expect(screen.getByText('Transcripción del video')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Manta no se detiene. Presentamos Manta Transit. Planifica tu viaje. Movilidad para todos. Tu ciudad en movimiento.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByText('Descripción visual')).toBeInTheDocument()
  })

  it('traduce la seccion promocional al ingles', () => {
    useAccessibilityStore.getState().setPreference('language', 'en')

    render(
      <MemoryRouter>
        <GuestHomePage />
      </MemoryRouter>,
    )

    expect(screen.getByText('Promotional video')).toBeInTheDocument()
    expect(screen.getByText('Meet Manta Transit')).toBeInTheDocument()
    expect(screen.getByText('Video transcript')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Manta does not stop. Introducing Manta Transit. Plan your trip. Mobility for everyone. Your city in motion.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByText('Visual description')).toBeInTheDocument()
  })
})
