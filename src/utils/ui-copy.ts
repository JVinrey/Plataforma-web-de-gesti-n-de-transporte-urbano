import type { Language } from '../types'

type NavItem = {
  to: string
  label: string
}

type LayoutCopy = {
  skipLink: string
  brand?: string
  mainNavLabel: string
  navItems: NavItem[]
  footer?: string
  authLabel?: string
  authItems?: NavItem[]
  searchPlaceholder?: string
  sidebarToggleOpen?: string
  sidebarToggleClose?: string
  homeLabel?: string
  languageLabel?: string
  loginLabel?: string
  registerLabel?: string
  assistantLabel?: string
  sidebarTitle?: string
  sidebarSubtitle?: string
  systemStateLabel?: string
  operationalLabel?: string
  loadingLabel?: string
  adminLabel?: string
  adminNavLabel?: string
  adminItems?: NavItem[]
}

type AccessibilityCopy = {
  title: string
  openLabel: string
  closeLabel: string
  languageButtonLabel: string
  contrastButtonLabel: string
  narratorLabel: string
  narratorAction: string
  textSizeLabel: string
  resetLabel: string
  currentLanguageLabel: string
  shortcutHint: string
  toggleLabels: {
    elderlyMode: string
    highContrast: string
    increasedSpacing: string
    dyslexiaFont: string
    reduceMotion: string
    narrator: string
  }
  textSizes: {
    small: string
    normal: string
    large: string
    xlarge: string
  }
}

type UiCopy = {
  appLayout: LayoutCopy
  passengerShell: LayoutCopy
  adminShell: LayoutCopy
  accessibilityMenu: AccessibilityCopy
}

export const UI_COPY: Record<Language, UiCopy> = {
  es: {
    appLayout: {
      skipLink: 'Ir al contenido principal',
      brand: 'Transporte Urbano',
      mainNavLabel: 'Navegación principal',
      navItems: [
        { to: '/', label: 'Inicio' },
        { to: '/rutas', label: 'Rutas' },
        { to: '/', label: 'Abrir app' },
        { to: '/perfil', label: 'Perfil' },
        { to: '/login', label: 'Iniciar sesión' },
      ],
      footer: 'Plataforma Web de Gestión de Transporte Urbano — accesible para todas las personas.',
    },
    passengerShell: {
      skipLink: 'Saltar al contenido principal',
      brand: 'Manta Transit',
      sidebarTitle: 'Manta Transit',
      sidebarSubtitle: 'Movilidad urbana',
      mainNavLabel: 'Navegación principal',
      navItems: [
        { to: '/', label: 'Inicio' },
        { to: '/planificar-viaje', label: 'Planificar viaje' },
        { to: '/rutas', label: 'Rutas' },
        { to: '/seguimiento-pago', label: 'Seguimiento' },
        { to: '/billetera', label: 'Billetera' },
        { to: '/alertas', label: 'Alertas' },
        { to: '/historial', label: 'Historial' },
      ],
      searchPlaceholder: 'Buscar rutas o paradas...',
      sidebarToggleOpen: 'Abrir sidebar',
      sidebarToggleClose: 'Cerrar sidebar',
      homeLabel: 'Ir al inicio',
      languageLabel: 'Cambiar idioma',
      loginLabel: 'Ingresar',
      registerLabel: 'Registrarse',
      assistantLabel: 'Asistente AI',
      systemStateLabel: 'Estado del sistema',
      operationalLabel: 'Operativo',
    },
    adminShell: {
      skipLink: 'Saltar al contenido principal',
      brand: 'Manta Transit',
      mainNavLabel: 'Navegación de administración',
      adminLabel: 'Panel de administración',
      adminNavLabel: 'Navegación de administración',
      adminItems: [
        { to: '/fleet', label: 'Panel de Flota' },
        { to: '/route-planning', label: 'Planificación de Rutas' },
        { to: '/schedules', label: 'Horarios' },
        { to: '/driver-performance', label: 'Desempeño de Conductores' },
      ],
      loadingLabel: 'Cargando panel de administración',
    },
    accessibilityMenu: {
      title: 'Accesibilidad',
      openLabel: 'Abrir menú de accesibilidad',
      closeLabel: 'Cerrar menú de accesibilidad',
      languageButtonLabel: 'Cambiar idioma',
      contrastButtonLabel: 'Cambiar contraste',
      narratorLabel: 'Narrador / texto a voz',
      narratorAction: 'Leer pantalla actual',
      textSizeLabel: 'Tamaño de texto',
      resetLabel: 'Restablecer valores',
      currentLanguageLabel: 'Idioma actual',
      shortcutHint: 'Atajos: Ctrl/Cmd + Alt + L para idioma y Ctrl/Cmd + Alt + C para contraste.',
      toggleLabels: {
        elderlyMode: 'Modo adulto mayor',
        highContrast: 'Alto contraste',
        increasedSpacing: 'Espaciado aumentado',
        dyslexiaFont: 'Fuente para dislexia',
        reduceMotion: 'Reducir animaciones',
        narrator: 'Narrador / texto a voz',
      },
      textSizes: {
        small: 'Pequeño',
        normal: 'Normal',
        large: 'Grande',
        xlarge: 'Extra grande',
      },
    },
  },
  en: {
    appLayout: {
      skipLink: 'Skip to main content',
      brand: 'Urban Transport',
      mainNavLabel: 'Main navigation',
      navItems: [
        { to: '/', label: 'Home' },
        { to: '/rutas', label: 'Routes' },
        { to: '/', label: 'Open app' },
        { to: '/perfil', label: 'Profile' },
        { to: '/login', label: 'Sign in' },
      ],
      footer: 'Urban Transport Management Web Platform - accessible for everyone.',
    },
    passengerShell: {
      skipLink: 'Skip to main content',
      brand: 'Manta Transit',
      sidebarTitle: 'Manta Transit',
      sidebarSubtitle: 'Urban mobility',
      mainNavLabel: 'Main navigation',
      navItems: [
        { to: '/', label: 'Home' },
        { to: '/planificar-viaje', label: 'Plan trip' },
        { to: '/rutas', label: 'Routes' },
        { to: '/seguimiento-pago', label: 'Tracking' },
        { to: '/billetera', label: 'Wallet' },
        { to: '/alertas', label: 'Alerts' },
        { to: '/historial', label: 'History' },
      ],
      searchPlaceholder: 'Search routes or stops...',
      sidebarToggleOpen: 'Open sidebar',
      sidebarToggleClose: 'Close sidebar',
      homeLabel: 'Go to home',
      languageLabel: 'Change language',
      loginLabel: 'Sign in',
      registerLabel: 'Register',
      assistantLabel: 'AI Assistant',
      systemStateLabel: 'System status',
      operationalLabel: 'Operational',
    },
    adminShell: {
      skipLink: 'Skip to main content',
      brand: 'Manta Transit',
      mainNavLabel: 'Administration navigation',
      adminLabel: 'Administration panel',
      adminNavLabel: 'Administration navigation',
      adminItems: [
        { to: '/fleet', label: 'Fleet panel' },
        { to: '/route-planning', label: 'Route planning' },
        { to: '/schedules', label: 'Schedules' },
        { to: '/driver-performance', label: 'Driver performance' },
      ],
      loadingLabel: 'Loading administration panel',
    },
    accessibilityMenu: {
      title: 'Accessibility',
      openLabel: 'Open accessibility menu',
      closeLabel: 'Close accessibility menu',
      languageButtonLabel: 'Change language',
      contrastButtonLabel: 'Toggle contrast',
      narratorLabel: 'Narrator / text to speech',
      narratorAction: 'Read current screen',
      textSizeLabel: 'Text size',
      resetLabel: 'Reset values',
      currentLanguageLabel: 'Current language',
      shortcutHint: 'Shortcuts: Ctrl/Cmd + Alt + L for language and Ctrl/Cmd + Alt + C for contrast.',
      toggleLabels: {
        elderlyMode: 'Senior mode',
        highContrast: 'High contrast',
        increasedSpacing: 'Increased spacing',
        dyslexiaFont: 'Dyslexia-friendly font',
        reduceMotion: 'Reduce motion',
        narrator: 'Narrator / text to speech',
      },
      textSizes: {
        small: 'Small',
        normal: 'Normal',
        large: 'Large',
        xlarge: 'Extra large',
      },
    },
  },
}

export function getUiCopy(language: Language): UiCopy {
  return UI_COPY[language]
}