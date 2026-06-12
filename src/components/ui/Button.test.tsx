import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './Button'

describe('Button', () => {
  it('renderiza con el texto correcto', () => {
    render(<Button>Buscar ruta</Button>)
    expect(screen.getByRole('button', { name: 'Buscar ruta' })).toBeInTheDocument()
  })

  it('ejecuta onClick al hacer clic', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Buscar</Button>)

    await user.click(screen.getByRole('button', { name: 'Buscar' }))

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('muestra el estado de carga deshabilitado y con aria-busy', () => {
    render(<Button isLoading>Enviando</Button>)

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByText('Cargando, espere…')).toBeInTheDocument()
  })

  it('expone los atributos aria correctos', () => {
    render(<Button aria-label="Buscar ruta desde origen hasta destino">Buscar</Button>)

    expect(
      screen.getByRole('button', { name: 'Buscar ruta desde origen hasta destino' }),
    ).toBeInTheDocument()
  })

  it('no dispara onClick cuando está cargando', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    render(
      <Button isLoading onClick={handleClick}>
        Enviando
      </Button>,
    )

    await user.click(screen.getByRole('button'))

    expect(handleClick).not.toHaveBeenCalled()
  })
})
