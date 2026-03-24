import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import { ThemeProvider } from './hooks/useTheme'
import MainMenu from './pages/MainMenu'
import CareerSelect from './pages/CareerSelect'
import Dashboard from './pages/Dashboard'
import Settings from './pages/Settings'

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="app">
          <Routes>
            <Route path="/" element={<MainMenu />} />
            <Route path="/careers" element={<CareerSelect />} />
            <Route path="/game" element={<Dashboard />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App
