import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './CareerSelect.module.css'
import TeamCard from '../components/TeamCard'
import { Team } from '../types'
import api from '../services/api'

const CareerSelect: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([])
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [playerName, setPlayerName] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'elite' | 'developing' | 'starter'>('all')
  const navigate = useNavigate()

  useEffect(() => {
    fetchTeams()
  }, [])

  const fetchTeams = async () => {
    try {
      setLoading(true)
      const response = await api.get('/teams')
      setTeams(response.data)
      setError('')
    } catch (err) {
      console.error('Failed to fetch teams:', err)
      setError('Failed to load teams. Please try again.')
      // Fallback to mock data if API fails
      setTeams(mockTeams)
    } finally {
      setLoading(false)
    }
  }

  const getFilteredTeams = () => {
    if (filter === 'all') return teams
    if (filter === 'elite') return teams.filter(t => t.reputation >= 70)
    if (filter === 'developing') return teams.filter(t => t.reputation >= 20 && t.reputation < 70)
    if (filter === 'starter') return teams.filter(t => t.reputation < 20)
    return teams
  }

  const handleStartCareer = () => {
    if (!selectedTeam) {
      setError('Please select a team to begin your career!')
      return
    }
    if (!playerName.trim()) {
      setError('Please enter your name!')
      return
    }
    
    // TODO: Call API to create career save
    localStorage.setItem('selectedTeam', JSON.stringify(selectedTeam))
    localStorage.setItem('playerName', playerName)
    navigate('/game')
  }

  const filteredTeams = getFilteredTeams()

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Select Your Starting Team</h1>
        <p className={styles.subtitle}>Choose a team and begin your journey as a NASCAR team owner</p>
      </div>

      <div className={styles.content}>
        <div className={styles.sidebar}>
          <div className={styles.playerInput}>
            <label htmlFor="playerName">Manager Name</label>
            <input
              id="playerName"
              type="text"
              placeholder="Enter your name..."
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.filters}>
            <h3>Filter by Tier</h3>
            <button
              className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
              onClick={() => setFilter('all')}
            >
              All Teams
            </button>
            <button
              className={`${styles.filterBtn} ${filter === 'elite' ? styles.active : ''}`}
              onClick={() => setFilter('elite')}
            >
              Elite Tier
            </button>
            <button
              className={`${styles.filterBtn} ${filter === 'developing' ? styles.active : ''}`}
              onClick={() => setFilter('developing')}
            >
              Developing
            </button>
            <button
              className={`${styles.filterBtn} ${filter === 'starter' ? styles.active : ''}`}
              onClick={() => setFilter('starter')}
            >
              Starter Challenge
            </button>
          </div>

          {selectedTeam && (
            <div className={styles.selectedInfo}>
              <h3>Selected Team</h3>
              <p className={styles.teamNameDisplay}>{selectedTeam.name}</p>
              <div className={styles.teamDetails}>
                <span>Budget: {formatBudget(selectedTeam.budget)}</span>
                <span>Reputation: {selectedTeam.reputation}/100</span>
                <span>Location: {selectedTeam.base_city}</span>
              </div>
            </div>
          )}

          {error && <div className={styles.error}>{error}</div>}

          <button
            className={styles.startButton}
            onClick={handleStartCareer}
            disabled={!selectedTeam || !playerName.trim()}
          >
            Start Career
          </button>

          <button
            className={styles.backButton}
            onClick={() => navigate('/')}
          >
            Back to Menu
          </button>
        </div>

        <div className={styles.grid}>
          {loading ? (
            <div className={styles.loading}>Loading teams...</div>
          ) : (
            filteredTeams.length > 0 ? (
              filteredTeams.map((team) => (
                <TeamCard
                  key={team.id}
                  team={team}
                  isSelected={selectedTeam?.id === team.id}
                  onSelect={setSelectedTeam}
                />
              ))
            ) : (
              <div className={styles.noTeams}>No teams found in this tier.</div>
            )
          )}
        </div>
      </div>
    </div>
  )
}

// Mock data for fallback
const mockTeams: Team[] = [
  {
    id: 1,
    name: 'Dream Chasers Racing',
    founded_year: 2025,
    base_city: 'Concord, NC',
    budget: 1000000,
    reputation: 1,
    garage_rating: 3,
    headquarters: 'Concord, NC'
  },
  {
    id: 2,
    name: 'Last Chance Motors',
    founded_year: 2025,
    base_city: 'Charlotte, NC',
    budget: 1500000,
    reputation: 2,
    garage_rating: 5,
    headquarters: 'Charlotte, NC'
  },
  {
    id: 3,
    name: 'Velocity Racing',
    founded_year: 1995,
    base_city: 'Charlotte, NC',
    budget: 25000000,
    reputation: 95,
    garage_rating: 95,
    headquarters: 'Charlotte, NC'
  }
]

const formatBudget = (budget: number) => {
  if (budget >= 1000000) {
    return `$${(budget / 1000000).toFixed(1)}M`
  }
  return `$${budget.toLocaleString()}`
}

export default CareerSelect
