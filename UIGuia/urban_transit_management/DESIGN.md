---
name: Urban Transit Management
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#414750'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#727781'
  outline-variant: '#c1c7d1'
  surface-tint: '#1f619e'
  primary: '#00467b'
  on-primary: '#ffffff'
  primary-container: '#1b5e9b'
  on-primary-container: '#bad7ff'
  inverse-primary: '#a0c9ff'
  secondary: '#006d37'
  on-secondary: '#ffffff'
  secondary-container: '#6bfe9c'
  on-secondary-container: '#00743a'
  tertiary: '#623c00'
  on-tertiary: '#ffffff'
  tertiary-container: '#825100'
  on-tertiary-container: '#ffcb90'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d2e4ff'
  primary-fixed-dim: '#a0c9ff'
  on-primary-fixed: '#001c37'
  on-primary-fixed-variant: '#00497f'
  secondary-fixed: '#6bfe9c'
  secondary-fixed-dim: '#4ae183'
  on-secondary-fixed: '#00210c'
  on-secondary-fixed-variant: '#005228'
  tertiary-fixed: '#ffddb9'
  tertiary-fixed-dim: '#ffb961'
  on-tertiary-fixed: '#2b1700'
  on-tertiary-fixed-variant: '#663e00'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 57px
    fontWeight: '700'
    lineHeight: 64px
    letterSpacing: -0.25px
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  title-lg:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '500'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.5px
  label-md:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 32px
---

## Brand & Style
The design system is engineered for the complex, data-rich environment of urban transit management in Manta. It prioritizes clarity, speed of cognition, and professional reliability. Drawing heavily from the principles of Material Design 3, the visual language utilizes a structured hierarchy, ample white space, and a logical "card-based" architecture to organize real-time telemetry, route scheduling, and fleet status. 

The aesthetic is **Corporate / Modern**. It avoids unnecessary ornamentation to ensure that critical information—such as transit delays or fleet alerts—remains the focal point. The interface should feel like a high-precision tool: efficient, stable, and data-driven.

## Colors
The palette is rooted in a deep, institutional blue that conveys authority and trust. This is balanced by a vibrant green accent used for "active" or "successful" states, reflecting the efficiency of a well-oiled transit system. 

- **Primary (#1B5E9B):** Used for primary actions, navigation headers, and branding elements.
- **Secondary/Accent (#2ECC71):** Reserved for positive status indicators, "on-time" markers, and growth metrics.
- **Warning (#F39C12):** Specifically for maintenance alerts, minor delays, and cautionary data points.
- **Surface & Background:** Predominantly white (#FFFFFF) or very light gray (#F8FAFC) to ensure maximum legibility and a clean, airy feel.

## Typography
Inter is used exclusively to maintain a utilitarian and systematic appearance. The type scale is designed to handle dense data without sacrificing readability.

- **Headlines:** Use Semi-Bold weights to create a strong vertical rhythm.
- **Data Labels:** Use the `label-lg` and `label-md` roles for table headers, metadata, and status badges. These use slightly increased letter spacing and higher weights to ensure visibility at small sizes.
- **Body:** The default `body-md` is the workhorse for all descriptive text and form inputs.

## Layout & Spacing
The layout follows a **Fluid Grid** model with a base 4px/8px incremental system. 

- **Desktop:** 12-column grid with 24px gutters. Dashboard widgets and data cards typically span 3, 4, 6, or 12 columns.
- **Tablet:** 8-column grid with 16px gutters.
- **Mobile:** 4-column grid with 16px gutters and margins.

Content is organized into distinct cards to create a "layered" effect over the white background. Spacing between cards should be consistent (24px) to allow the "white space" to act as a visual separator, reducing the need for heavy borders.

## Elevation & Depth
In line with Material Design 3, this design system uses **Tonal Layers** and **Ambient Shadows** to communicate hierarchy.

- **Level 0 (Background):** Pure white (#FFFFFF). Used for the main canvas.
- **Level 1 (Cards/Surface):** Elevated by a very soft, diffused shadow (0px 1px 3px rgba(0,0,0,0.05)). This is the primary container for content.
- **Level 2 (Interaction/Hover):** Increased shadow depth (0px 4px 12px rgba(0,0,0,0.08)) to indicate interactivity.
- **Modals/Overlays:** Highest elevation with a semi-transparent backdrop blur to maintain focus on the task at hand.

Avoid using harsh borders; let the subtle shadows and slight shifts in surface color (using the primary color at 5-8% opacity for containers) define the boundaries.

## Shapes
The design system uses a **Rounded** (Level 2) shape language to balance the professional tone with a modern, approachable feel.

- **Buttons & Small Inputs:** 0.5rem (8px) radius.
- **Cards & Dashboard Widgets:** 1rem (16px) radius to create clear, distinct containers.
- **Chips/Status Badges:** Fully pill-shaped (rounded-full) to distinguish them from actionable buttons.

## Components
Consistent component behavior is vital for a data-driven transit platform.

- **Buttons:** 
  - *Primary:* Solid #1B5E9B with white text.
  - *Secondary:* Outlined with Primary color, or light blue tint background (#E8F0F8).
- **Cards:** White background, 1rem corner radius, Level 1 shadow. Cards should have a consistent internal padding of 24px (`lg`).
- **Status Chips:** Small, pill-shaped indicators. "On Time" uses a light green background with dark green text; "Delayed" uses a light orange background with dark orange text.
- **Input Fields:** Outlined style with a 0.5rem radius. The label should float or be positioned clearly above the field to ensure high scannability during fast data entry.
- **Data Tables:** Clean, borderless rows with subtle dividers (1px #E2E8F0). Use `label-lg` for headers and `body-md` for row content.
- **Navigation Rail:** For desktop, use a slim vertical rail to maximize horizontal space for maps and data tables.