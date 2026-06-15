# Prompt: Correcciones WCAG 2.2 — Plataforma de Transporte Urbano

## Contexto

Eres un experto en accesibilidad web (WCAG 2.2 nivel AA). Este proyecto es una plataforma React 18 + Vite + TypeScript + Tailwind CSS que consume Supabase. Se identificaron **8 brechas concretas** respecto a una checklist WCAG evaluada. Debes implementarlas **todas** sin romper la lógica existente ni el diseño visual.

Lee los archivos antes de editarlos. Usa `Edit` para cambios puntuales y `Write` solo si necesitas crear un archivo nuevo. Al terminar cada corrección ejecuta `npm run lint` para verificar que no hay errores.

---

## CORRECCIÓN 1 — WCAG 1.4.11: Contraste no textual en bordes de inputs

**Problema:** Los campos de formulario usan `border-slate-300` (#cbd5e1) y `border-gray-300` (#d1d5db) sobre fondo blanco → ratio ~1.3:1. El criterio exige mínimo **3:1** para bordes de componentes UI.

**Archivos a modificar:**
- `src/pages/LoginPage.tsx`
- `src/pages/RegisterPage.tsx`
- `src/components/ui/Input.tsx`
- `src/components/layout/PassengerShell.tsx` (input de búsqueda)

**Qué hacer:**
1. En `LoginPage.tsx` y `RegisterPage.tsx`, reemplaza todas las clases `border-slate-300` que estén en wrappers de inputs (los `<div>` que envuelven `<input>`) por `border-slate-500`. Mantén `focus-within:border-blue-700` y el ring de foco tal cual.
2. En `Input.tsx`, aplica el mismo cambio en el `className` del elemento `<input>` o su wrapper.
3. En `PassengerShell.tsx`, el input de búsqueda no tiene borde explícito (usa `bg-surface-container`). Agrega `ring-1 ring-[#64748b]/60` al input de búsqueda para que el contorno del campo sea visible con suficiente contraste cuando no tiene foco.

**Nota:** `border-slate-500` = #64748b tiene ratio 5.9:1 contra blanco. No cambies los colores de `focus-within:border-blue-700` ni los estados de error `border-red-500`.

---

## CORRECCIÓN 2 — WCAG 1.4.13: Tooltips `title` no descartables

**Problema:** `AccessibilityContrastButton.tsx` y `AccessibilityLanguageButton.tsx` usan el atributo nativo HTML `title`, que genera tooltips del navegador que:
- No pueden descartarse con Escape mientras el cursor sigue encima
- No pueden recorrerse con el cursor (desaparecen)
- Violan WCAG 1.4.13

**Archivos a modificar:**
- `src/components/accessibility/AccessibilityContrastButton.tsx`
- `src/components/accessibility/AccessibilityLanguageButton.tsx`

**Qué hacer:**
1. Elimina el atributo `title` de ambos botones.
2. En cada componente, implementa un tooltip custom controlado con estado React:
   - Estado: `const [showTooltip, setShowTooltip] = useState(false)`
   - El botón ya tiene `aria-label` descriptivo → el tooltip es solo complementario visual.
   - Muestra el tooltip en `onMouseEnter` y `onFocus`, ocúltalo en `onMouseLeave`, `onBlur`, y al presionar `Escape` (keydown listener local).
   - El tooltip debe ser un `<div role="tooltip" id="tooltip-contrast">` posicionado con `absolute` encima del botón.
   - El botón debe tener `aria-describedby="tooltip-contrast"` cuando el tooltip esté visible.
3. El tooltip debe tener `pointer-events: none` para no interceptar eventos del mouse.

**Ejemplo de estructura para AccessibilityContrastButton:**
```tsx
const [showTooltip, setShowTooltip] = useState(false)
const tooltipId = useId()

const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === 'Escape') setShowTooltip(false)
}

return (
  <div className="relative">
    {showTooltip && (
      <div
        role="tooltip"
        id={tooltipId}
        className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white"
      >
        {highContrast ? 'Alto contraste activado' : 'Alto contraste desactivado'}
      </div>
    )}
    <button
      ...atributos existentes...
      aria-describedby={showTooltip ? tooltipId : undefined}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onFocus={() => setShowTooltip(true)}
      onBlur={() => setShowTooltip(false)}
      onKeyDown={handleKeyDown}
    >
      ...contenido existente...
    </button>
  </div>
)
```
Aplica el mismo patrón a `AccessibilityLanguageButton.tsx`.

---

## CORRECCIÓN 3 — WCAG 2.4.11: Foco oculto bajo el FAB de accesibilidad

**Problema:** El botón de `AccessibilityMenu` tiene `fixed bottom-4 right-4 z-40`. Elementos interactivos en la esquina inferior derecha de cualquier página pueden quedar completamente cubiertos al recibir el foco, violando WCAG 2.4.11.

**Archivos a modificar:**
- `src/components/layout/PassengerShell.tsx`
- `src/components/layout/AppLayout.tsx`
- `src/components/layout/AdminShell.tsx`

**Qué hacer:**
En cada shell, agrega `pb-20` (80px de padding inferior) al elemento `<main>` o al contenedor scrolleable principal. Esto garantiza que ningún elemento enfocado quede tapado por el FAB de 64px × 64px (bottom-4 + altura del botón).

Ejemplo en `AppLayout.tsx`, el `<main>` existente:
```tsx
// Antes
<main id="main-content" tabIndex={-1} className={cn('flex-1', ...)}>

// Después
<main id="main-content" tabIndex={-1} className={cn('flex-1 pb-20', ...)}>
```

Aplica el mismo `pb-20` en `PassengerShell.tsx` al `<div>` con `className="flex flex-1 overflow-hidden"` → específicamente en el `<main id="main-content">` del Outlet, o en el div que contiene el Outlet.
En `AdminShell.tsx` busca el `<main>` con `id="main-content"` y agrégale `pb-20`.

---

## CORRECCIÓN 4 — WCAG 3.3.3: Mensaje de error sin sugerencia correctiva en Login

**Problema:** El error de login `"Correo o contraseña incorrectos."` no sugiere ninguna acción al usuario. WCAG 3.3.3 exige que si se conoce una sugerencia de corrección, debe mostrarse.

**Archivo:** `src/pages/LoginPage.tsx`

**Qué hacer:**
Localiza donde se asigna el mensaje de error de credenciales inválidas:
```tsx
// Línea actual (aprox):
setError(
  authError === 'Invalid login credentials'
    ? 'Correo o contraseña incorrectos.'
    : authError,
)
```

Cámbialo a:
```tsx
setError(
  authError === 'Invalid login credentials'
    ? 'Correo o contraseña incorrectos. Si no recuerdas tu contraseña, usa el enlace "¿Olvidaste tu contraseña?" debajo del campo de contraseña.'
    : authError,
)
```

Adicionalmente, en el `<div role="alert">` que muestra el error, agrega `aria-describedby` apuntando al campo de contraseña si el error es de credenciales. Esto ayuda a los lectores de pantalla a contextualizar el error.

---

## CORRECCIÓN 5 — WCAG 1.4.1: Color rojo incondicional en label de contraseña (LoginPage)

**Problema:** La etiqueta "Contraseña" en `LoginPage.tsx` tiene `text-red-600` **siempre**, no solo cuando hay error. El rojo se usa para señalar un estado de error que no existe, violando el uso semántico del color (WCAG 1.4.1).

**Archivo:** `src/pages/LoginPage.tsx`

**Qué hacer:**
Busca la línea donde la `<label htmlFor="password">` tiene `text-red-600` y cámbiala a condicional:

```tsx
// Antes (aprox. línea 242):
<label htmlFor="password" className="block text-sm font-semibold uppercase tracking-[0.15em] text-red-600">

// Después:
<label
  htmlFor="password"
  className={`block text-sm font-semibold uppercase tracking-[0.15em] ${
    error ? 'text-red-600' : 'text-slate-700'
  }`}
>
```

Igualmente, el ícono de candado junto al input tiene `text-red-600` de forma incondicional. Aplica la misma lógica condicional:
```tsx
// Antes:
<span className="material-symbols-outlined text-[22px] text-red-600" aria-hidden="true">lock</span>

// Después:
<span className={`material-symbols-outlined text-[22px] ${error ? 'text-red-600' : 'text-slate-500'}`} aria-hidden="true">lock</span>
```

---

## CORRECCIÓN 6 — WCAG 3.3.4: Sin confirmación antes de recarga de billetera (WalletPage)

**Problema:** La acción de recarga de saldo en `WalletPage.tsx` ejecuta la mutación directamente sin pedir confirmación. Para transacciones financieras WCAG 3.3.4 exige que el usuario pueda revisar y confirmar antes de que la acción sea irreversible.

**Archivo:** `src/pages/WalletPage.tsx`

**Qué hacer:**
1. Agrega un estado de confirmación: `const [pendingAmount, setPendingAmount] = useState<number | null>(null)`.
2. Cuando el usuario presione "Recargar", en lugar de ejecutar la mutación directamente, guarda el monto en `setPendingAmount(amount)` y muestra un modal/diálogo de confirmación.
3. El modal debe mostrar: monto seleccionado, y dos botones: "Confirmar recarga" (ejecuta la mutación) y "Cancelar" (limpia `pendingAmount`).
4. Usa el componente `Modal` existente en `src/components/ui/Modal.tsx` para el diálogo de confirmación.
5. El modal debe tener `role="dialog"`, `aria-labelledby` apuntando a su título y foco atrapado (el Modal existente ya lo hace).

**Estructura aproximada del modal:**
```tsx
{pendingAmount !== null && (
  <Modal
    isOpen
    onClose={() => setPendingAmount(null)}
    title="Confirmar recarga"
  >
    <p>¿Confirmar recarga de <strong>${pendingAmount.toFixed(2)}</strong> a tu billetera?</p>
    <div className="mt-4 flex gap-3 justify-end">
      <button onClick={() => setPendingAmount(null)} className="...">Cancelar</button>
      <button
        onClick={() => {
          topUp(pendingAmount)
          setPendingAmount(null)
        }}
        className="..."
      >
        Confirmar
      </button>
    </div>
  </Modal>
)}
```

---

## CORRECCIÓN 7 — WCAG 3.3.7: Verificar y arreglar pre-relleno de campos en TripPlannerPage

**Problema:** GuestHomePage navega a `/planificar-viaje?q=...` con origen y destino en la URL. Si `TripPlannerPage` no los lee y pre-rellena los inputs, el usuario debe reescribir la información → viola WCAG 3.3.7 (entrada redundante).

**Archivo:** `src/pages/TripPlannerPage.tsx`

**Qué hacer:**
1. Lee el archivo completo para verificar si ya consume `useSearchParams()` y pre-rellena el campo de destino con el valor de `q`.
2. Si ya lo hace: confirma que también aplica el valor al campo de origen si la URL tiene ambos params (`?origin=...&destination=...`). GuestHomePage envía: `/planificar-viaje?origin=...&destination=...` si ambos campos tienen valor, o `?q=...` si solo hay un término.
3. Si NO pre-rellena los campos con los valores de la URL: agrega la lectura de `useSearchParams()` e inicializa los estados de `origin` y `destination` con los valores del query string:
```tsx
const [searchParams] = useSearchParams()
const [origin, setOrigin] = useState(searchParams.get('origin') ?? '')
const [destination, setDestination] = useState(
  searchParams.get('destination') ?? searchParams.get('q') ?? ''
)
```
4. Verifica también que `GuestHomePage.tsx` navegue con ambos params separados cuando ambos campos tienen valor:
```tsx
// En GuestHomePage, la función que navega al planificador:
navigate(`/planificar-viaje?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`)
// (en lugar de un solo ?q=...)
```

---

## CORRECCIÓN 8 — WCAG 3.1.2: Idioma de las partes (lang en fragmentos bilingües)

**Problema:** Cuando el usuario cambia a inglés, `document.documentElement.lang` se actualiza a `"en"`, pero strings hardcodeadas en español que permanecen en la página (fuera del sistema `T = {es, en}`) no tienen `lang="es"`, haciendo que los lectores de pantalla las pronuncien con acento inglés.

**Archivos a revisar:** Todas las páginas en `src/pages/` y componentes en `src/components/`.

**Qué hacer:**
1. Busca en todos los `.tsx` cualquier texto visible hardcodeado que NO esté dentro de un objeto de traducción `T[lang].algo`. Ejemplos típicos: comentarios visibles, textos de fallback, breadcrumbs estáticos, etc.
2. Para cada fragmento de texto que esté en un idioma diferente al de la página actual, envuélvelo con el atributo `lang` correspondiente:
   ```tsx
   // Si el documento está en "en" pero el texto es español:
   <span lang="es">Plataforma de Transporte Urbano</span>
   
   // Si el documento está en "es" pero el texto es inglés:
   <span lang="en">Route Planner</span>
   ```
3. En particular, revisa `AccessibilityMenu.tsx`: el mensaje de atajos (`copy.shortcutHint`) ya usa i18n ✅. Verifica que la sección `{copy.currentLanguageLabel}` que muestra "Español" / "English" esté correctamente marcada.
4. En `GuestHomePage.tsx` verifica que no haya strings fijas en español que no provengan del objeto `T[lang]`.
5. En el `<footer>` de `AppLayout.tsx`, verifica que el texto del footer provenga de `copy.footer` (i18n) y no sea hardcodeado.

**Criterio de completitud:** Después de cambiar el idioma a EN, no debe quedar ningún texto visible en español sin `lang="es"` en su elemento o en un ancestro que no sea `<html>`.

---

## Verificación final

Después de implementar todas las correcciones, ejecuta en orden:

```bash
npm run lint          # Sin errores de ESLint
npm run build         # Build de producción exitoso
npm run test          # Tests existentes en verde
```

Adicionalmente, verifica manualmente:
1. Con Tab, navega por `LoginPage` → los bordes de los inputs deben ser visibles en todo momento (contraste ≥ 3:1).
2. Pasa el cursor sobre el botón de contraste en `AccessibilityMenu` → debe aparecer un tooltip custom; presiona Escape → el tooltip debe cerrarse sin mover el cursor.
3. Abre `WalletPage`, selecciona un monto y haz clic en recargar → debe aparecer un modal de confirmación antes de procesar.
4. En `LoginPage`, ingresa credenciales incorrectas → el mensaje de error debe sugerir usar "¿Olvidaste tu contraseña?".
5. En `LoginPage`, el label "Contraseña" y el ícono de candado deben aparecer en gris cuando no hay error, y en rojo solo después de un intento fallido.
6. En `GuestHomePage`, ingresa origen y destino y haz clic en "Buscar Ruta" → `TripPlannerPage` debe mostrar los campos pre-rellenos.
7. Cambia el idioma a inglés desde el menú de accesibilidad → no debe quedar texto en español sin atributo `lang="es"`.
8. Navega con Tab hasta el final de cualquier página → ningún elemento enfocado debe quedar tapado por el botón flotante de accesibilidad.
