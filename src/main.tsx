import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'lenis/dist/lenis.css'
import './index.css'
import App from './App.tsx'
import SmoothScroll from './components/common/SmoothScroll.tsx'
import ScrollProgress from './components/common/ScrollProgress.tsx'
import CustomCursor from './components/common/CustomCursor.tsx'
import Navigation from './components/navigation/Navigation.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SmoothScroll />
    <ScrollProgress />
    <Navigation />
    <CustomCursor />
    <App />
  </StrictMode>,
)
