# Plataforma Web de Gestión de Transporte Urbano

## Equipo
- Alonzo Vinces Joustin (Lead)
- Choez Suarez Johan
- Vinces Reyes Josue

## Stack técnico
- **Frontend:** React 18 + Vite + TypeScript
- **Styling:** Tailwind CSS
- **Backend/DB:** Supabase (Auth, Database, Realtime, Storage)
- **Routing:** React Router v6
- **Estado global:** Zustand
- **Mapas:** Leaflet + React-Leaflet
- **Testing:** Vitest + Testing Library
- **Linting:** ESLint + Prettier

## Estructura de carpetas
```
src/
├── assets/
├── components/
│   ├── ui/              # Componentes base reutilizables (accesibles por defecto)
│   ├── layout/          # Header, Footer, Sidebar
│   ├── map/             # Componentes de mapa y rutas
│   ├── accessibility/   # Menú de accesibilidad, controles WCAG
│   └── forms/           # Formularios accesibles
├── features/
│   ├── auth/            # Login, registro, perfil
│   ├── routes/          # Búsqueda y planificación de rutas
│   ├── tracking/        # Seguimiento en tiempo real
│   ├── payment/         # Pago digital y QR
│   └── feedback/        # Calificación y reportes
├── hooks/               # Custom hooks
├── lib/
│   └── supabase.ts      # Cliente Supabase
├── pages/               # Páginas por ruta
├── stores/              # Zustand stores
├── types/               # TypeScript interfaces
└── utils/               # Helpers y utilidades
```

## Usuarios del sistema
1. **Usuario común** — flujo completo, búsqueda, pago, seguimiento
2. **Adulto mayor** — modo simplificado, mayor contraste, texto grande, guía paso a paso
3. **Turista / usuario ocasional** — sin registro obligatorio, multiidioma, rutas simples

## Requisitos de accesibilidad (WCAG 2.2 — Nivel A + AA)
**OBLIGATORIO en todo componente nuevo:**

### Criterios transversales (todos deben cumplirlos)
- **1.3.1** Información y relaciones — usar HTML semántico (`<nav>`, `<main>`, `<button>`, etc.)
- **1.4.3** Contraste mínimo — ratio 4.5:1 para texto normal, 3:1 para texto grande
- **2.1.1** Teclado — toda funcionalidad operable sin ratón
- **4.1.2** Nombre, función, valor — `aria-label`, `role`, `aria-expanded`, etc. en componentes custom

### Reglas de código
```tsx
// ✅ CORRECTO
<button aria-label="Buscar ruta desde origen hasta destino">
  Buscar
</button>

// ❌ INCORRECTO
<div onClick={handleClick}>Buscar</div>

// ✅ Imágenes
<img src="mapa.png" alt="Mapa de la ruta 42 centro - norte" />

// ✅ Formularios
<label htmlFor="origen">Ciudad de origen</label>
<input id="origen" type="text" aria-required="true" />

// ✅ Errores
<span role="alert" aria-live="polite">
  {error}
</span>
```

### Menú de accesibilidad (feature obligatoria)
Debe existir un menú persistente con:
- [ ] Toggle alto contraste
- [ ] Tamaño de texto: pequeño / normal / grande / extra grande
- [ ] Espaciado de línea aumentado
- [ ] Dislexia-friendly font
- [ ] Reducir animaciones (`prefers-reduced-motion`)
- [ ] Narrador / texto a voz (básico)
- [ ] Idioma: ES / EN

Las preferencias se guardan en `localStorage` y en el perfil Supabase del usuario.

## Base de datos Supabase — tablas principales
```sql
users          -- perfil extendido (auth.users + preferencias)
routes         -- definición de rutas de transporte
stops          -- paradas con coordenadas y accesibilidad
vehicles       -- unidades con posición en tiempo real
trips          -- viajes planificados por usuario
payments       -- registros de pago
feedback       -- calificaciones y reportes
```

## Variables de entorno
```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

## Convenciones de código
- Componentes en PascalCase, archivos en kebab-case
- Un componente por archivo
- Props siempre tipadas con TypeScript interface
- Custom hooks con prefijo `use`
- Todos los componentes interactivos deben pasar: teclado, lector de pantalla y contraste

## Comandos
```bash
npm run dev          # Desarrollo
npm run build        # Build producción
npm run test         # Tests
npm run lint         # Lint
npm run a11y         # Auditoría accesibilidad (axe-core)
```

## Checklist antes de hacer commit
- [ ] El componente es navegable por teclado (Tab, Enter, Escape)
- [ ] Imágenes tienen `alt` descriptivo
- [ ] Colores cumplen ratio de contraste WCAG
- [ ] Formularios tienen `label` asociado
- [ ] Estados dinámicos usan `aria-live` donde aplica
- [ ] No hay `div` o `span` con `onClick` sin `role` apropiado
