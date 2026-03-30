import React, { useMemo, useState, useRef, useEffect } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import styles from './Overview.module.css'
import { GameContext, OrgStats } from '../../types'
import { SCHEDULES } from '../../data/schedule'
import { getActiveSlotId, loadSlot, saveSlot } from '../../services/saveManager'
import { initializeStandings } from '../../data/raceSim'
import { getTrack } from '../../data/tracks'

type ServiceNotice = {
  installed: string[]
  uninstalled: string[]
}

const REQUIRED_PART_CATEGORIES = ['engine', 'suspension', 'aerodynamics', 'brakes', 'transmission'] as const
const REQUIRED_PIT_CREW_ROLES = ['tire_changer_front', 'tire_changer_rear', 'tire_carrier_front', 'tire_carrier_rear', 'jackman', 'gas_man'] as const

function isPartReadyForBuild(part: { item: { category: string }; installDaysLeft?: number; uninstallDaysLeft?: number }) {
  const installDone = part.installDaysLeft === undefined || part.installDaysLeft <= 0
  const notUninstalling = part.uninstallDaysLeft === undefined || part.uninstallDaysLeft <= 0
  return installDone && notUninstalling
}

function isPartActiveForRace(part: { installDaysLeft?: number; uninstallDaysLeft?: number }): boolean {
  const installDone = part.installDaysLeft === undefined || part.installDaysLeft <= 0
  const notUninstalling = part.uninstallDaysLeft === undefined || part.uninstallDaysLeft <= 0
  return installDone && notUninstalling
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatDateLong(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

function formatRate(value: number): string {
  return `${value.toFixed(1)}%`
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T12:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function raceEventKey(race: { date: string; name: string; track: string }) {
  return `${race.date}|${race.name}|${race.track}`
}

function getDuelNumber(race: { name: string }): 1 | 2 | null {
  if (race.name.startsWith('Duel 1')) return 1
  if (race.name.startsWith('Duel 2')) return 2
  return null
}

function formatTrackWithLocation(trackName: string): string {
  const track = getTrack(trackName)
  return track?.location ? `${trackName} • ${track.location}` : trackName
}

const Overview: React.FC = () => {
  const { saveData, refreshSave } = useOutletContext<GameContext>()
  const navigate = useNavigate()
  const team = saveData.selectedTeam!
  const seriesId = saveData.selectedSeries?.id ?? 3
  const seriesName = saveData.selectedSeries?.name ?? 'Cup Series'
  const currentDate = saveData.currentDate || '2026-01-01'

  const schedule = saveData.activeSchedule ?? SCHEDULES[seriesId] ?? SCHEDULES[3]
  const scheduleByDate = useMemo(() => {
    return [...schedule].sort((a, b) => a.date.localeCompare(b.date))
  }, [schedule])
  const completedRaceKeys = useMemo(() => {
    const keys = new Set<string>()
    const seasonResults = saveData.seasonResults ?? []
    const consumed = new Set<number>()

    for (const [idx, result] of seasonResults.entries()) {
      if (result.raceDate && result.raceName && result.raceTrack) {
        keys.add(`${result.raceDate}|${result.raceName}|${result.raceTrack}`)
        consumed.add(idx)
      }
    }

    const unresolvedCount = seasonResults.length - consumed.size
    if (unresolvedCount > 0) {
      const completedEvents = scheduleByDate.filter((race) => race.date <= currentDate)
      let remaining = unresolvedCount
      for (const race of completedEvents) {
        const key = raceEventKey(race)
        if (keys.has(key)) continue
        keys.add(key)
        remaining -= 1
        if (remaining <= 0) break
      }
    }

    return keys
  }, [saveData.seasonResults, scheduleByDate, currentDate])

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
    return scheduleByDate.find(r => r.date >= currentDate && !completedRaceKeys.has(raceEventKey(r))) ?? null
  }, [scheduleByDate, currentDate, completedRaceKeys])

  // Find last completed race
  const lastRace = useMemo(() => {
    return [...scheduleByDate]
      .filter((race) => !race.isExhibition)
      .reverse()
      .find((race) => completedRaceKeys.has(raceEventKey(race))) ?? null
  }, [scheduleByDate, completedRaceKeys])

  const pointsRaces = schedule.filter(r => !r.isExhibition)
  const completedRaces = useMemo(() => {
    return pointsRaces.filter((race) => completedRaceKeys.has(raceEventKey(race))).length
  }, [pointsRaces, completedRaceKeys])
  const seasonOver = completedRaces >= pointsRaces.length && pointsRaces.length > 0

  const upcomingRaces = useMemo(() => {
    return scheduleByDate
      .filter((race) => race.date >= currentDate && !completedRaceKeys.has(raceEventKey(race)))
      .filter((race) => race.name !== 'Daytona 500 Qualifying')
      .slice(0, 5)
  }, [scheduleByDate, currentDate, completedRaceKeys])

  // Days until next race
  const daysUntilNext = nextRace ? Math.ceil(
    (new Date(nextRace.date + 'T12:00:00').getTime() - new Date(currentDate + 'T12:00:00').getTime()) / 86400000
  ) : null

  // Is today a race day?
  const todayRace = useMemo(() => {
    const racesToday = scheduleByDate.filter(r => r.date === currentDate)
    if (racesToday.length === 0) return null

    const playerDriverId = saveData.hiredDriver?.id
    const playerDuel = playerDriverId
      ? (saveData.daytonaSpeedweeks?.qualifyingOrder.find((q) => q.driverId === playerDriverId)?.duel ?? null)
      : null
    if (playerDuel) {
      const duelRace = racesToday.find((r) => getDuelNumber(r) === playerDuel)
      if (duelRace) return duelRace
    }

    return racesToday.find((r) => !completedRaceKeys.has(raceEventKey(r))) ?? racesToday[0]
  }, [scheduleByDate, currentDate, saveData.hiredDriver, saveData.daytonaSpeedweeks, completedRaceKeys])

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
  const orgWinRate = orgStats.races > 0 ? (orgStats.raceWins / orgStats.races) * 100 : 0
  const orgTop10Rate = orgStats.races > 0 ? (orgStats.top10s / orgStats.races) * 100 : 0
  const orgDnfRate = orgStats.races > 0 ? (orgStats.dnfs / orgStats.races) * 100 : 0

  // Sim menu
  const [simOpen, setSimOpen] = useState(false)
  const simRef = useRef<HTMLDivElement | null>(null)
  const [serviceNotice, setServiceNotice] = useState<ServiceNotice | null>(null)
  const [showRacePrep, setShowRacePrep] = useState(false)

  const trackType = todayRace ? (getTrack(todayRace.track)?.type ?? 'intermediate') : null
  const hasDriver = !!saveData.hiredDriver
  const hasCrewChief = !!saveData.hiredCrewChief
  const hasSpotter = !!saveData.hiredSpotter
  const pitCrewRolesFilled = new Set((saveData.hiredPitCrew ?? []).map((member) => member.role))
  const hasFullPitCrew = REQUIRED_PIT_CREW_ROLES.every((role) => pitCrewRolesFilled.has(role))
  const raceReadyChassis = trackType
    ? saveData.chassis.find((ch) =>
      ch.carNumber === (saveData.carNumber || '1') &&
      ch.trackType === trackType &&
      ch.status === 'ready' &&
      REQUIRED_PART_CATEGORIES.every((category) =>
        ch.installedParts.some((part) => part.item.category === category && isPartActiveForRace(part))
      )
    )
    : null
  const hasAnyReadyChassis = saveData.chassis.some((ch) => ch.carNumber === (saveData.carNumber || '1') && ch.status === 'ready')
  const hasUnfinishedParts = !!raceReadyChassis?.installedParts.some(
    (part) => (part.installDaysLeft !== undefined && part.installDaysLeft > 0) || (part.uninstallDaysLeft !== undefined && part.uninstallDaysLeft > 0)
  )
  const hasRaceReadySetup = !!raceReadyChassis && !hasUnfinishedParts
  const prepReady = !!todayRace && hasRaceReadySetup && hasDriver && hasCrewChief && hasSpotter && hasFullPitCrew

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

    const completedInstalls: string[] = []
    const completedUninstalls: string[] = []
    let newDate = data.currentDate || '2026-01-01'
    for (let i = 0; i < days; i++) {
      newDate = addDays(newDate, 1)
      for (const ch of data.chassis) {
        const remainingParts = []
        for (const part of ch.installedParts) {
          if (part.installDaysLeft !== undefined && part.installDaysLeft > 0) {
            const previousInstallDays = part.installDaysLeft
            part.installDaysLeft--
            if (previousInstallDays > 0 && part.installDaysLeft === 0) {
              completedInstalls.push(`${part.item.name} on ${ch.name}`)
            }
          }

          if (part.uninstallDaysLeft !== undefined && part.uninstallDaysLeft > 0) {
            const previousUninstallDays = part.uninstallDaysLeft
            part.uninstallDaysLeft--
            if (part.uninstallDaysLeft <= 0) {
              if (previousUninstallDays > 0) {
                completedUninstalls.push(`${part.item.name} from ${ch.name}`)
              }
              data.inventory.push({
                ...part,
                chassisId: undefined,
                installStartDate: undefined,
                installDaysLeft: undefined,
                uninstallStartDate: undefined,
                uninstallDaysLeft: undefined,
              })
              continue
            }
          }

          remainingParts.push(part)
        }
        ch.installedParts = remainingParts

        if (ch.status !== 'damaged' && ch.status !== 'totaled') {
          const completeBuild = REQUIRED_PART_CATEGORIES.every((category) =>
            ch.installedParts.some((part) => part.item.category === category && isPartReadyForBuild(part))
          )
          ch.status = completeBuild ? 'ready' : 'building'
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

    if (completedInstalls.length > 0 || completedUninstalls.length > 0) {
      setServiceNotice({ installed: completedInstalls, uninstalled: completedUninstalls })
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
      const lastScheduledRace = [...scheduleByDate].reverse().find(r => r.date >= currentDate)
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
            <span className={styles.nrTrack}>{formatTrackWithLocation(todayRace.track)}</span>
            <div className={styles.nrMeta}>
              <span>{formatDate(todayRace.date)}</span>
              <span className={styles.nrSep} aria-hidden="true">&bull;</span>
              <span>{todayRace.laps} Laps</span>
            </div>
          </div>
          <button className={styles.nrBtn} onClick={() => setShowRacePrep(true)}>Prepare &amp; Race</button>
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
            <span className={styles.nrTrack}>{formatTrackWithLocation(nextRace.track)}</span>
            <div className={styles.nrMeta}>
              <span>{formatDate(nextRace.date)}</span>
              <span className={styles.nrSep} aria-hidden="true">&bull;</span>
              <span>{nextRace.laps} Laps</span>
              {daysUntilNext !== null && (
                <>
                  <span className={styles.nrSep} aria-hidden="true">&bull;</span>
                  <span>{daysUntilNext} day{daysUntilNext !== 1 ? 's' : ''} away</span>
                </>
              )}
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
          <div className={styles.statsHighlights}>
            <div className={styles.statsHighlight}>
              <span className={styles.statsHighlightLabel}>Win Rate</span>
              <strong className={styles.statsHighlightValue}>{formatRate(orgWinRate)}</strong>
            </div>
            <div className={styles.statsHighlight}>
              <span className={styles.statsHighlightLabel}>Top 10 Rate</span>
              <strong className={styles.statsHighlightValue}>{formatRate(orgTop10Rate)}</strong>
            </div>
            <div className={styles.statsHighlight}>
              <span className={styles.statsHighlightLabel}>DNF Rate</span>
              <strong className={styles.statsHighlightValue}>{formatRate(orgDnfRate)}</strong>
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
              <div className={styles.upNextList}>
                {upcomingRaces.map((race) => (
                  <div key={`${race.date}-${race.name}`} className={styles.upNextItem}>
                    <div className={styles.upNextMain}>
                      <span className={styles.upNextName}>{race.name}</span>
                      <span className={styles.upNextLocation}>{getTrack(race.track)?.location ?? race.track}</span>
                    </div>
                    <span className={styles.upNextDate}>{formatDate(race.date)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Garage Service Notification */}
      {showRacePrep && todayRace && (
        <div className={styles.notifOverlay} onClick={() => setShowRacePrep(false)}>
          <div className={styles.prepModal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.prepTitle}>Pre-Race Checklist</h3>
            <p className={styles.prepRace}>{todayRace.name} • {todayRace.track}</p>

            <div className={styles.prepList}>
              <div className={`${styles.prepRow} ${hasRaceReadySetup ? styles.prepGood : styles.prepBad}`}>
                <span>{hasRaceReadySetup ? '✓' : '✗'} Race Chassis Ready</span>
                <small>
                  {hasRaceReadySetup
                    ? `${raceReadyChassis?.name} is ready`
                    : hasAnyReadyChassis
                      ? `A chassis on #${saveData.carNumber || '1'} is ready, but not for this track type`
                      : `Build and equip a chassis on #${saveData.carNumber || '1'} first`}
                </small>
              </div>

              <div className={`${styles.prepRow} ${hasDriver ? styles.prepGood : styles.prepBad}`}>
                <span>{hasDriver ? '✓' : '✗'} Driver Hired</span>
                <small>{hasDriver ? `${saveData.hiredDriver?.firstName} ${saveData.hiredDriver?.lastName}` : 'Hire a driver before race day'}</small>
              </div>

              <div className={`${styles.prepRow} ${hasCrewChief ? styles.prepGood : styles.prepBad}`}>
                <span>{hasCrewChief ? '✓' : '✗'} Crew Chief Assigned</span>
                <small>
                  {hasCrewChief
                    ? `${saveData.hiredCrewChief?.firstName} ${saveData.hiredCrewChief?.lastName}`
                    : 'Hire a crew chief before race day'}
                </small>
              </div>

              <div className={`${styles.prepRow} ${hasSpotter ? styles.prepGood : styles.prepBad}`}>
                <span>{hasSpotter ? '✓' : '✗'} Spotter Assigned</span>
                <small>
                  {hasSpotter
                    ? `${saveData.hiredSpotter?.firstName} ${saveData.hiredSpotter?.lastName}`
                    : 'Hire a spotter before race day'}
                </small>
              </div>

              <div className={`${styles.prepRow} ${hasFullPitCrew ? styles.prepGood : styles.prepBad}`}>
                <span>{hasFullPitCrew ? '✓' : '✗'} Full Pit Crew Assigned</span>
                <small>
                  {hasFullPitCrew
                    ? 'All six pit crew roles are filled'
                    : `${pitCrewRolesFilled.size} of ${REQUIRED_PIT_CREW_ROLES.length} pit crew roles filled`}
                </small>
              </div>
            </div>

            <div className={styles.prepActions}>
              <button
                className={styles.prepCancel}
                onClick={() => {
                  setShowRacePrep(false)
                }}
              >
                {prepReady ? 'Close' : 'Go Back'}
              </button>
              <button
                className={prepReady ? styles.prepContinue : styles.prepContinueWarning}
                onClick={() => {
                  setShowRacePrep(false)
                  navigate('/game/race')
                }}
              >
                {prepReady ? 'Continue to Race Day' : 'Continue Anyway'}
              </button>
            </div>
          </div>
        </div>
      )}

      {serviceNotice && (
        <div className={styles.notifOverlay} onClick={() => setServiceNotice(null)}>
          <div className={styles.notifModal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.notifTitle}>Garage Service Complete</h3>

            {serviceNotice.installed.length > 0 && (
              <div className={styles.notifGroup}>
                <span className={styles.notifLabel}>Installed</span>
                <ul className={styles.notifList}>
                  {serviceNotice.installed.map((msg, i) => (
                    <li key={`inst-${i}`}>{msg}</li>
                  ))}
                </ul>
              </div>
            )}

            {serviceNotice.uninstalled.length > 0 && (
              <div className={styles.notifGroup}>
                <span className={`${styles.notifLabel} ${styles.uninstallLabel}`}>Uninstalled</span>
                <ul className={styles.notifList}>
                  {serviceNotice.uninstalled.map((msg, i) => (
                    <li key={`uninst-${i}`}>{msg}</li>
                  ))}
                </ul>
              </div>
            )}

            <button className={styles.notifBtn} onClick={() => setServiceNotice(null)}>OK</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Overview
