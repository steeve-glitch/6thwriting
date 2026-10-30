import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Fonts are bundled, not loaded from Google: a school network that blocks or
// stalls fonts.googleapis.com used to hang the page before it drew anything.
import '@fontsource/courier-prime/400.css'
import '@fontsource/courier-prime/400-italic.css'
import '@fontsource/courier-prime/700.css'
import '@fontsource/merriweather/300.css'
import '@fontsource/merriweather/300-italic.css'
import '@fontsource/merriweather/400.css'
import '@fontsource/merriweather/700.css'
import '@fontsource/patrick-hand/400.css'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
