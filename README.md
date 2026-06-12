# Plataforma Web de Gestión de Transporte Urbano

Plataforma accesible (WCAG 2.2 — Nivel A + AA) para búsqueda de rutas, seguimiento de buses en
tiempo real, pago digital y reportes de usuarios.

## Equipo

- Alonzo Vinces Joustin (Lead)
- Choez Suarez Johan
- Vinces Reyes Josue

## Stack

- React + Vite + TypeScript
- Tailwind CSS
- Supabase (Auth, Database, Realtime, Storage)
- React Router · Zustand · TanStack Query
- Leaflet + React-Leaflet
- Vitest + Testing Library · axe-core

## Empezar

```bash
npm install
cp .env.example .env   # completar credenciales de Supabase
npm run dev
```

## Comandos

| Comando         | Descripción                        |
| --------------- | ---------------------------------- |
| `npm run dev`   | Servidor de desarrollo             |
| `npm run build` | Build de producción                |
| `npm run test`  | Tests (Vitest)                     |
| `npm run lint`  | Lint (ESLint)                      |
| `npm run a11y`  | Guía de auditoría de accesibilidad |

## Accesibilidad

Todo componente nuevo debe cumplir los criterios transversales definidos en `CLAUDE.md`:
HTML semántico (1.3.1), contraste mínimo (1.4.3), operable por teclado (2.1.1) y
nombre/función/valor en componentes custom (4.1.2). La app incluye un menú de accesibilidad
persistente (alto contraste, tamaño de texto, espaciado, fuente para dislexia, reducir
animaciones e idioma ES/EN) cuyas preferencias se guardan en `localStorage`.
