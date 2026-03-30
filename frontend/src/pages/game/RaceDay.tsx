import React, { useState, useMemo, useEffect } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import styles from './RaceDay.module.css'
import { GameContext, DriverRaceResult, ItemCategory, OwnerStandingsEntry, SeasonRaceResult } from '../../types'
import { SCHEDULES, RaceInfo } from '../../data/schedule'
import { getTrack } from '../../data/tracks'
import { simulateRace, simulateQualifyingSession, simulateDaytona500Qualifying, buildDaytona500Lineup, updateStandings, initializeStandings, applyTalentProgression, applyPartWear } from '../../data/raceSim'
import { getTrackType } from '../../data/tracks'
import { getActiveSlotId, loadSlot, saveSlot } from '../../services/saveManager'

const formatMoney = (n: number) => n >= 1000000 ? `$${(n / 1000000).toFixed(1)}M` : `$${n.toLocaleString()}`

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatLapTime(seconds: number) {
  return `${seconds.toFixed(3)}s`
}

function raceEventKey(race: Pick<RaceInfo, 'date' | 'name' | 'track'>) {
  return `${race.date}|${race.name}|${race.track}`
}

function isDaytonaQualifyingEvent(race: RaceInfo) {
  return race.name === 'Daytona 500 Qualifying'
}

function getDuelNumber(race: RaceInfo): 1 | 2 | null {
  if (race.name.startsWith('Duel 1')) return 1
  if (race.name.startsWith('Duel 2')) return 2
  return null
}

function isDaytona500(race: RaceInfo) {
  return race.name === 'Daytona 500'
}

const TRACK_TYPE_LABELS: Record<string, string> = {
  superspeedway: 'Superspeedway',
  short_track: 'Short Track',
  intermediate: 'Intermediate',
  road_course: 'Road Course',
  dirt: 'Dirt',
}

const REQUIRED_PIT_CREW_MEMBERS = 6
const REQUIRED_PART_CATEGORIES: ItemCategory[] = ['engine', 'suspension', 'aerodynamics', 'brakes', 'transmission']

function isPartActiveForRace(part: { installDaysLeft?: number; uninstallDaysLeft?: number }): boolean {
  const installDone = part.installDaysLeft === undefined || part.installDaysLeft <= 0
  const notUninstalling = part.uninstallDaysLeft === undefined || part.uninstallDaysLeft <= 0
  return installDone && notUninstalling
}

function isChassisRaceReady(chassis: GameContext['saveData']['chassis'][number]): boolean {
  if (chassis.status !== 'ready') return false
  return REQUIRED_PART_CATEGORIES.every((category) =>
    chassis.installedParts.some((part) => part.item.category === category && isPartActiveForRace(part))
  )
}

function createPlayerDNSResult(save: GameContext['saveData'], finishPos: number): DriverRaceResult {
  const driverName = save.hiredDriver
    ? `${save.hiredDriver.firstName} ${save.hiredDriver.lastName}`
    : 'Unassigned Driver'

  return {
    driverId: save.hiredDriver?.id ?? -1,
    driverName,
    carNumber: save.carNumber || '1',
    teamName: save.selectedTeam?.name ?? 'Player Team',
    manufacturer: save.selectedTeam?.manufacturer ?? 'Chevrolet',
    startPos: 0,
    finishPos,
    lapsCompleted: 0,
    lapsLed: 0,
    status: 'dns',
    pointsEarned: 0,
    stagePoints: 0,
    purseEarned: 0,
    isPlayer: true,
  }
}

/** Update owner standings — tracks by car number, not driver */
function updateOwnerStandings(
  standings: OwnerStandingsEntry[],
  result: { driverResults: DriverRaceResult[] },
  playerCarNumber: string,
  playerTeamName: string,
  playerManufacturer: string,
): OwnerStandingsEntry[] {
  // Ensure player entry exists
  let list = [...standings]
  if (!list.find(e => e.isPlayer)) {
    list.push({ carNumber: playerCarNumber, teamName: playerTeamName, manufacturer: playerManufacturer, points: 0, wins: 0, top5: 0, top10: 0, dnfs: 0, isPlayer: true })
  }

  const pResult = result.driverResults.find(r => r.isPlayer)
  if (pResult) {
    const entry = list.find(e => e.isPlayer)!
    entry.points += pResult.pointsEarned
    if (pResult.finishPos === 1) entry.wins++
    if (pResult.finishPos <= 5) entry.top5++
    if (pResult.finishPos <= 10) entry.top10++
    if (pResult.status !== 'running') entry.dnfs++
  }

  // AI owner entries — one per unique AI team
  const aiResults = result.driverResults.filter(r => !r.isPlayer)
  for (const ai of aiResults) {
    let entry = list.find(e => !e.isPlayer && e.teamName === ai.teamName)
    if (!entry) {
      entry = { carNumber: ai.carNumber, teamName: ai.teamName, manufacturer: ai.manufacturer, points: 0, wins: 0, top5: 0, top10: 0, dnfs: 0, isPlayer: false }
      list.push(entry)
    }
    entry.points += ai.pointsEarned
    if (ai.finishPos === 1) entry.wins++
    if (ai.finishPos <= 5) entry.top5++
    if (ai.finishPos <= 10) entry.top10++
    if (ai.status !== 'running') entry.dnfs++
  }

  // Sort by points descending
  list.sort((a, b) => b.points - a.points || b.wins - a.wins)
  return list
}

function updateOrgStatsFromPlayerResult(
  orgStats: GameContext['saveData']['orgStats'],
  playerResult: DriverRaceResult,
): GameContext['saveData']['orgStats'] {
  const updated = { ...orgStats }
  updated.races += 1
  if (playerResult.finishPos === 1) updated.raceWins += 1
  if (playerResult.finishPos <= 5) updated.top5s += 1
  if (playerResult.finishPos <= 10) updated.top10s += 1
  if (playerResult.status !== 'running') updated.dnfs += 1
  if (playerResult.startPos === 1) updated.poles += 1
  return updated
}

type Phase = 'pre' | 'simming' | 'results'

const RaceDay: React.FC = () => {
  const { saveData, refreshSave } = useOutletContext<GameContext>()
  const navigate = useNavigate()
  const seriesId = saveData.selectedSeries?.id ?? 3
  const schedule = saveData.activeSchedule ?? SCHEDULES[seriesId] ?? SCHEDULES[3]
  const currentDate = saveData.currentDate || '2026-01-01'
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
      const ordered = [...schedule].sort((a, b) => a.date.localeCompare(b.date))
      const completedEvents = ordered.filter((race) => race.date <= currentDate)
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
  }, [saveData.seasonResults, schedule, currentDate])

  // Find today's race
  const todayRace = useMemo(() => {
    const racesToday = schedule.filter(r => r.date === currentDate)
    if (racesToday.length === 0) return null

    const playerDriverId = saveData.hiredDriver?.id
    const playerDuel = playerDriverId
      ? (saveData.daytonaSpeedweeks?.qualifyingOrder.find((q) => q.driverId === playerDriverId)?.duel ?? null)
      : null

    if (playerDuel) {
      const assignedDuelRace = racesToday.find((r) => getDuelNumber(r) === playerDuel)
      if (assignedDuelRace) return assignedDuelRace
    }

    return racesToday.find((r) => !completedRaceKeys.has(raceEventKey(r))) ?? racesToday[0]
  }, [schedule, currentDate, saveData.daytonaSpeedweeks, saveData.hiredDriver, completedRaceKeys])

  // Find next upcoming race
  const nextRace = useMemo(() => {
    return schedule.find(r => r.date >= currentDate && !completedRaceKeys.has(raceEventKey(r))) ?? null
  }, [schedule, currentDate, completedRaceKeys])

  const race = todayRace ?? nextRace ?? schedule[schedule.length - 1]
  const isRaceDay = todayRace !== null

  const trackInfo = getTrack(race.track)
  const trackType = trackInfo?.type ?? 'intermediate'

  const pointsRaces = schedule.filter(r => !r.isExhibition)
  const completedRaces = (saveData.seasonResults ?? []).length
  const seasonOver = completedRaces >= pointsRaces.length && pointsRaces.length > 0

  const [phase, setPhase] = useState<Phase>('pre')
  const [raceResult, setRaceResult] = useState<DriverRaceResult[] | null>(null)
  const [playerResult, setPlayerResult] = useState<DriverRaceResult | null>(null)
  const [showSkipWarning, setShowSkipWarning] = useState(false)
  const [simulatedRace, setSimulatedRace] = useState<RaceInfo | null>(null)
  const [manualQualifyingOrder, setManualQualifyingOrder] = useState<number[] | null>(null)
  const [manualQualifyingPlayerStart, setManualQualifyingPlayerStart] = useState<number | null>(null)
  const [manualQualifyingSkipped, setManualQualifyingSkipped] = useState(false)
  const displayRace = phase === 'results' && simulatedRace ? simulatedRace : race
  const displayTrackInfo = getTrack(displayRace.track)
  const displayTrackType = displayTrackInfo?.type ?? 'intermediate'

  // Readiness checks
  const hasDriver = !!saveData.hiredDriver
  const matchingChassis = saveData.chassis.find(c => c.trackType === trackType && isChassisRaceReady(c))
  const hasChassis = !!matchingChassis
  const hasAnyChassis = saveData.chassis.some(c => isChassisRaceReady(c))

  // Check if all installed parts on the matching chassis are fully installed
  const hasUnfinishedParts = matchingChassis?.installedParts.some(
    p => (p.installDaysLeft !== undefined && p.installDaysLeft > 0) || (p.uninstallDaysLeft !== undefined && p.uninstallDaysLeft > 0)
  ) ?? false

  const playerDuelAssignment = saveData.hiredDriver
    ? (saveData.daytonaSpeedweeks?.qualifyingOrder.find((q) => q.driverId === saveData.hiredDriver!.id)?.duel ?? null)
    : null
  const currentDuelNo = getDuelNumber(race)
  const isDuelRace = currentDuelNo !== null
  const requiresManualQualifying = !isDaytonaQualifyingEvent(race) && !isDuelRace && !isDaytona500(race)
  const hasManualQualifyingSelection = !requiresManualQualifying || manualQualifyingOrder !== null
  const hasSpeedweeksQualifying = !isDuelRace || (saveData.daytonaSpeedweeks?.season === (saveData.currentSeason ?? 2026))
  const duelDriverIds = currentDuelNo === 1
    ? saveData.daytonaSpeedweeks?.duel1DriverIds
    : currentDuelNo === 2
      ? saveData.daytonaSpeedweeks?.duel2DriverIds
      : undefined
  const playerEligibleForRace = !currentDuelNo || !saveData.hiredDriver || !!duelDriverIds?.includes(saveData.hiredDriver.id)

  const ready = hasDriver && hasChassis && !hasUnfinishedParts && isRaceDay && hasSpeedweeksQualifying && hasManualQualifyingSelection

  useEffect(() => {
    setManualQualifyingOrder(null)
    setManualQualifyingPlayerStart(null)
    setManualQualifyingSkipped(false)
  }, [race.name, race.date, race.track])

  const runManualQualifying = (skipPlayer: boolean) => {
    const slotId = getActiveSlotId()
    if (!slotId) return
    const freshSave = loadSlot(slotId)
    if (!freshSave) return

    if (skipPlayer) {
      const aiOnlyQual = simulateQualifyingSession(freshSave, race.track, race.round, false)
      const playerId = freshSave.hiredDriver?.id
      if (!playerId) return
      const order = [...aiOnlyQual.order, playerId]
      setManualQualifyingOrder(order)
      setManualQualifyingPlayerStart(order.length)
      setManualQualifyingSkipped(true)
      return
    }

    const qual = simulateQualifyingSession(freshSave, race.track, race.round, true)
    const playerEntry = qual.entries.find((entry) => entry.isPlayer)
    setManualQualifyingOrder(qual.order)
    setManualQualifyingPlayerStart(playerEntry?.startPos ?? null)
    setManualQualifyingSkipped(false)
  }

  const lineupSession = useMemo(() => {
    return simulateQualifyingSession(saveData, race.track, race.round, playerEligibleForRace, {
      eligibleDriverIds: duelDriverIds,
      forcePlayerToBack: requiresManualQualifying && manualQualifyingSkipped,
    })
  }, [saveData, race.track, race.round, playerEligibleForRace, duelDriverIds, requiresManualQualifying, manualQualifyingSkipped])

  const lineupRows = useMemo(() => {
    const byId = new Map(lineupSession.entries.map((e) => [e.driverId, e]))
    const preferredOrder = currentDuelNo
      ? (currentDuelNo === 1 ? (saveData.daytonaSpeedweeks?.duel1DriverIds ?? lineupSession.order) : (saveData.daytonaSpeedweeks?.duel2DriverIds ?? lineupSession.order))
      : isDaytona500(race)
        ? (saveData.daytonaSpeedweeks?.daytona500LineupDriverIds ?? lineupSession.order)
        : requiresManualQualifying
          ? (manualQualifyingOrder ?? lineupSession.order)
          : lineupSession.order

    return preferredOrder
      .map((driverId, index) => {
        const row = byId.get(driverId)
        if (row) return { ...row, startPos: index + 1 }
        if (saveData.hiredDriver && driverId === saveData.hiredDriver.id) {
          return {
            driverId,
            driverName: `${saveData.hiredDriver.firstName} ${saveData.hiredDriver.lastName}`,
            carNumber: saveData.carNumber || '1',
            teamName: saveData.selectedTeam?.name ?? 'Player Team',
            manufacturer: saveData.selectedTeam?.manufacturer ?? 'Chevrolet',
            isPlayer: true,
            lapTime: 0,
            startPos: index + 1,
          }
        }
        return null
      })
      .filter((row): row is NonNullable<typeof row> => !!row)
  }, [lineupSession, currentDuelNo, saveData.daytonaSpeedweeks, saveData.hiredDriver, saveData.selectedTeam, saveData.carNumber, race, requiresManualQualifying, manualQualifyingOrder])
  const showQualifyingTimes = requiresManualQualifying && manualQualifyingOrder !== null && !manualQualifyingSkipped

  const simulateAndSave = () => {
    if (!ready) return
    setSimulatedRace(race)
    setPhase('simming')

    setTimeout(() => {
      const slotId = getActiveSlotId()
      if (!slotId) return
      const freshSave = loadSlot(slotId)
      if (!freshSave) return

      // Initialize standings if empty
      let standings = freshSave.standings ?? []
      if (standings.length === 0 && freshSave.hiredDriver) {
        const driverName = `${freshSave.hiredDriver.firstName} ${freshSave.hiredDriver.lastName}`
        standings = initializeStandings(
          seriesId,
          freshSave.hiredDriver.id,
          driverName,
          freshSave.selectedTeam?.name ?? 'Player Team',
          freshSave.carNumber || '1',
          freshSave.selectedTeam?.manufacturer ?? 'Chevrolet',
        )
      }

      let seasonResult: SeasonRaceResult
      if (isDaytonaQualifyingEvent(race)) {
        const qualifying = simulateDaytona500Qualifying(freshSave)
        freshSave.daytonaSpeedweeks = qualifying.speedweeks
        seasonResult = {
          ...qualifying.result,
          raceName: race.name,
          raceTrack: race.track,
          raceDate: race.date,
          isExhibition: true,
        }
      } else {
        const duelNo = getDuelNumber(race)
        const duelDriverIds = duelNo === 1
          ? freshSave.daytonaSpeedweeks?.duel1DriverIds
          : duelNo === 2
            ? freshSave.daytonaSpeedweeks?.duel2DriverIds
            : undefined
        const playerEligible = !duelNo || !freshSave.hiredDriver || !!duelDriverIds?.includes(freshSave.hiredDriver.id)
        const startOrder = duelNo
          ? (duelNo === 1 ? freshSave.daytonaSpeedweeks?.duel1DriverIds : freshSave.daytonaSpeedweeks?.duel2DriverIds)
          : isDaytona500(race)
            ? freshSave.daytonaSpeedweeks?.daytona500LineupDriverIds
            : (requiresManualQualifying ? manualQualifyingOrder ?? undefined : undefined)

        const result = simulateRace(
          freshSave,
          race.track,
          race.round,
          race.laps,
          race.purse,
          playerEligible,
          {
            eligibleDriverIds: duelDriverIds,
            startingOrderDriverIds: startOrder,
          }
        )

        seasonResult = {
          ...result,
          raceName: race.name,
          raceTrack: race.track,
          raceDate: race.date,
          isExhibition: race.isExhibition,
        }

        if (duelNo && freshSave.daytonaSpeedweeks) {
          const finishingOrder = [...seasonResult.driverResults]
            .sort((a, b) => a.finishPos - b.finishPos)
            .map((d) => d.driverId)
          if (duelNo === 1) freshSave.daytonaSpeedweeks.duel1ResultDriverIds = finishingOrder
          if (duelNo === 2) freshSave.daytonaSpeedweeks.duel2ResultDriverIds = finishingOrder

          if (freshSave.daytonaSpeedweeks.duel1ResultDriverIds && freshSave.daytonaSpeedweeks.duel2ResultDriverIds) {
            freshSave.daytonaSpeedweeks.daytona500LineupDriverIds = buildDaytona500Lineup(freshSave.daytonaSpeedweeks)
          }
        }
      }

      const pResult = seasonResult.driverResults.find(r => r.isPlayer) ?? null
      setRaceResult(seasonResult.driverResults)
      setPlayerResult(pResult)

      // If exhibition, don't update championship standings
      if (!race.isExhibition) {
        const newStandings = updateStandings(standings, seasonResult)
        freshSave.standings = newStandings

        // Update owner standings
        let ownerStandings = freshSave.ownerStandings ?? []
        ownerStandings = updateOwnerStandings(ownerStandings, seasonResult, freshSave.carNumber || '1', freshSave.selectedTeam?.name ?? 'Player Team', freshSave.selectedTeam?.manufacturer ?? 'Chevrolet')
        freshSave.ownerStandings = ownerStandings
      } else {
        freshSave.standings = standings
      }

      // Calculate salary cost for this race
      const totalRaces = pointsRaces.length
      let salaryCost = 0
      if (freshSave.hiredDriver) salaryCost += freshSave.hiredDriver.salary / totalRaces
      if (freshSave.hiredCrewChief) salaryCost += freshSave.hiredCrewChief.salary / totalRaces
      if (freshSave.hiredSpotter) salaryCost += freshSave.hiredSpotter.salary / totalRaces
      for (const m of (freshSave.hiredPitCrew ?? [])) salaryCost += m.salary / totalRaces
      salaryCost = Math.round(salaryCost)

      const playerWon = pResult?.finishPos === 1

      freshSave.seasonResults = [...(freshSave.seasonResults ?? []), seasonResult]
      freshSave.currentWeek = (freshSave.seasonResults.length) + 1
      freshSave.money = Math.max(0, freshSave.money - salaryCost + (pResult?.purseEarned ?? 0))
      if (playerWon) freshSave.totalWins = (freshSave.totalWins ?? 0) + 1
      if (pResult && !race.isExhibition) {
        freshSave.orgStats = updateOrgStatsFromPlayerResult(freshSave.orgStats, pResult)
      }

      // Advance date to day after race
      const raceDate = new Date(race.date + 'T12:00:00')
      raceDate.setDate(raceDate.getDate() + 1)
      freshSave.currentDate = raceDate.toISOString().slice(0, 10)

      // Apply talent progression
      const tType = getTrackType(race.track)
      if (!isDaytonaQualifyingEvent(race)) {
        applyTalentProgression(freshSave, seasonResult, tType)
      }

      // Apply part wear/damage
      if (pResult && !isDaytonaQualifyingEvent(race)) {
        applyPartWear(freshSave, pResult, tType)
      }

      // Check if season is over
      const pRaces = (freshSave.activeSchedule ?? SCHEDULES[freshSave.selectedSeries?.id ?? 3] ?? SCHEDULES[3]).filter(r => !r.isExhibition)
      if (freshSave.seasonResults.length >= pRaces.length) {
        freshSave.seasonPhase = 'postseason'
      }

      saveSlot(freshSave)
      refreshSave()
      setPhase('results')
    }, 1200)
  }

  const handleContinue = () => {
    navigate('/game')
  }

  const handleSkipRace = () => {
    setShowSkipWarning(false)
    setSimulatedRace(race)
    setPhase('simming')

    setTimeout(() => {
      const slotId = getActiveSlotId()
      if (!slotId) return
      const freshSave = loadSlot(slotId)
      if (!freshSave) return

      // Initialize standings if empty
      let standings = freshSave.standings ?? []
      if (standings.length === 0 && freshSave.hiredDriver) {
        const driverName = `${freshSave.hiredDriver.firstName} ${freshSave.hiredDriver.lastName}`
        standings = initializeStandings(
          seriesId,
          freshSave.hiredDriver.id,
          driverName,
          freshSave.selectedTeam?.name ?? 'Player Team',
          freshSave.carNumber || '1',
          freshSave.selectedTeam?.manufacturer ?? 'Chevrolet',
        )
      }

      const duelNo = getDuelNumber(race)
      const duelDriverIds = duelNo === 1
        ? freshSave.daytonaSpeedweeks?.duel1DriverIds
        : duelNo === 2
          ? freshSave.daytonaSpeedweeks?.duel2DriverIds
          : undefined
      const startOrder = duelNo
        ? (duelNo === 1 ? freshSave.daytonaSpeedweeks?.duel1DriverIds : freshSave.daytonaSpeedweeks?.duel2DriverIds)
        : isDaytona500(race)
          ? freshSave.daytonaSpeedweeks?.daytona500LineupDriverIds
          : (requiresManualQualifying ? manualQualifyingOrder ?? undefined : undefined)

      // Simulate AI race normally through the race engine without a player entry,
      // then append an explicit player DNS result.
      const result = simulateRace(freshSave, race.track, race.round, race.laps, race.purse, false, {
        eligibleDriverIds: duelDriverIds,
        startingOrderDriverIds: startOrder,
      })

      const dnsResult = createPlayerDNSResult(freshSave, result.driverResults.length + 1)
      const dnsRaceResult = {
        ...result,
        raceName: race.name,
        raceTrack: race.track,
        raceDate: race.date,
        isExhibition: race.isExhibition,
        driverResults: [...result.driverResults, dnsResult],
      }

      if (duelNo && freshSave.daytonaSpeedweeks) {
        const finishingOrder = [...dnsRaceResult.driverResults]
          .filter((d) => d.driverId !== dnsResult.driverId)
          .sort((a, b) => a.finishPos - b.finishPos)
          .map((d) => d.driverId)
        if (duelNo === 1) freshSave.daytonaSpeedweeks.duel1ResultDriverIds = finishingOrder
        if (duelNo === 2) freshSave.daytonaSpeedweeks.duel2ResultDriverIds = finishingOrder

        if (freshSave.daytonaSpeedweeks.duel1ResultDriverIds && freshSave.daytonaSpeedweeks.duel2ResultDriverIds) {
          freshSave.daytonaSpeedweeks.daytona500LineupDriverIds = buildDaytona500Lineup(freshSave.daytonaSpeedweeks)
        }
      }

      setRaceResult(dnsRaceResult.driverResults)
      setPlayerResult(dnsResult)

      if (!race.isExhibition) {
        const newStandings = updateStandings(standings, dnsRaceResult)
        freshSave.standings = newStandings

        let ownerStandings = freshSave.ownerStandings ?? []
        ownerStandings = updateOwnerStandings(ownerStandings, dnsRaceResult, freshSave.carNumber || '1', freshSave.selectedTeam?.name ?? 'Player Team', freshSave.selectedTeam?.manufacturer ?? 'Chevrolet')
        freshSave.ownerStandings = ownerStandings
      } else {
        freshSave.standings = standings
      }

      freshSave.seasonResults = [...(freshSave.seasonResults ?? []), dnsRaceResult]
      freshSave.currentWeek = (freshSave.seasonResults.length) + 1
      if (!race.isExhibition) {
        freshSave.orgStats = updateOrgStatsFromPlayerResult(freshSave.orgStats, dnsResult)
      }

      // Advance date to day after race
      const raceDate = new Date(race.date + 'T12:00:00')
      raceDate.setDate(raceDate.getDate() + 1)
      freshSave.currentDate = raceDate.toISOString().slice(0, 10)

      // Apply talent progression for AI only
      const tType = getTrackType(race.track)
      if (!isDaytonaQualifyingEvent(race)) {
        applyTalentProgression(freshSave, result, tType)
      }

      // Check if season is over
      const pRaces = (freshSave.activeSchedule ?? SCHEDULES[freshSave.selectedSeries?.id ?? 3] ?? SCHEDULES[3]).filter(r => !r.isExhibition)
      if (freshSave.seasonResults.length >= pRaces.length) {
        freshSave.seasonPhase = 'postseason'
      }

      saveSlot(freshSave)
      refreshSave()
      setPhase('results')
    }, 1200)
  }

  if (seasonOver) {
    return (
      <div className={styles.page}>
        <div className={styles.seasonEnd}>
          <h1>Season Complete!</h1>
          <p>All {pointsRaces.length} championship races have been run.</p>
          <button className={styles.primaryBtn} onClick={() => navigate('/game/rankings')}>
            View Final Standings
          </button>
          <button className={styles.primaryBtn} onClick={() => navigate('/game/offseason')} style={{ marginTop: '0.5rem' }}>
            Go to Offseason
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      {/* Track Header */}
      <div className={styles.trackHeader}>
        <div className={styles.roundBadge}>{displayRace.isExhibition ? 'Exhibition' : `Round ${displayRace.round} of ${pointsRaces.length}`}</div>
        <h1 className={styles.raceName}>{displayRace.name}</h1>
        <div className={styles.trackDetails}>
          <span className={styles.trackName}>{displayRace.track}</span>
          <span className={styles.trackMeta}>{formatDate(displayRace.date)}</span>
        </div>
      </div>

      {/* Track Info Card */}
      <div className={styles.trackCard}>
        <div className={styles.trackVisual}>
          <div className={styles.trackShape} data-type={displayTrackType}>
            <span className={styles.trackTypeLabel}>{TRACK_TYPE_LABELS[displayTrackType] ?? displayTrackType}</span>
          </div>
        </div>
        <div className={styles.trackStats}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Length</span>
            <span className={styles.statValue}>{displayTrackInfo?.lengthMiles ?? '?'} mi</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Laps</span>
            <span className={styles.statValue}>{race.laps}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Type</span>
            <span className={styles.statValue}>{TRACK_TYPE_LABELS[displayTrackType] ?? displayTrackType}</span>
          </div>
        </div>
      </div>

      {/* PRE-RACE PHASE */}
      {phase === 'pre' && (
        <div className={styles.preRace}>
          {requiresManualQualifying && (
            <div className={styles.costSummary} style={{ marginBottom: '1rem' }}>
              <h3>Race Qualifying</h3>
              <p style={{ margin: '0.25rem 0', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                Sim qualifying for your starting spot, or skip qualifying and start at the back of the field.
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.6rem' }}>
                <button className={styles.fixBtn} onClick={() => runManualQualifying(false)}>Sim Qualifying</button>
                <button className={styles.fixBtn} onClick={() => runManualQualifying(true)}>Skip Qualifying (Start Last)</button>
              </div>
              {manualQualifyingOrder && (
                <p style={{ margin: '0.6rem 0 0', color: 'var(--text-primary)', fontSize: '0.82rem' }}>
                  {manualQualifyingSkipped
                    ? `Qualifying skipped. You will start P${manualQualifyingPlayerStart ?? manualQualifyingOrder.length}.`
                    : `Qualifying complete. You will start P${manualQualifyingPlayerStart ?? '-'}.`}
                </p>
              )}
            </div>
          )}

          {isDaytonaQualifyingEvent(race) && (
            <div className={styles.costSummary} style={{ marginBottom: '1rem' }}>
              <h3>Daytona 500 Qualifying Format</h3>
              <p style={{ margin: '0.25rem 0', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                Round 1: all drivers run one lap. Top 10 advance to Round 2 for the front-row shootout.
              </p>
              <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                Odd qualifiers go to Duel 1, even qualifiers go to Duel 2. Duels set the Daytona 500 grid positions 3-40.
              </p>
            </div>
          )}

          {getDuelNumber(race) && playerDuelAssignment && (
            <div className={styles.costSummary} style={{ marginBottom: '1rem' }}>
              <h3>Speedweeks Assignment</h3>
              <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                You qualified into Duel {playerDuelAssignment}. This race is {race.name}.
              </p>
            </div>
          )}

          <h2 className={styles.sectionTitle}>Driver/Car Lineup</h2>
          <div className={styles.resultsTable}>
            <div
              className={styles.resultsHeader}
              style={{ gridTemplateColumns: showQualifyingTimes ? '50px 1fr 1fr 70px 90px 80px' : '50px 1fr 1fr 70px 60px 80px' }}
            >
              <span className={styles.rCol1}>Start</span>
              <span className={styles.rCol2}>Driver</span>
              <span className={styles.rCol3}>Team</span>
              <span className={styles.rCol4}>Car</span>
              <span className={styles.rCol5}>{showQualifyingTimes ? 'Q Lap' : 'Mfr'}</span>
              <span className={styles.rCol6}>{showQualifyingTimes ? 'Mfr' : 'Tag'}</span>
            </div>
            {lineupRows.map((row) => (
              <div
                key={`lineup-${row.driverId}-${row.startPos}`}
                className={`${styles.resultsRow} ${row.isPlayer ? styles.playerRow : ''}`}
                style={{ gridTemplateColumns: showQualifyingTimes ? '50px 1fr 1fr 70px 90px 80px' : '50px 1fr 1fr 70px 60px 80px' }}
              >
                <span className={styles.rCol1}><span className={styles.posNum}>P{row.startPos}</span></span>
                <span className={styles.rCol2}>{row.driverName}</span>
                <span className={styles.rCol3}>{row.teamName}</span>
                <span className={styles.rCol4}>#{row.carNumber}</span>
                <span className={styles.rCol5}>{showQualifyingTimes ? formatLapTime(row.lapTime) : row.manufacturer}</span>
                <span className={styles.rCol6}>{showQualifyingTimes ? row.manufacturer : (row.isPlayer ? 'You' : '')}</span>
              </div>
            ))}
          </div>

          {/* Race cost summary */}
          <div className={styles.costSummary}>
            <h3>Race Financials</h3>
            <div className={styles.costRow} style={{ marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 700 }}>Race Purse</span>
              <span style={{ fontWeight: 700, color: '#ffd700' }}>{formatMoney(race.purse)}</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 0.5rem' }}>Salaries prorated per race ({pointsRaces.length} race season)</p>
            <div className={styles.costRows}>
              {saveData.hiredDriver && (
                <div className={styles.costRow}>
                  <span>Driver Salary</span><span>{formatMoney(Math.round(saveData.hiredDriver.salary / pointsRaces.length))}</span>
                </div>
              )}
              {saveData.hiredCrewChief && (
                <div className={styles.costRow}>
                  <span>Crew Chief</span><span>{formatMoney(Math.round(saveData.hiredCrewChief.salary / pointsRaces.length))}</span>
                </div>
              )}
              {saveData.hiredSpotter && (
                <div className={styles.costRow}>
                  <span>Spotter</span><span>{formatMoney(Math.round(saveData.hiredSpotter.salary / pointsRaces.length))}</span>
                </div>
              )}
              {(saveData.hiredPitCrew ?? []).map(m => (
                <div key={m.id} className={styles.costRow}>
                  <span>Pit: {m.firstName} {m.lastName}</span><span>{formatMoney(Math.round(m.salary / pointsRaces.length))}</span>
                </div>
              ))}
              <div className={`${styles.costRow} ${styles.costTotal}`}>
                <span>Total Per Race</span>
                <span>{formatMoney(Math.round(
                  ((saveData.hiredDriver?.salary ?? 0) +
                  (saveData.hiredCrewChief?.salary ?? 0) +
                  (saveData.hiredSpotter?.salary ?? 0) +
                  (saveData.hiredPitCrew ?? []).reduce((s, m) => s + m.salary, 0)) / pointsRaces.length
                ))}</span>
              </div>
            </div>
          </div>

          <button
            className={`${styles.primaryBtn} ${!ready ? styles.disabled : ''}`}
            onClick={simulateAndSave}
            disabled={!ready}
          >
            {ready ? 'Simulate Race' : 'Requirements Not Met'}
          </button>

          {!ready && isRaceDay && (
            <button
              className={styles.skipBtn}
              onClick={() => setShowSkipWarning(true)}
            >
              Skip Race (No Entry)
            </button>
          )}

          {/* Skip Race Warning Modal */}
          {showSkipWarning && (
            <div className={styles.skipOverlay} onClick={() => setShowSkipWarning(false)}>
              <div className={styles.skipModal} onClick={e => e.stopPropagation()}>
                <h3 className={styles.skipTitle}>⚠ Skip Race?</h3>
                <p className={styles.skipText}>
                  Your team will <strong>not enter</strong> this race. No drivers or cars will compete on your behalf.
                </p>
                <p className={styles.skipText}>
                  You will earn <strong>no points</strong> and <strong>no prize money</strong> for this race. AI drivers will still compete and earn points.
                </p>
                <div className={styles.skipBtns}>
                  <button className={styles.skipCancel} onClick={() => setShowSkipWarning(false)}>Go Back</button>
                  <button className={styles.skipConfirm} onClick={handleSkipRace}>Skip Race</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SIMMING PHASE */}
      {phase === 'simming' && (
        <div className={styles.simming}>
          <div className={styles.simSpinner} />
          <span className={styles.simText}>Simulating {race.laps} laps...</span>
        </div>
      )}

      {/* RESULTS PHASE */}
      {phase === 'results' && raceResult && (
        <div className={styles.results}>
          {isDaytonaQualifyingEvent(displayRace) && saveData.daytonaSpeedweeks && (
            <div className={styles.costSummary} style={{ marginBottom: '1rem' }}>
              <h3>Qualifying Complete</h3>
              <p style={{ margin: '0.25rem 0', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                Front Row Locked: {saveData.daytonaSpeedweeks.frontRowDriverIds
                  .map((id) => saveData.daytonaSpeedweeks?.qualifyingOrder.find((q) => q.driverId === id)?.driverName)
                  .filter(Boolean)
                  .join(' • ')}
              </p>
              {playerDuelAssignment && (
                <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  You are assigned to Duel {playerDuelAssignment} at Daytona.
                </p>
              )}
            </div>
          )}

          {/* Player highlight */}
          {playerResult && (
            <div className={`${styles.playerHighlight} ${playerResult.status !== 'running' ? styles.dnfHighlight : playerResult.finishPos <= 3 ? styles.podiumHighlight : ''}`}>
              <div className={styles.phPos}>
                {playerResult.status !== 'running'
                  ? playerResult.status === 'dns' ? 'DNS' : 'DNF'
                  : `P${playerResult.finishPos}`}
              </div>
              <div className={styles.phInfo}>
                <span className={styles.phName}>{playerResult.driverName}</span>
                <span className={styles.phTeam}>{playerResult.teamName}</span>
                {playerResult.status !== 'running' && (
                  <span className={styles.phDnf}>
                    {playerResult.status === 'dns' ? 'Did Not Start' :
                     playerResult.status === 'dnf_wreck' ? 'Wrecked' :
                     playerResult.status === 'dnf_mechanical' ? 'Mechanical Failure' :
                     'Pit Road Error'}
                    {playerResult.status === 'dns' ? '' : ` — Lap ${playerResult.lapsCompleted}/${displayRace.laps}`}
                  </span>
                )}
              </div>
              <div className={styles.phPoints}>+{playerResult.pointsEarned} pts{playerResult.stagePoints > 0 ? ` (${playerResult.stagePoints} stage)` : ''}</div>
              <div className={styles.phPurse}>+{formatMoney(playerResult.purseEarned)}</div>
            </div>
          )}

          <h2 className={styles.sectionTitle}>Full Results</h2>
          <div className={styles.resultsTable}>
            <div className={styles.resultsHeader}>
              <span className={styles.rCol1}>Pos</span>
              <span className={styles.rCol2}>Driver</span>
              <span className={styles.rCol3}>Team</span>
              <span className={styles.rCol4}>Status</span>
              <span className={styles.rCol5}>Pts</span>
              <span className={styles.rCol6}>Purse</span>
            </div>
            {raceResult.map((r) => (
              <div
                key={r.driverId}
                className={`${styles.resultsRow} ${r.isPlayer ? styles.playerRow : ''} ${r.status !== 'running' ? styles.dnfRow : ''}`}
              >
                <span className={styles.rCol1}>
                  <span className={`${styles.posNum} ${r.finishPos <= 3 ? styles.podium : ''}`}>{r.finishPos}</span>
                </span>
                <span className={styles.rCol2}>{r.driverName}</span>
                <span className={styles.rCol3}>{r.teamName}</span>
                <span className={styles.rCol4}>
                  {r.status === 'running' ? `${r.lapsCompleted} laps` :
                   r.status === 'dns' ? 'DNS' :
                   r.status === 'dnf_wreck' ? 'Wreck' :
                   r.status === 'dnf_mechanical' ? 'Mechanical' :
                   'Pit Error'}
                </span>
                <span className={styles.rCol5}>+{r.pointsEarned}{r.stagePoints > 0 ? ` (${r.stagePoints}S)` : ''}</span>
                <span className={styles.rCol6}>{formatMoney(r.purseEarned)}</span>
              </div>
            ))}
          </div>

          <button className={styles.primaryBtn} onClick={handleContinue}>
            Continue
          </button>
        </div>
      )}
    </div>
  )
}

export default RaceDay
