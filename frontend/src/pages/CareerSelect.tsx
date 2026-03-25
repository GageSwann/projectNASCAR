import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './CareerSelect.module.css'
import TeamCard from '../components/TeamCard'
import { Team } from '../types'
import { getActiveSlotId, loadSlot, saveSlot } from '../services/saveManager'
import { initializeStandings } from '../data/raceSim'

// Teams organized by series_id — matches database seed data
const ALL_TEAMS: Team[] = [
  // ---- TRUCK SERIES (series_id=1) ----
  { id: 1, series_id: 1, name: 'Ironhide Motorsports', founded_year: 2005, base_city: 'Mooresville, NC', budget: 8000000, reputation: 90, garage_rating: 88, headquarters: 'Mooresville, NC' },
  { id: 2, series_id: 1, name: 'Prairie Fire Racing', founded_year: 2008, base_city: 'Charlotte, NC', budget: 7500000, reputation: 87, garage_rating: 85, headquarters: 'Charlotte, NC' },
  { id: 3, series_id: 1, name: 'Gravel Road Motorsports', founded_year: 2003, base_city: 'Concord, NC', budget: 7200000, reputation: 85, garage_rating: 84, headquarters: 'Concord, NC' },
  { id: 4, series_id: 1, name: 'Longhorn Racing', founded_year: 2010, base_city: 'Fort Worth, TX', budget: 7000000, reputation: 83, garage_rating: 82, headquarters: 'Fort Worth, TX' },
  { id: 5, series_id: 1, name: 'Bison Motorsports', founded_year: 2012, base_city: 'Charlotte, NC', budget: 5500000, reputation: 70, garage_rating: 68, headquarters: 'Charlotte, NC' },
  { id: 6, series_id: 1, name: 'Ridgeline Racing', founded_year: 2011, base_city: 'Mooresville, NC', budget: 5200000, reputation: 68, garage_rating: 66, headquarters: 'Mooresville, NC' },
  { id: 7, series_id: 1, name: 'Stampede Motors', founded_year: 2014, base_city: 'Concord, NC', budget: 5000000, reputation: 66, garage_rating: 64, headquarters: 'Concord, NC' },
  { id: 8, series_id: 1, name: 'Bedrock Racing', founded_year: 2013, base_city: 'Charlotte, NC', budget: 4800000, reputation: 64, garage_rating: 62, headquarters: 'Charlotte, NC' },
  { id: 9, series_id: 1, name: 'Canyon Run Racing', founded_year: 2016, base_city: 'Mooresville, NC', budget: 3800000, reputation: 50, garage_rating: 50, headquarters: 'Mooresville, NC' },
  { id: 10, series_id: 1, name: 'Timberline Motorsports', founded_year: 2015, base_city: 'Charlotte, NC', budget: 3600000, reputation: 48, garage_rating: 48, headquarters: 'Charlotte, NC' },
  { id: 11, series_id: 1, name: 'Stone Bridge Racing', founded_year: 2017, base_city: 'Concord, NC', budget: 3400000, reputation: 46, garage_rating: 46, headquarters: 'Concord, NC' },
  { id: 12, series_id: 1, name: 'Trailhead Motors', founded_year: 2018, base_city: 'Charlotte, NC', budget: 3200000, reputation: 44, garage_rating: 44, headquarters: 'Charlotte, NC' },
  { id: 13, series_id: 1, name: 'Backwoods Racing', founded_year: 2019, base_city: 'Mooresville, NC', budget: 2500000, reputation: 30, garage_rating: 30, headquarters: 'Mooresville, NC' },
  { id: 14, series_id: 1, name: 'Gravel Pit Motorsports', founded_year: 2020, base_city: 'Charlotte, NC', budget: 2200000, reputation: 25, garage_rating: 25, headquarters: 'Charlotte, NC' },
  { id: 15, series_id: 1, name: 'Mudline Racing', founded_year: 2021, base_city: 'Concord, NC', budget: 2000000, reputation: 20, garage_rating: 20, headquarters: 'Concord, NC' },
  { id: 16, series_id: 1, name: 'Sawmill Racing', founded_year: 2022, base_city: 'Charlotte, NC', budget: 1800000, reputation: 15, garage_rating: 15, headquarters: 'Charlotte, NC' },
  { id: 17, series_id: 1, name: 'Dusty Trail Motors', founded_year: 2023, base_city: 'Mooresville, NC', budget: 1500000, reputation: 10, garage_rating: 10, headquarters: 'Mooresville, NC' },
  { id: 18, series_id: 1, name: 'Pothole Racing', founded_year: 2024, base_city: 'Concord, NC', budget: 1200000, reputation: 8, garage_rating: 8, headquarters: 'Concord, NC' },
  { id: 19, series_id: 1, name: 'Flatbed Motorsports', founded_year: 2024, base_city: 'Charlotte, NC', budget: 1000000, reputation: 5, garage_rating: 5, headquarters: 'Charlotte, NC' },
  { id: 20, series_id: 1, name: 'Rust Bucket Racing', founded_year: 2025, base_city: 'Mooresville, NC', budget: 800000, reputation: 3, garage_rating: 3, headquarters: 'Mooresville, NC' },
  // ---- O'REILLY SERIES (series_id=2) ----
  { id: 21, series_id: 2, name: 'Catalyst Motorsports', founded_year: 2005, base_city: 'Charlotte, NC', budget: 15000000, reputation: 92, garage_rating: 90, headquarters: 'Charlotte, NC' },
  { id: 22, series_id: 2, name: 'Pinnacle Racing', founded_year: 2001, base_city: 'Mooresville, NC', budget: 14500000, reputation: 90, garage_rating: 88, headquarters: 'Mooresville, NC' },
  { id: 23, series_id: 2, name: 'Summit Racing Corp', founded_year: 2002, base_city: 'Concord, NC', budget: 14000000, reputation: 88, garage_rating: 87, headquarters: 'Concord, NC' },
  { id: 24, series_id: 2, name: 'Momentum Racing', founded_year: 2008, base_city: 'Charlotte, NC', budget: 13500000, reputation: 86, garage_rating: 85, headquarters: 'Charlotte, NC' },
  { id: 25, series_id: 2, name: 'Frontier Motorsports', founded_year: 2007, base_city: 'Concord, NC', budget: 13000000, reputation: 84, garage_rating: 83, headquarters: 'Concord, NC' },
  { id: 26, series_id: 2, name: 'Aurora Motorsports', founded_year: 2009, base_city: 'Mooresville, NC', budget: 10000000, reputation: 72, garage_rating: 70, headquarters: 'Mooresville, NC' },
  { id: 27, series_id: 2, name: 'Nexus Racing', founded_year: 2011, base_city: 'Charlotte, NC', budget: 9500000, reputation: 70, garage_rating: 68, headquarters: 'Charlotte, NC' },
  { id: 28, series_id: 2, name: 'Paradigm Racing', founded_year: 2012, base_city: 'Concord, NC', budget: 9000000, reputation: 68, garage_rating: 66, headquarters: 'Concord, NC' },
  { id: 29, series_id: 2, name: 'Zenith Motorsports', founded_year: 2013, base_city: 'Charlotte, NC', budget: 8500000, reputation: 66, garage_rating: 64, headquarters: 'Charlotte, NC' },
  { id: 30, series_id: 2, name: 'Benchmark Racing', founded_year: 2010, base_city: 'Charlotte, NC', budget: 8000000, reputation: 64, garage_rating: 62, headquarters: 'Charlotte, NC' },
  { id: 31, series_id: 2, name: 'Ascent Racing', founded_year: 2015, base_city: 'Mooresville, NC', budget: 6500000, reputation: 50, garage_rating: 50, headquarters: 'Mooresville, NC' },
  { id: 32, series_id: 2, name: 'Forge Motorsports', founded_year: 2014, base_city: 'Charlotte, NC', budget: 6000000, reputation: 48, garage_rating: 48, headquarters: 'Charlotte, NC' },
  { id: 33, series_id: 2, name: 'Horizon Racing', founded_year: 2016, base_city: 'Concord, NC', budget: 5500000, reputation: 46, garage_rating: 46, headquarters: 'Concord, NC' },
  { id: 34, series_id: 2, name: 'Steel City Racing', founded_year: 2017, base_city: 'Charlotte, NC', budget: 5000000, reputation: 44, garage_rating: 44, headquarters: 'Charlotte, NC' },
  { id: 35, series_id: 2, name: 'Eclipse Motorsports', founded_year: 2018, base_city: 'Mooresville, NC', budget: 4800000, reputation: 42, garage_rating: 42, headquarters: 'Mooresville, NC' },
  { id: 36, series_id: 2, name: 'Crossroads Racing', founded_year: 2019, base_city: 'Charlotte, NC', budget: 4000000, reputation: 30, garage_rating: 30, headquarters: 'Charlotte, NC' },
  { id: 37, series_id: 2, name: 'Flint Motorsports', founded_year: 2020, base_city: 'Concord, NC', budget: 3500000, reputation: 25, garage_rating: 25, headquarters: 'Concord, NC' },
  { id: 38, series_id: 2, name: 'Cobalt Racing', founded_year: 2021, base_city: 'Charlotte, NC', budget: 3000000, reputation: 20, garage_rating: 20, headquarters: 'Charlotte, NC' },
  { id: 39, series_id: 2, name: 'Shale Motorsports', founded_year: 2022, base_city: 'Mooresville, NC', budget: 2500000, reputation: 15, garage_rating: 15, headquarters: 'Mooresville, NC' },
  { id: 40, series_id: 2, name: 'Ember Racing', founded_year: 2023, base_city: 'Charlotte, NC', budget: 2200000, reputation: 12, garage_rating: 12, headquarters: 'Charlotte, NC' },
  { id: 41, series_id: 2, name: 'Driftwood Motors', founded_year: 2023, base_city: 'Concord, NC', budget: 2000000, reputation: 10, garage_rating: 10, headquarters: 'Concord, NC' },
  { id: 42, series_id: 2, name: 'Tumble Run Racing', founded_year: 2024, base_city: 'Charlotte, NC', budget: 1800000, reputation: 8, garage_rating: 8, headquarters: 'Charlotte, NC' },
  { id: 43, series_id: 2, name: 'Matchstick Motorsports', founded_year: 2024, base_city: 'Mooresville, NC', budget: 1500000, reputation: 5, garage_rating: 5, headquarters: 'Mooresville, NC' },
  { id: 44, series_id: 2, name: 'Patchwork Racing', founded_year: 2025, base_city: 'Charlotte, NC', budget: 1200000, reputation: 3, garage_rating: 3, headquarters: 'Charlotte, NC' },
  { id: 45, series_id: 2, name: 'Burnout Racing', founded_year: 2025, base_city: 'Concord, NC', budget: 1000000, reputation: 1, garage_rating: 1, headquarters: 'Concord, NC' },
  // ---- CUP SERIES (series_id=3) ----
  { id: 46, series_id: 3, name: 'Velocity Racing', founded_year: 1995, base_city: 'Charlotte, NC', budget: 25000000, reputation: 95, garage_rating: 95, headquarters: 'Charlotte, NC' },
  { id: 47, series_id: 3, name: 'Legacy Motorsports', founded_year: 1988, base_city: 'Concord, NC', budget: 24000000, reputation: 93, garage_rating: 94, headquarters: 'Concord, NC' },
  { id: 48, series_id: 3, name: 'Elite Performance', founded_year: 2000, base_city: 'Charlotte, NC', budget: 23500000, reputation: 92, garage_rating: 93, headquarters: 'Charlotte, NC' },
  { id: 49, series_id: 3, name: 'Thunder Motors', founded_year: 1992, base_city: 'Mooresville, NC', budget: 23000000, reputation: 91, garage_rating: 91, headquarters: 'Mooresville, NC' },
  { id: 50, series_id: 3, name: 'Apex Racing', founded_year: 1998, base_city: 'Charlotte, NC', budget: 22500000, reputation: 90, garage_rating: 90, headquarters: 'Charlotte, NC' },
  { id: 51, series_id: 3, name: 'Overdrive Motorsports', founded_year: 2005, base_city: 'Charlotte, NC', budget: 18000000, reputation: 75, garage_rating: 78, headquarters: 'Charlotte, NC' },
  { id: 52, series_id: 3, name: 'Apex Grand Racing', founded_year: 2002, base_city: 'Concord, NC', budget: 17500000, reputation: 74, garage_rating: 76, headquarters: 'Concord, NC' },
  { id: 53, series_id: 3, name: 'Ironclad Motorsports', founded_year: 2001, base_city: 'Mooresville, NC', budget: 17000000, reputation: 73, garage_rating: 75, headquarters: 'Mooresville, NC' },
  { id: 54, series_id: 3, name: 'Titanium Racing', founded_year: 2008, base_city: 'Charlotte, NC', budget: 16500000, reputation: 72, garage_rating: 74, headquarters: 'Charlotte, NC' },
  { id: 55, series_id: 3, name: 'Vanguard Racing', founded_year: 2007, base_city: 'Concord, NC', budget: 16000000, reputation: 71, garage_rating: 72, headquarters: 'Concord, NC' },
  { id: 56, series_id: 3, name: 'Spectra Racing', founded_year: 2010, base_city: 'Charlotte, NC', budget: 12000000, reputation: 55, garage_rating: 58, headquarters: 'Charlotte, NC' },
  { id: 57, series_id: 3, name: 'Radiant Motorsports', founded_year: 2009, base_city: 'Mooresville, NC', budget: 11500000, reputation: 54, garage_rating: 57, headquarters: 'Mooresville, NC' },
  { id: 58, series_id: 3, name: 'Prism Racing', founded_year: 2011, base_city: 'Charlotte, NC', budget: 11000000, reputation: 53, garage_rating: 56, headquarters: 'Charlotte, NC' },
  { id: 59, series_id: 3, name: 'Meridian Racing', founded_year: 2012, base_city: 'Concord, NC', budget: 10500000, reputation: 52, garage_rating: 55, headquarters: 'Concord, NC' },
  { id: 60, series_id: 3, name: 'Equinox Motorsports', founded_year: 2013, base_city: 'Charlotte, NC', budget: 10000000, reputation: 51, garage_rating: 54, headquarters: 'Charlotte, NC' },
  { id: 61, series_id: 3, name: 'Wolfpack Racing', founded_year: 2015, base_city: 'Mooresville, NC', budget: 8500000, reputation: 40, garage_rating: 42, headquarters: 'Mooresville, NC' },
  { id: 62, series_id: 3, name: 'Torque Motorsports', founded_year: 2014, base_city: 'Charlotte, NC', budget: 8000000, reputation: 39, garage_rating: 41, headquarters: 'Charlotte, NC' },
  { id: 63, series_id: 3, name: 'Redline Racing', founded_year: 2016, base_city: 'Concord, NC', budget: 7500000, reputation: 38, garage_rating: 40, headquarters: 'Concord, NC' },
  { id: 64, series_id: 3, name: 'Carbon Fiber Racing', founded_year: 2017, base_city: 'Charlotte, NC', budget: 7000000, reputation: 37, garage_rating: 39, headquarters: 'Charlotte, NC' },
  { id: 65, series_id: 3, name: 'Titan Racing', founded_year: 2018, base_city: 'Mooresville, NC', budget: 6500000, reputation: 36, garage_rating: 38, headquarters: 'Mooresville, NC' },
  { id: 66, series_id: 3, name: 'Genesis Racing', founded_year: 2019, base_city: 'Charlotte, NC', budget: 5500000, reputation: 25, garage_rating: 28, headquarters: 'Charlotte, NC' },
  { id: 67, series_id: 3, name: 'Pioneer Motorsports', founded_year: 2020, base_city: 'Concord, NC', budget: 5000000, reputation: 20, garage_rating: 25, headquarters: 'Concord, NC' },
  { id: 68, series_id: 3, name: 'Bootstrap Racing', founded_year: 2021, base_city: 'Charlotte, NC', budget: 4500000, reputation: 15, garage_rating: 20, headquarters: 'Charlotte, NC' },
  { id: 69, series_id: 3, name: 'Rising Star Motors', founded_year: 2022, base_city: 'Mooresville, NC', budget: 4000000, reputation: 12, garage_rating: 18, headquarters: 'Mooresville, NC' },
  { id: 70, series_id: 3, name: 'Underdog Racing', founded_year: 2023, base_city: 'Charlotte, NC', budget: 3500000, reputation: 10, garage_rating: 15, headquarters: 'Charlotte, NC' },
  { id: 71, series_id: 3, name: 'Scrappy Racing', founded_year: 2024, base_city: 'Concord, NC', budget: 3000000, reputation: 8, garage_rating: 12, headquarters: 'Concord, NC' },
  { id: 72, series_id: 3, name: 'Grind House Racing', founded_year: 2025, base_city: 'Charlotte, NC', budget: 2500000, reputation: 5, garage_rating: 10, headquarters: 'Charlotte, NC' },
  { id: 73, series_id: 3, name: 'Raw Speed Motorsports', founded_year: 2024, base_city: 'Mooresville, NC', budget: 2000000, reputation: 3, garage_rating: 8, headquarters: 'Mooresville, NC' },
  { id: 74, series_id: 3, name: 'Last Chance Motors', founded_year: 2025, base_city: 'Charlotte, NC', budget: 1500000, reputation: 2, garage_rating: 5, headquarters: 'Charlotte, NC' },
  { id: 75, series_id: 3, name: 'Dream Chasers Racing', founded_year: 2025, base_city: 'Concord, NC', budget: 1000000, reputation: 1, garage_rating: 3, headquarters: 'Concord, NC' },
]

const formatBudget = (budget: number) => {
  if (budget >= 1000000) return `$${(budget / 1000000).toFixed(1)}M`
  return `$${budget.toLocaleString()}`
}

const CareerSelect: React.FC = () => {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [seriesName, setSeriesName] = useState('')
  const [seriesId, setSeriesId] = useState<number>(3)
  const [filter, setFilter] = useState<'all' | 'elite' | 'developing' | 'starter'>('all')
  const [error, setError] = useState('')
  const [toBack, setToBack] = useState(false)
  const backTimerRef = useRef<number | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const activeSlotId = getActiveSlotId()
    if (activeSlotId) {
      const slotData = loadSlot(activeSlotId)
      if (slotData?.selectedSeries) {
        setSeriesId(slotData.selectedSeries.id)
        setSeriesName(slotData.selectedSeries.name)
      }
    }
    return () => {
      if (backTimerRef.current !== null) window.clearTimeout(backTimerRef.current)
    }
  }, [])

  const seriesTeams = ALL_TEAMS.filter((t) => t.series_id === seriesId)

  const getFilteredTeams = () => {
    if (filter === 'all') return seriesTeams
    if (filter === 'elite') return seriesTeams.filter((t) => t.reputation >= 70)
    if (filter === 'developing') return seriesTeams.filter((t) => t.reputation >= 20 && t.reputation < 70)
    if (filter === 'starter') return seriesTeams.filter((t) => t.reputation < 20)
    return seriesTeams
  }

  const handleBackClick = () => {
    if (toBack) return
    setToBack(true)
    backTimerRef.current = window.setTimeout(() => navigate('/series-select'), 400)
  }

  const handleStartCareer = () => {
    if (!selectedTeam) {
      setError('Please select a team to begin your career!')
      return
    }

    const activeSlotId = getActiveSlotId()
    if (activeSlotId) {
      const slotData = loadSlot(activeSlotId)
      if (slotData) {
        slotData.selectedTeam = selectedTeam
        slotData.lastPlayedAt = new Date().toISOString()
        // Initialize standings with all drivers at 0 points
        const seriesId = slotData.selectedSeries?.id ?? 3
        slotData.standings = initializeStandings(seriesId, 0, 'TBD', selectedTeam.name)
        saveSlot(slotData)
      }
    }

    navigate('/game')
  }

  const filteredTeams = getFilteredTeams()

  return (
    <div className={`${styles.container} ${toBack ? styles.toBack : ''}`}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={handleBackClick}>
          ← Back
        </button>
        <div className={styles.headerText}>
          <h1 className={styles.title}>Select Your Team</h1>
          <p className={styles.subtitle}>
            {seriesName ? `${seriesName} — ` : ''}Choose a team and begin your journey
          </p>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.sidebar}>
          <div className={styles.filters}>
            <h3>Filter by Tier</h3>
            <button
              className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
              onClick={() => setFilter('all')}
            >
              All Teams ({seriesTeams.length})
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
                <span>Garage: {selectedTeam.garage_rating}/100</span>
                <span>Location: {selectedTeam.base_city}</span>
              </div>
            </div>
          )}

          {error && <div className={styles.error}>{error}</div>}

          <button
            className={styles.startButton}
            onClick={handleStartCareer}
            disabled={!selectedTeam}
          >
            Start Career →
          </button>
        </div>

        <div className={styles.grid}>
          {filteredTeams.length > 0 ? (
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
          )}
        </div>
      </div>
    </div>
  )
}

export default CareerSelect
