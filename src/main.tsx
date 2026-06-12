import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import {
  applyPreferencesToDocument,
  useAccessibilityStore,
} from './stores/accessibility-store'
import './index.css'

// Aplica las preferencias guardadas antes del primer render para evitar
// un parpadeo entre el estilo por defecto y el preferido por el usuario.
applyPreferencesToDocument(useAccessibilityStore.getState().preferences)

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
