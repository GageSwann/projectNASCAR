import React, { useMemo } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import styles from './Overview.module.css'
import { GameContext } from '../../types'
import { SCHEDULES } from '../../data/schedule'

const formatMoney = (n: number) => {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`
  return `$${n.toLocaleString()}`
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const Overview: React.FC = () => {
  const { saveData } = useOutletContext<GameContext>()
  const navigate = useNavigate()
  const team = saveData.selectedTeam!
  const seriesId = saveData.selectedSeries?.id ?? 3
  const seriesName = saveData.selectedSeries?.name ?? 'Cup Series'
  const week = saveData.currentWeek

  const schedule = SCHEDULES[seriesId] ?? SCHEDULES[3]
  const nextRace = schedule[Math.min(week - 1, schedule.length - 1)]
  const prevRace = week > 1 ? schedule[week - 2] : null

  const topStandings = useMemo(() => {
    const s = saveData.standings ?? []
    return s.slice(0, 5)
  }, [saveData.standings])

  return (
    <div className={styles.page}>
      <div className={styles.welcomeBar}>
        <div>
          <h1 className={styles.heading}>{team.name}</h1>
          <span className={styles.sub}>{seriesName} &mdash; Season {saveData.currentSeason}</span>
        </div>
        <div className={styles.funds}>
          <span className={styles.fundsLabel}>Available Funds</span>
          <span className={styles.fundsValue}>{formatMoney(saveData.money)}</span>
        </div>
      </div>

      {/* ---- Big Next Race box ---- */}
      <div className={styles.nextRace}>
        <div className={styles.nrFlag}>RACE DAY</div>
        <div className={styles.nrBody}>
          <span className={styles.nrRound}>Round {nextRace.round} of {schedule.length}</span>
          <h2 className={styles.nrName}>{nextRace.name}</h2>
          <span className={styles.nrTrack}>{nextRace.track}</span>
          <div className={styles.nrMeta}>
            <span>{formatDate(nextRace.date)}</span>
            <span>{nextRace.laps} Laps</span>
          </div>
        </div>
        <button className={styles.nrBtn} onClick={() => navigate('/game/race')}>Prepare &amp; Race</button>
      </div>

      {/* ---- Dashboard grid ---- */}
      <div className={styles.grid}>
        {/* Garage tile */}
        <button className={styles.tile} onClick={() => navigate('/game/garage')}>
          <span className={styles.tileIcon}>&#9881;</span>
          <h3 className={styles.tileTitle}>Garage</h3>
          <span className={styles.tileStat}>{saveData.chassis.length} chassis</span>
          <span className={styles.tileStat}>{saveData.inventory.filter(i => !i.chassisId).length} loose parts</span>
          <span className={styles.tileAction}>Open Garage &rarr;</span>
        </button>

        {/* Store tile */}
        <button className={styles.tile} onClick={() => navigate('/game/store')}>
          <span className={styles.tileIcon}>&#9733;</span>
          <h3 className={styles.tileTitle}>Parts Store</h3>
          <span className={styles.tileStat}>32 items available</span>
          <span className={styles.tileStat}>8 categories</span>
          <span className={styles.tileAction}>Browse Store &rarr;</span>
        </button>

        {/* Driver Rankings tile */}
        <div className={styles.rankingsTile}>
          <div className={styles.rankingsHeader}>
            <h3>Driver Standings</h3>
            <button className={styles.viewAll} onClick={() => navigate('/game/rankings')}>
              View All &rarr;
            </button>
          </div>
          <div className={styles.rankingsList}>
            {topStandings.length === 0 ? (
              <div className={styles.rankRow}>
                <span className={styles.rankName} style={{ color: 'var(--text-muted)' }}>No standings data</span>
              </div>
            ) : topStandings.map((s, i) => (
              <div key={s.driverId} className={`${styles.rankRow} ${s.isPlayer ? styles.playerRankRow : ''}`}>
                <span className={`${styles.rankPos} ${i === 0 ? styles.gold : i === 1 ? styles.silver : i === 2 ? styles.bronze : ''}`}>
                  {i + 1}
                </span>
                <div className={styles.rankInfo}>
                  <span className={styles.rankName}>{s.driverName}</span>
                  <span className={styles.rankTeam}>{s.teamName}</span>
                </div>
                <span className={styles.rankPts}>{s.points}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Team stats tile */}
        <div className={styles.statsTile}>
          <h3>Team Stats</h3>
          <div className={styles.statsRows}>
            <div className={styles.statsRow}>
              <span>Budget</span><strong>{formatMoney(team.budget)}</strong>
            </div>
            <div className={styles.statsRow}>
              <span>Reputation</span><strong>{team.reputation}/100</strong>
            </div>
            <div className={styles.statsRow}>
              <span>Garage Rating</span><strong>{team.garage_rating}/100</strong>
            </div>
            <div className={styles.statsRow}>
              <span>Championship Wins</span><strong>{saveData.totalChampionships}</strong>
            </div>
            <div className={styles.statsRow}>
              <span>Race Wins</span><strong>{saveData.totalWins}</strong>
            </div>
          </div>
        </div>

        {/* Season Progress tile */}
        <div className={styles.progressTile}>
          <h3>Season Progress</h3>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${((week - 1) / schedule.length) * 100}%` }} />
          </div>
          <span className={styles.progressText}>
            {week === 1 ? 'Season not started' : `${week - 1} of ${schedule.length} races complete`}
          </span>
          {prevRace && (
            <div className={styles.lastRace}>
              <span className={styles.lastLabel}>Last Race</span>
              <span className={styles.lastName}>{prevRace.name}</span>
            </div>
          )}
          <div className={styles.upNext}>
            <span className={styles.lastLabel}>Up Next</span>
            <span className={styles.lastName}>{nextRace.name}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Overview
