import { Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/Header'
import LumaBar from './components/ui/futuristic-nav'
import Home from './pages/Home'
import Profile from './pages/Profile'
import Graph from './pages/Graph'
import FeaturesSection from './components/ui/features-section'
import NetworkFeatureSection from './components/ui/network-feature-section'
import FlickeringFooter from './components/ui/flickering-footer'

export default function App() {
  const location = useLocation()
  const isHomePage = location.pathname === '/'

  return (
    <div className="min-h-screen bg-[var(--color-surface)] flex flex-col transition-colors duration-300 overflow-x-hidden">
      <Header />
      <main className="flex-1 overflow-x-hidden pb-24 sm:pb-0">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile/:name" element={<Profile />} />
          <Route path="/graph" element={<Graph />} />
        </Routes>
      </main>
      {isHomePage && <FeaturesSection />}
      {isHomePage && <NetworkFeatureSection />}
      <FlickeringFooter />
      <LumaBar />
    </div>
  )
}
