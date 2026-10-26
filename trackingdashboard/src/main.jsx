import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// "/" (and anything else) -> public marketing site, "/admin" -> dashboard login.
// Each side is loaded on demand so its global stylesheet never leaks into the other.
const isAdminPath = window.location.pathname.replace(/\/+$/, '') === '/admin'

async function bootstrap() {
  let App
  if (isAdminPath) {
    document.title = 'Track Inbound - Executive Telemetry Dashboard'
    await import('./index.css')
    App = (await import('./App.jsx')).default
  } else {
    await import('./marketing/marketing.css')
    App = (await import('./marketing/MarketingSite.jsx')).default
  }

  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

bootstrap()
