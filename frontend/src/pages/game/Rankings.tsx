import React, { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import styles from './Rankings.module.css'
import { GameContext } from '../../types'

const Rankings: React.FC = () => {
  const { saveData } = useOutletContext<GameContext>()
  const seriesName = saveData.selectedSeries?.name ?? 'Cup Series'
  const standings = saveData.standings ?? []
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const racesRun = (saveData.seasonResults ?? []).length

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Standings</h1>
      <p className={styles.sub}>{seriesName} &mdash; Season {saveData.currentSeason} &mdash; {racesRun} race{racesRun !== 1 ? 's' : ''} completed</p>

      {standings.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', marginTop: '2rem', textAlign: 'center' }}>
          No standings data. Select a team to initialize the field.
        </p>
      ) : (
        <div className={styles.table}>
          <div className={styles.tableHeader}>
            <span className={styles.colRank}>#</span>
            <span className={styles.colNum}>#</span>
            <span className={styles.colDriver}>Driver</span>
            <span className={styles.colTeam}>Team</span>
            <span className={styles.colMfr}>MFR</span>
            <span className={styles.colPts}>PTS</span>
            <span className={styles.colW}>W</span>
            <span className={styles.colT5}>T5</span>
            <span className={styles.colT10}>T10</span>
            <span className={styles.colAvg}>STG</span>
            <span className={styles.colAvg}>DNF</span>
          </div>

          {standings.map((entry, i) => {
            const rank = i + 1
            return (
              <div key={entry.driverId}>
                <button
                  className={`${styles.row} ${rank <= 3 ? styles.topThree : ''} ${entry.isPlayer ? styles.playerRow : ''} ${expandedId === entry.driverId ? styles.expanded : ''}`}
                  onClick={() => setExpandedId(expandedId === entry.driverId ? null : entry.driverId)}
                >
                  <span className={styles.colRank}>
                    <span className={`${styles.rankNum} ${rank === 1 ? styles.gold : rank === 2 ? styles.silver : rank === 3 ? styles.bronze : ''}`}>
                      {rank}
                    </span>
                  </span>
                  <span className={styles.colNum}>{entry.carNumber}</span>
                  <span className={styles.colDriver}>{entry.driverName}</span>
                  <span className={styles.colTeam}>{entry.teamName}</span>
                  <span className={styles.colMfr}>{entry.manufacturer}</span>
                  <span className={styles.colPts}>{entry.points}</span>
                  <span className={styles.colW}>{entry.wins}</span>
                  <span className={styles.colT5}>{entry.top5}</span>
                  <span className={styles.colT10}>{entry.top10}</span>
                  <span className={styles.colAvg}>{entry.stagePoints ?? 0}</span>
                  <span className={styles.colAvg}>{entry.dnfs}</span>
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Rankings
