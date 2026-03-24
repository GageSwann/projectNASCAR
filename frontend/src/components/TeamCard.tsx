import React from 'react'
import styles from './TeamCard.module.css'
import { Team } from '../types'

interface TeamCardProps {
  team: Team
  isSelected?: boolean
  onSelect?: (team: Team) => void
}

const TeamCard: React.FC<TeamCardProps> = ({ team, isSelected = false, onSelect }) => {
  const getTierClass = (reputation: number) => {
    if (reputation >= 90) return 'elite'
    if (reputation >= 70) return 'midHigh'
    if (reputation >= 40) return 'mid'
    if (reputation >= 20) return 'midLow'
    return 'bottom'
  }

  const getTierName = (reputation: number) => {
    if (reputation >= 90) return 'Elite Tier'
    if (reputation >= 70) return 'Mid-High Tier'
    if (reputation >= 40) return 'Mid Tier'
    if (reputation >= 20) return 'Developing Tier'
    return 'Starter Tier'
  }

  const formatBudget = (budget: number) => {
    if (budget >= 1000000) {
      return `$${(budget / 1000000).toFixed(1)}M`
    }
    return `$${budget.toLocaleString()}`
  }

  return (
    <div
      className={`${styles.card} ${styles[getTierClass(team.reputation)]} ${isSelected ? styles.selected : ''}`}
      onClick={() => onSelect?.(team)}
    >
      <div className={styles.header}>
        <h3 className={styles.teamName}>{team.name}</h3>
        <span className={styles.tier}>{getTierName(team.reputation)}</span>
      </div>

      <div className={styles.stats}>
        <div className={styles.statItem}>
          <span className={styles.label}>Budget</span>
          <span className={styles.value}>{formatBudget(team.budget)}</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.label}>Reputation</span>
          <span className={styles.value}>{team.reputation}/100</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.label}>Garage</span>
          <span className={styles.value}>{team.garage_rating}/100</span>
        </div>
      </div>

      <div className={styles.location}>
        📍 {team.base_city}
      </div>

      {isSelected && (
        <div className={styles.selectedBadge}>✓ Selected</div>
      )}
    </div>
  )
}

export default TeamCard
