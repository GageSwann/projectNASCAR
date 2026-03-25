import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import { ThemeProvider } from './hooks/useTheme'
import MainMenu from './pages/MainMenu'
import CareerSelect from './pages/CareerSelect'
import Settings from './pages/Settings'
import LoadCareer from './pages/LoadCareer'
import OwnerCreation from './pages/OwnerCreation'
import SeriesSelect from './pages/SeriesSelect'
import GameLayout from './pages/GameLayout'
import Overview from './pages/game/Overview'
import Garage from './pages/game/Garage'
import Store from './pages/game/Store'
import Rankings from './pages/game/Rankings'
import PowerRankings from './pages/game/PowerRankings'
import Drivers from './pages/game/Drivers'
import Staff from './pages/game/Staff'
import RaceDay from './pages/game/RaceDay'
import Inventory from './pages/game/Inventory'
import Calendar from './pages/game/Calendar'
import OffSeason from './pages/game/OffSeason'

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="app">
          <div className="globalCheckeredFlag" aria-hidden="true">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="checkerboard-global" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                  <rect x="0" y="0" width="10" height="10" fill="white" />
                  <rect x="10" y="10" width="10" height="10" fill="white" />
                  <rect x="10" y="0" width="10" height="10" fill="black" />
                  <rect x="0" y="10" width="10" height="10" fill="black" />
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#checkerboard-global)" />
            </svg>
          </div>

          <div className="appContent">
            <Routes>
              <Route path="/" element={<MainMenu />} />
              <Route path="/new-career" element={<OwnerCreation />} />
              <Route path="/series-select" element={<SeriesSelect />} />
              <Route path="/careers" element={<CareerSelect />} />
              <Route path="/load-career" element={<LoadCareer />} />
              <Route path="/game" element={<GameLayout />}>
                <Route index element={<Overview />} />
                <Route path="garage" element={<Garage />} />
                <Route path="store" element={<Store />} />
                <Route path="inventory" element={<Inventory />} />
                <Route path="calendar" element={<Calendar />} />
                <Route path="rankings" element={<Rankings />} />
                <Route path="power-rankings" element={<PowerRankings />} />
                <Route path="drivers" element={<Drivers />} />
                <Route path="staff" element={<Staff />} />
                <Route path="race" element={<RaceDay />} />
                <Route path="offseason" element={<OffSeason />} />
              </Route>
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </div>
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App
