import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/cormorant-unicase/400.css'
import '@fontsource/cormorant-unicase/600.css'
import '@fontsource/cormorant-unicase/700.css'
import '@fontsource/inria-sans/300.css'
import '@fontsource/inria-sans/400.css'
import '@fontsource/inria-sans/700.css'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
