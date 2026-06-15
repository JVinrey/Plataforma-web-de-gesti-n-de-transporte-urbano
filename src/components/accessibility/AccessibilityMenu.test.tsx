import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AccessibilityMenu } from './AccessibilityMenu'
import { useAccessibilityStore } from '../../stores/accessibility-store'

beforeEach(() => {
  useAccessibilityStore.getState().resetPreferences()
})

describe('AccessibilityMenu', () => {
  it('cambia idioma y contraste desde los botones del panel', async () => {
    const user = userEvent.setup()
    render(<AccessibilityMenu />)

    await user.click(screen.getByRole('button', { name: 'Abrir menú de accesibilidad' }))

    await user.click(screen.getByRole('button', { name: 'Cambiar idioma: inglés' }))
    expect(useAccessibilityStore.getState().preferences.language).toBe('en')

    await user.click(screen.getByRole('button', { name: 'Toggle contrast' }))
    expect(useAccessibilityStore.getState().preferences.highContrast).toBe(true)
  })

  it('activa idioma y contraste con atajos de teclado al estar en la página', async () => {
    const user = userEvent.setup()
    render(<AccessibilityMenu />)

    await user.keyboard('{Alt>}{Control>}{l}{/Control}{/Alt}')
    expect(useAccessibilityStore.getState().preferences.language).toBe('en')

    await user.keyboard('{Alt>}{Control>}{c}{/Control}{/Alt}')
    expect(useAccessibilityStore.getState().preferences.highContrast).toBe(true)
  })

  it('abre con Enter y cierra con Escape devolviendo el foco al botón', async () => {
    const user = userEvent.setup()
    render(<AccessibilityMenu />)

    const trigger = screen.getByRole('button', { name: 'Abrir menú de accesibilidad' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    trigger.focus()
    await user.keyboard('{Enter}')

    expect(screen.getByRole('dialog', { name: 'Accesibilidad' })).toBeInTheDocument()
    expect(trigger).toHaveAttribute('aria-expanded', 'true')

    await user.keyboard('{Escape}')

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it('atrapa el foco dentro del panel al navegar con Tab', async () => {
    const user = userEvent.setup()
    render(<AccessibilityMenu />)

    await user.click(screen.getByRole('button', { name: 'Abrir menú de accesibilidad' }))
    const dialog = screen.getByRole('dialog', { name: 'Accesibilidad' })

    // Más tabulaciones que elementos enfocables: el foco debe ciclar sin salir
    for (let i = 0; i < 15; i++) {
      await user.tab()
      expect(dialog.contains(document.activeElement)).toBe(true)
    }
  })
})
