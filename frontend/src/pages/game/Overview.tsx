import React, { useMemo, useState, useRef, useEffect } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import styles from './Overview.module.css'
import { GameContext, OrgStats } from '../../types'
import { SCHEDULES } from '../../data/schedule'
import { getActiveSlotId, loadSlot, saveSlot } from '../../services/saveManager'
import { initializeStandings } from '../../data/raceSim'

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatDateLong(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T12:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

const Overview: React.FC = () => {
  const { saveData, refreshSave } = useOutletContext<GameContext>()
  const navigate = useNavigate()
  const team = saveData.selectedTeam!
  const seriesId = saveData.selectedSeries?.id ?? 3
  const seriesName = saveData.selectedSeries?.name ?? 'Cup Series'
  const currentDate = saveData.currentDate || '2026-01-01'

  const schedule = saveData.activeSchedule ?? SCHEDULES[seriesId] ?? SCHEDULES[3]

  // Initialize standings if empty (so they show all drivers at 0 points)
  React.useEffect(() => {
    if ((saveData.standings ?? []).length > 0) return
    if (!saveData.hiredDriver) return
    const slotId = getActiveSlotId()
    if (!slotId) return
    const data = loadSlot(slotId)
    if (!data) return
    if ((data.standings ?? []).length > 0) return

    const driverName = `${data.hiredDriver!.firstName} ${data.hiredDriver!.lastName}`
    data.standings = initializeStandings(
      seriesId,
      data.hiredDriver!.id,
      driverName,
      data.selectedTeam?.name ?? 'Player Team',
      data.carNumber || '1',
      data.selectedTeam?.manufacturer ?? 'Chevrolet',
    )
    data.lastPlayedAt = new Date().toISOString()
    saveSlot(data)
    refreshSave()
  }, [saveData.standings, saveData.hiredDriver, seriesId, refreshSave])

  // Find next upcoming race (first race whose date >= currentDate and hasn't been raced)
  const nextRace = useMemo(() => {
    const racedRounds = new Set((saveData.seasonResults ?? []).map(r => r.round))
    return schedule.find(r => r.date >= currentDate && !racedRounds.has(r.round)) ?? null
  }, [schedule, currentDate, saveData.seasonResults])

  // Find last completed race
  const lastRace = useMemo(() => {
    const results = saveData.seasonResults ?? []
    if (results.length === 0) return null
    const lastRound = results[results.length - 1].round
    return schedule.find(r => r.round === lastRound) ?? null
  }, [schedule, saveData.seasonResults])

  const pointsRaces = schedule.filter(r => !r.isExhibition)
  const completedRaces = (saveData.seasonResults ?? []).length
  const seasonOver = completedRaces >= pointsRaces.length && pointsRaces.length > 0

  // Days until next race
  const daysUntilNext = nextRace ? Math.ceil(
    (new Date(nextRace.date + 'T12:00:00').getTime() - new Date(currentDate + 'T12:00:00').getTime()) / 86400000
  ) : null

  // Is today a race day?
  const todayRace = schedule.find(r => r.date === currentDate)

  const topStandings = useMemo(() => {
    const s = saveData.standings ?? []
    return s.slice(0, 5)
  }, [saveData.standings])

  const topOwnerStandings = useMemo(() => {
    const s = saveData.ownerStandings ?? []
    return [...s].sort((a, b) => b.points - a.points || b.wins - a.wins).slice(0, 5)
  }, [saveData.ownerStandings])

  const orgStats: OrgStats = saveData.orgStats ?? {
    championshipWins: 0, raceWins: 0, top5s: 0, top10s: 0, poles: 0, races: 0, dnfs: 0,
  }

  // Sim menu
  const [simOpen, setSimOpen] = useState(false)
  const simRef = useRef<HTMLDivElement | null>(null)
  const [installedParts, setInstalledParts] = useState<string[]>([])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (simRef.current && !simRef.current.contains(e.target as Node)) {
        setSimOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Advance time helper
  const advanceTime = (days: number) => {
    const slotId = getActiveSlotId()
    if (!slotId) return
    const data = loadSlot(slotId)
    if (!data) return

    const completed: string[] = []
    let newDate = data.currentDate || '2026-01-01'
    for (let i = 0; i < days; i++) {
      newDate = addDays(newDate, 1)
      for (const ch of data.chassis) {
        for (const part of ch.installedParts) {
          if (part.installDaysLeft !== undefined && part.installDaysLeft > 0) {
            part.installDaysLeft--
            if (part.installDaysLeft === 0) {
              completed.push(`${part.item.name} installed on ${ch.name}`)
            }
          }
        }
      }
    }
    data.currentDate = newDate

    const sched = data.activeSchedule ?? SCHEDULES[data.selectedSeries?.id ?? 3] ?? SCHEDULES[3]
    const pRaces = sched.filter(r => !r.isExhibition)
    const cRounds = (data.seasonResults ?? []).length
    data.currentWeek = cRounds + 1

    if (data.seasonPhase === 'preseason') {
      const firstRace = sched[0]
      if (firstRace && newDate >= firstRace.date) {
        data.seasonPhase = 'regular'
      }
    }
    if (data.seasonPhase === 'regular' && cRounds >= pRaces.length) {
      data.seasonPhase = 'postseason'
    }

    data.lastPlayedAt = new Date().toISOString()
    saveSlot(data)
    refreshSave()

    if (completed.length > 0) {
      setInstalledParts(completed)
    }
  }

  const simToDate = (targetDate: string) => {
    const diff = Math.ceil(
      (new Date(targetDate + 'T12:00:00').getTime() - new Date(currentDate + 'T12:00:00').getTime()) / 86400000
    )
    if (diff > 0) advanceTime(diff)
  }

  const handleSimOption = (option: string) => {
    setSimOpen(false)
    if (option === 'day') advanceTime(1)
    else if (option === 'week') advanceTime(7)
    else if (option === 'nextrace' && nextRace) simToDate(nextRace.date)
    else if (option === 'endseason') {
      const lastScheduledRace = [...schedule].reverse().find(r => r.date >= currentDate)
      if (lastScheduledRace) {
        const dayAfterLast = addDays(lastScheduledRace.date, 1)
        simToDate(dayAfterLast)
      }
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.welcomeBar}>
        <div>
          <h1 className={styles.heading}>{team.name}</h1>
          <span className={styles.sub}>{seriesName} &mdash; {formatDateLong(currentDate)}</span>
        </div>
        <div className={styles.simDropdown} ref={simRef}>
          <button className={styles.simBtn} onClick={() => setSimOpen(o => !o)}>
            Simulate ▼
          </button>
          {simOpen && (
            <div className={styles.simMenu}>
              <button className={styles.simOption} onClick={() => handleSimOption('day')}>Sim 1 Day</button>
              <button className={styles.simOption} onClick={() => handleSimOption('week')}>Sim 1 Week</button>
              {nextRace && (
                <button className={styles.simOption} onClick={() => handleSimOption('nextrace')}>
                  Sim to Next Race ({formatDate(nextRace.date)})
                </button>
              )}
              <button className={styles.simOption} onClick={() => handleSimOption('endseason')}>Sim to End of Season</button>
            </div>
          )}
        </div>
      </div>

      {/* ---- Big Next Race box ---- */}
      {seasonOver ? (
        <div className={styles.nextRace}>
          <div className={styles.nrFlag} style={{ background: '#4caf50' }}>SEASON COMPLETE</div>
          <div className={styles.nrBody}>
            <h2 className={styles.nrName}>All {pointsRaces.length} races finished!</h2>
            <span className={styles.nrTrack}>Head to Rankings to view final standings, or go to the Offseason to prepare for next year.</span>
          </div>
          <button className={styles.nrBtn} onClick={() => navigate('/game/offseason')}>Offseason →</button>
        </div>
      ) : todayRace ? (
        <div className={styles.nextRace}>
          <div className={styles.nrFlag}>RACE DAY</div>
          <div className={styles.nrBody}>
            {todayRace.isExhibition && <span className={styles.nrExhibition}>Exhibition Event</span>}
            <span className={styles.nrRound}>
              {todayRace.isExhibition ? 'Speedweeks' : `Round ${todayRace.round} of ${pointsRaces.length}`}
            </span>
            <h2 className={styles.nrName}>{todayRace.name}</h2>
            <span className={styles.nrTrack}>{todayRace.track}</span>
            <div className={styles.nrMeta}>
              <span>{formatDate(todayRace.date)}</span>
              <span>{todayRace.laps} Laps</span>
            </div>
          </div>
          <button className={styles.nrBtn} onClick={() => navigate('/game/race')}>Prepare &amp; Race</button>
        </div>
      ) : nextRace ? (
        <div className={styles.nextRace}>
          <div className={styles.nrFlag} style={{ background: 'var(--border-color)' }}>NEXT RACE</div>
          <div className={styles.nrBody}>
            {nextRace.isExhibition && <span className={styles.nrExhibition}>Exhibition Event</span>}
            <span className={styles.nrRound}>
              {nextRace.isExhibition ? 'Speedweeks' : `Round ${nextRace.round} of ${pointsRaces.length}`}
            </span>
            <h2 className={styles.nrName}>{nextRace.name}</h2>
            <span className={styles.nrTrack}>{nextRace.track}</span>
            <div className={styles.nrMeta}>
              <span>{formatDate(nextRace.date)}</span>
              <span>{nextRace.laps} Laps</span>
              {daysUntilNext !== null && <span>{daysUntilNext} day{daysUntilNext !== 1 ? 's' : ''} away</span>}
            </div>
          </div>
          <button className={styles.nrBtn} onClick={() => navigate('/game/calendar')}>View Calendar</button>
        </div>
      ) : null}

      {/* ---- Dashboard grid ---- */}
      <div className={styles.grid}>
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

        {/* Owner Standings tile */}
        <div className={styles.rankingsTile}>
          <div className={styles.rankingsHeader}>
            <h3>Owner Standings</h3>
            <button className={styles.viewAll} onClick={() => navigate('/game/rankings')}>
              View All &rarr;
            </button>
          </div>
          <div className={styles.rankingsList}>
            {topOwnerStandings.length === 0 ? (
              <div className={styles.rankRow}>
                <span className={styles.rankName} style={{ color: 'var(--text-muted)' }}>No standings data</span>
              </div>
            ) : topOwnerStandings.map((s, i) => (
              <div key={s.carNumber} className={`${styles.rankRow} ${s.isPlayer ? styles.playerRankRow : ''}`}>
                <span className={`${styles.rankPos} ${i === 0 ? styles.gold : i === 1 ? styles.silver : i === 2 ? styles.bronze : ''}`}>
                  {i + 1}
                </span>
                <div className={styles.rankInfo}>
                  <span className={styles.rankName}>#{s.carNumber} {s.teamName}</span>
                </div>
                <span className={styles.rankPts}>{s.points}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Organization Stats tile */}
        <div className={styles.statsTile}>
          <h3>Organization Stats</h3>
          <div className={styles.statsRows}>
            <div className={styles.statsRow}>
              <span>Championships</span><strong>{orgStats.championshipWins}</strong>
            </div>
            <div className={styles.statsRow}>
              <span>Race Wins</span><strong>{orgStats.raceWins}</strong>
            </div>
            <div className={styles.statsRow}>
              <span>Top 5s</span><strong>{orgStats.top5s}</strong>
            </div>
            <div className={styles.statsRow}>
              <span>Top 10s</span><strong>{orgStats.top10s}</strong>
            </div>
            <div className={styles.statsRow}>
              <span>Poles</span><strong>{orgStats.poles}</strong>
            </div>
            <div className={styles.statsRow}>
              <span>Races</span><strong>{orgStats.races}</strong>
            </div>
            <div className={styles.statsRow}>
              <span>DNFs</span><strong>{orgStats.dnfs}</strong>
            </div>
          </div>
        </div>

        {/* Season Progress tile */}
        <div className={styles.progressTile}>
          <h3>Season Progress</h3>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${(completedRaces / Math.max(pointsRaces.length, 1)) * 100}%` }} />
          </div>
          <span className={styles.progressText}>
            {completedRaces === 0 ? 'Season not started' : `${completedRaces} of ${pointsRaces.length} races complete`}
          </span>
          {lastRace && (
            <div className={styles.lastRace}>
              <span className={styles.lastLabel}>Last Race</span>
              <span className={styles.lastName}>{lastRace.name}</span>
            </div>
          )}
          {nextRace && (
            <div className={styles.upNext}>
              <span className={styles.lastLabel}>Up Next</span>
              <span className={styles.lastName}>{nextRace.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Part Installation Notification */}
      {installedParts.length > 0 && (
        <div className={styles.notifOverlay} onClick={() => setInstalledParts([])}>
          <div className={styles.notifModal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.notifTitle}>Parts Installed!</h3>
            <ul className={styles.notifList}>
              {installedParts.map((msg, i) => (
                <li key={i}>{msg}</li>
              ))}
            </ul>
            <button className={styles.notifBtn} onClick={() => setInstalledParts([])}>OK</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Overview
