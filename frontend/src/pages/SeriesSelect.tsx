import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './SeriesSelect.module.css'
import { Series } from '../types'
import { getActiveSlotId, loadSlot, saveSlot } from '../services/saveManager'

const SERIES_DATA: Series[] = [
  {
    id: 1,
    name: 'NASCAR Craftsman Truck Series',
    short_name: 'Trucks',
    tier: 1,
    num_races: 23,
    description: 'The entry-level national series. Lower budgets, fierce competition, and the proving ground for future stars.',
  },
  {
    id: 2,
    name: "O'Reilly Series",
    short_name: 'OReilly',
    tier: 2,
    num_races: 33,
    description: 'The stepping stone between Trucks and Cup. A mix of veterans and rising talent battling across 33 events.',
  },
  {
    id: 3,
    name: 'NASCAR Cup Series',
    short_name: 'Cup',
    tier: 3,
    num_races: 36,
    description: 'The pinnacle of stock car racing. The biggest teams, the most prestigious events, and the ultimate championship.',
  },
]

const TEAM_COUNTS: Record<number, number> = { 1: 20, 2: 25, 3: 30 }

const TIER_LABELS: Record<number, string> = {
  1: 'Entry Level',
  2: 'Mid Tier',
  3: 'Premier',
}

const SeriesSelect: React.FC = () => {
  const navigate = useNavigate()
  const [selected, setSelected] = useState<number | null>(null)
  const [toMenu, setToMenu] = useState(false)
  const backTimerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (backTimerRef.current !== null) window.clearTimeout(backTimerRef.current)
    }
  }, [])

  const handleBackClick = () => {
    if (toMenu) return
    setToMenu(true)
    backTimerRef.current = window.setTimeout(() => navigate('/new-career'), 400)
  }

  const handleContinue = () => {
    if (selected === null) return

    const slotId = getActiveSlotId()
    if (!slotId) return

    const slot = loadSlot(slotId)
    if (!slot) return

    const series = SERIES_DATA.find((s) => s.id === selected)
    if (!series) return

    slot.selectedSeries = series
    slot.lastPlayedAt = new Date().toISOString()
    saveSlot(slot)

    navigate('/game')
  }

  return (
    <div className={`${styles.container} ${toMenu ? styles.toMenu : ''}`}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={handleBackClick}>
          ← Back
        </button>
        <div className={styles.headerText}>
          <h1 className={styles.title}>Select Series</h1>
          <p className={styles.subtitle}>Choose which NASCAR series you want to compete in.</p>
        </div>
      </div>

      <div className={styles.seriesGrid}>
        {SERIES_DATA.map((series) => (
          <div
            key={series.id}
            className={`${styles.seriesCard} ${selected === series.id ? styles.selected : ''}`}
            onClick={() => setSelected(series.id)}
          >
            <span className={`${styles.tierBadge} ${styles[`tier${series.tier}`]}`}>
              {TIER_LABELS[series.tier]}
            </span>
            <h2 className={styles.seriesName}>{series.name}</h2>
            <span className={styles.seriesRaces}>{series.num_races} Races</span>
            <p className={styles.seriesDesc}>{series.description}</p>
            <span className={styles.seriesTeams}>{TEAM_COUNTS[series.id]} Teams</span>
          </div>
        ))}
      </div>

      <div className={styles.actions}>
        <button
          className={styles.continueBtn}
          disabled={selected === null}
          onClick={handleContinue}
        >
          Start Career →
        </button>
      </div>

      <div className={styles.footer}>
        <div>v0.1.0 - Pre-Alpha</div>
        <div>© Project Racing</div>
      </div>
    </div>
  )
}

export default SeriesSelect
