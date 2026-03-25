import React, { useState, useEffect, useCallback } from 'react'
import { Outlet, NavLink, useNavigate, Navigate } from 'react-router-dom'
import styles from './GameLayout.module.css'
import { SaveSlotData, GameContext } from '../types'
import { getActiveSlotId, loadSlot } from '../services/saveManager'

const formatBudget = (budget: number) => {
  if (budget >= 1000000) return `$${(budget / 1000000).toFixed(1)}M`
  return `$${budget.toLocaleString()}`
}

const GameLayout: React.FC = () => {
  const [saveData, setSaveData] = useState<SaveSlotData | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const activeSlotId = getActiveSlotId()
    if (activeSlotId) {
      const data = loadSlot(activeSlotId)
      if (data) setSaveData(data)
    }
    setLoaded(true)
  }, [])

  const refreshSave = useCallback(() => {
    const activeSlotId = getActiveSlotId()
    if (activeSlotId) {
      const data = loadSlot(activeSlotId)
      if (data) setSaveData(data)
    }
  }, [])

  if (!loaded) return null

  if (!saveData?.selectedTeam) {
    return <Navigate to="/load-career" replace />
  }

  const team = saveData.selectedTeam
  const series = saveData.selectedSeries
  const ownerName = `${saveData.owner.firstName} ${saveData.owner.lastName}`

  return (
    <div className={styles.layout}>
      <aside className={`${styles.sidebar} ${sidebarOpen ? '' : styles.collapsed}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.teamBranding}>
            <h2 className={styles.teamName}>{team.name}</h2>
            {series && <span className={styles.seriesBadge}>{series.short_name}</span>}
          </div>
          <div className={styles.ownerLine}>{ownerName}</div>
          <div className={styles.moneyLine}>{formatBudget(saveData.money)}</div>
        </div>

        <nav className={styles.nav}>
          <NavLink
            to="/game"
            end
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navActive : ''}`}
          >
            <span className={styles.navIcon}>&#9632;</span>
            <span className={styles.navLabel}>Overview</span>
          </NavLink>
          <NavLink
            to="/game/garage"
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navActive : ''}`}
          >
            <span className={styles.navIcon}>&#9881;</span>
            <span className={styles.navLabel}>Garage</span>
          </NavLink>
          <NavLink
            to="/game/store"
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navActive : ''}`}
          >
            <span className={styles.navIcon}>&#9733;</span>
            <span className={styles.navLabel}>Store</span>
          </NavLink>
          <NavLink
            to="/game/inventory"
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navActive : ''}`}
          >
            <span className={styles.navIcon}>&#9776;</span>
            <span className={styles.navLabel}>Inventory</span>
          </NavLink>
          <NavLink
            to="/game/calendar"
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navActive : ''}`}
          >
            <span className={styles.navIcon}>&#128197;</span>
            <span className={styles.navLabel}>Calendar</span>
          </NavLink>
          <NavLink
            to="/game/rankings"
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navActive : ''}`}
          >
            <span className={styles.navIcon}>&#9650;</span>
            <span className={styles.navLabel}>Standings</span>
          </NavLink>
          <NavLink
            to="/game/power-rankings"
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navActive : ''}`}
          >
            <span className={styles.navIcon}>&#9889;</span>
            <span className={styles.navLabel}>Power Rankings</span>
          </NavLink>
          <NavLink
            to="/game/drivers"
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navActive : ''}`}
          >
            <span className={styles.navIcon}>&#9823;</span>
            <span className={styles.navLabel}>Drivers</span>
          </NavLink>
          <NavLink
            to="/game/staff"
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navActive : ''}`}
          >
            <span className={styles.navIcon}>&#9874;</span>
            <span className={styles.navLabel}>Staff</span>
          </NavLink>
          {(saveData.seasonPhase === 'postseason' || saveData.seasonPhase === 'offseason') && (
            <NavLink
              to="/game/offseason"
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navActive : ''}`}
            >
              <span className={styles.navIcon}>&#9879;</span>
              <span className={styles.navLabel}>Offseason</span>
            </NavLink>
          )}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.seasonInfo}>
            <span>Season {saveData.currentSeason}</span>
            <span>{saveData.currentDate
              ? new Date(saveData.currentDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : `Week ${saveData.currentWeek}/${series?.num_races ?? 36}`
            }</span>
          </div>
          <button className={styles.menuBtn} onClick={() => navigate('/')}>
            Main Menu
          </button>
        </div>
      </aside>

      <button
        className={styles.sidebarToggle}
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        {sidebarOpen ? '\u25C0' : '\u25B6'}
      </button>

      <main className={styles.main}>
        <Outlet context={{ saveData, refreshSave } satisfies GameContext} />
      </main>
    </div>
  )
}

export default GameLayout
