#!/usr/bin/env node
/**
 * Auditoría de accesibilidad (axe-core)
 *
 * La auditoría automática se ejecuta en modo desarrollo: axe-core analiza el DOM
 * renderizado y reporta violaciones WCAG en la consola del navegador.
 *
 * Cómo auditar:
 *   1. `npm run dev` y abrir la app en el navegador.
 *   2. Revisar la consola: @axe-core/react reporta violaciones al renderizar.
 *   3. Complementar con auditoría manual: navegación por teclado (Tab, Enter,
 *      Escape), lector de pantalla (NVDA/VoiceOver) y verificación de contraste.
 *
 * Este script es un recordatorio/placeholder; la integración E2E con
 * axe-core + Playwright se agregará en una fase posterior.
 */

console.log('Auditoría de accesibilidad — axe-core')
console.log('')
console.log('La auditoría automática corre en modo dev (npm run dev):')
console.log('axe-core analiza la página y reporta violaciones WCAG en la consola del navegador.')
console.log('')
console.log('Checklist manual mínimo:')
console.log('  [ ] Navegable por teclado (Tab, Shift+Tab, Enter, Escape)')
console.log('  [ ] Imágenes con alt descriptivo')
console.log('  [ ] Contraste 4.5:1 (texto normal) / 3:1 (texto grande)')
console.log('  [ ] Formularios con label asociado')
console.log('  [ ] Estados dinámicos con aria-live')
