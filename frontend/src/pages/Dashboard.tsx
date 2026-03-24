import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Dashboard.module.css'
import { Team, Race, Driver } from '../types'

const Dashboard: React.FC = () => {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [playerName, setPlayerName] = useState('')
  const [currentWeek, setCurrentWeek] = useState(1)
  const [activeTab, setActiveTab] = useState<'overview' | 'drivers' | 'races' | 'budget'>('overview')
  const navigate = useNavigate()

  useEffect(() => {
    const team = localStorage.getItem('selectedTeam')
    const name = localStorage.getItem('playerName')
    if (team) setSelectedTeam(JSON.parse(team))
    if (name) setPlayerName(name)
  }, [])

  if (!selectedTeam) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <h2>No Career Selected</h2>
          <p>Start a new career to begin managing your team.</p>
          <button onClick={() => navigate('/careers')}>Start New Career</button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <h1>{selectedTeam.name}</h1>
            <p className={styles.playerName}>Team Owner: {playerName}</p>
          </div>
          <div className={styles.headerStats}>
            <div className={styles.stat}>
              <span className={styles.label}>Week</span>
              <span className={styles.value}>{currentWeek}/36</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.label}>Season</span>
              <span className={styles.value}>2026</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className={styles.tabNav}>
        <button 
          className={`${styles.tab} ${activeTab === 'overview' ? styles.active : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'drivers' ? styles.active : ''}`}
          onClick={() => setActiveTab('drivers')}
        >
          👥 Drivers
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'races' ? styles.active : ''}`}
          onClick={() => setActiveTab('races')}
        >
          🏁 Races
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'budget' ? styles.active : ''}`}
          onClick={() => setActiveTab('budget')}
        >
          💰 Budget
        </button>
      </div>

      {/* Main Content */}
      <div className={styles.content}>
        {activeTab === 'overview' && (
          <div className={styles.section}>
            <h2>Team Overview</h2>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <h3>Budget</h3>
                <p className={styles.statValue}>${(selectedTeam.budget / 1000000).toFixed(1)}M</p>
              </div>
              <div className={styles.statCard}>
                <h3>Reputation</h3>
                <p className={styles.statValue}>{selectedTeam.reputation}/100</p>
              </div>
              <div className={styles.statCard}>
                <h3>Garage Rating</h3>
                <p className={styles.statValue}>{selectedTeam.garage_rating}/100</p>
              </div>
              <div className={styles.statCard}>
                <h3>Founded</h3>
                <p className={styles.statValue}>{selectedTeam.founded_year}</p>
              </div>
            </div>

            <div className={styles.quickActions}>
              <h3>Quick Actions</h3>
              <div className={styles.actionGrid}>
                <button className={styles.actionBtn}>Prepare for Race</button>
                <button className={styles.actionBtn}>Manage Staff</button>
                <button className={styles.actionBtn}>Upgrade Garage</button>
                <button className={styles.actionBtn}>Driver Training</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'drivers' && (
          <div className={styles.section}>
            <h2>Driver Roster</h2>
            <div className={styles.driversList}>
              <p className={styles.placeholder}>Driver roster will be populated from database</p>
            </div>
          </div>
        )}

        {activeTab === 'races' && (
          <div className={styles.section}>
            <h2>2026 Season Calendar</h2>
            <div className={styles.racesList}>
              <p className={styles.placeholder}>Race schedule will be populated from database</p>
            </div>
          </div>
        )}

        {activeTab === 'budget' && (
          <div className={styles.section}>
            <h2>Budget Management</h2>
            <div className={styles.budgetInfo}>
              <p className={styles.placeholder}>Budget allocation system coming soon</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <button className={styles.menuBtn} onClick={() => navigate('/')}>
          Back to Menu
        </button>
      </div>
    </div>
  )
}

export default Dashboard
