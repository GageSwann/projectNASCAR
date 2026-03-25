import React, { useMemo } from 'react'
import { useOutletContext } from 'react-router-dom'
import styles from './PowerRankings.module.css'
import { GameContext, MarketDriver } from '../../types'
import { getAIField } from '../../data/raceSim'

interface PowerEntry {
  driverId: number
  driverName: string
  carNumber: string
  teamName: string
  manufacturer: string
  isPlayer: boolean
  talentScore: number
  carScore: number
  hotStreak: number
  composite: number
}

function computeTalentScore(d: MarketDriver): number {
  return d.pace * 0.30 + d.racecraft * 0.25 + d.consistency * 0.20 + d.intermediate * 0.08 + d.short_track * 0.07 + d.superspeedway * 0.05 + d.road_course * 0.05
}

function computeHotStreak(driverId: number, results: { driverResults: { driverId: number; finishPos: number; status: string }[] }[]): number {
  // Look at last 5 races — weight recent finishes heavily
  const recent = results.slice(-5)
  if (recent.length === 0) return 50

  let score = 0
  let count = 0
  for (let i = 0; i < recent.length; i++) {
    const r = recent[i].driverResults.find(dr => dr.driverId === driverId)
    if (!r) continue
    const weight = (i + 1) / recent.length // more recent = higher weight
    const fieldSize = recent[i].driverResults.length
    // Convert finish to 0-100 score (1st = 100, last = 0)
    const finScore = r.status !== 'running'
      ? Math.max(0, 20 - (fieldSize - r.finishPos))
      : ((fieldSize - r.finishPos) / Math.max(1, fieldSize - 1)) * 100
    score += finScore * weight
    count += weight
  }
  return count > 0 ? score / count : 50
}

const PowerRankings: React.FC = () => {
  const { saveData } = useOutletContext<GameContext>()
  const seriesId = saveData.selectedSeries?.id ?? 3
  const seriesName = saveData.selectedSeries?.name ?? 'Cup Series'
  const seasonResults = saveData.seasonResults ?? []

  const rankings = useMemo(() => {
    const aiField = getAIField(seriesId)
    const entries: PowerEntry[] = []

    // Player entry
    if (saveData.hiredDriver) {
      const d = saveData.hiredDriver
      const talentScore = computeTalentScore(d)
      // Car score from chassis stats (average of best chassis)
      const readyChassis = saveData.chassis.filter(c => c.status === 'ready')
      let carScore = 30
      if (readyChassis.length > 0) {
        const best = readyChassis.reduce((max, c) => {
          const s = c.base_speed + c.base_handling + c.base_reliability + c.base_aero
          return s > max ? s : max
        }, 0)
        carScore = best / 4
      }
      const hotStreak = computeHotStreak(d.id, seasonResults)
      const composite = talentScore * 0.45 + carScore * 0.25 + hotStreak * 0.30

      entries.push({
        driverId: d.id,
        driverName: `${d.firstName} ${d.lastName}`,
        carNumber: saveData.carNumber || '1',
        teamName: saveData.selectedTeam?.name ?? 'Player Team',
        manufacturer: saveData.selectedTeam?.manufacturer ?? 'Chevrolet',
        isPlayer: true,
        talentScore: Math.round(talentScore),
        carScore: Math.round(carScore),
        hotStreak: Math.round(hotStreak),
        composite: Math.round(composite),
      })
    }

    // AI entries
    for (const ai of aiField) {
      const d = ai.driver
      const talentScore = computeTalentScore(d)
      // AI car score correlates with team tier (from driver base strength)
      const base = d.pace * 0.30 + d.racecraft * 0.25 + d.consistency * 0.25 + d.intermediate * 0.10 + d.short_track * 0.05 + d.superspeedway * 0.05
      const carScore = base * 0.85 + 10
      const hotStreak = computeHotStreak(d.id, seasonResults)
      const composite = talentScore * 0.45 + carScore * 0.25 + hotStreak * 0.30

      entries.push({
        driverId: d.id,
        driverName: `${d.firstName} ${d.lastName}`,
        carNumber: ai.carNumber,
        teamName: ai.teamName,
        manufacturer: ai.manufacturer,
        isPlayer: false,
        talentScore: Math.round(talentScore),
        carScore: Math.round(carScore),
        hotStreak: Math.round(hotStreak),
        composite: Math.round(composite),
      })
    }

    entries.sort((a, b) => b.composite - a.composite)
    return entries
  }, [seriesId, saveData, seasonResults])

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Power Rankings</h1>
      <p className={styles.sub}>{seriesName} &mdash; Season {saveData.currentSeason}</p>
      <p className={styles.description}>
        Composite ranking based on driver talent (45%), car strength (25%), and recent performance (30%).
      </p>

      {rankings.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', marginTop: '2rem', textAlign: 'center' }}>
          No data available yet.
        </p>
      ) : (
        <div className={styles.table}>
          <div className={styles.tableHeader}>
            <span className={styles.colRank}>#</span>
            <span className={styles.colNum}>Car</span>
            <span className={styles.colDriver}>Driver</span>
            <span className={styles.colTeam}>Team</span>
            <span className={styles.colScore}>Talent</span>
            <span className={styles.colScore}>Car</span>
            <span className={styles.colScore}>Hot</span>
            <span className={styles.colComposite}>PWR</span>
          </div>

          {rankings.map((entry, i) => {
            const rank = i + 1
            return (
              <div
                key={entry.driverId}
                className={`${styles.row} ${rank <= 3 ? styles.topThree : ''} ${entry.isPlayer ? styles.playerRow : ''}`}
              >
                <span className={styles.colRank}>
                  <span className={`${styles.rankNum} ${rank === 1 ? styles.gold : rank === 2 ? styles.silver : rank === 3 ? styles.bronze : ''}`}>
                    {rank}
                  </span>
                </span>
                <span className={styles.colNum}>#{entry.carNumber}</span>
                <span className={styles.colDriver}>{entry.driverName}</span>
                <span className={styles.colTeam}>{entry.teamName}</span>
                <span className={styles.colScore}>{entry.talentScore}</span>
                <span className={styles.colScore}>{entry.carScore}</span>
                <span className={styles.colScore}>
                  <span className={`${styles.hotBadge} ${entry.hotStreak >= 70 ? styles.hotHigh : entry.hotStreak >= 40 ? styles.hotMid : styles.hotLow}`}>
                    {entry.hotStreak}
                  </span>
                </span>
                <span className={styles.colComposite}>{entry.composite}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default PowerRankings
