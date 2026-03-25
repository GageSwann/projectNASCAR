import {
  SaveSlotData, Chassis, MarketDriver,
  TrackType, SeasonRaceResult, DriverRaceResult,
  StandingsEntry,
} from '../types'
import { getTrackType } from './tracks'
import { generateAIField, AICarEntry, driverBaseStrength } from './aiTeams'

// 2026 NASCAR Points Format
// Finish: 1st=40, 2nd=35, then 34,33,32,...1
const POINTS_TABLE: number[] = [40, 35, 34, 33, 32, 31, 30, 29, 28, 27, 26, 25, 24, 23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
// Stage points for top 10 at each stage end
const STAGE_POINTS: number[] = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
// Number of stages per series (Truck/Xfinity=2, Cup=3)
const STAGES_PER_SERIES: Record<number, number> = { 1: 2, 2: 2, 3: 3 }

// Race purse payout percentages by finishing position (1st through 25th+)
// 1st gets 18%, 2nd gets 12%, etc. Remaining field splits ~1% each.
const PURSE_PCT: number[] = [
  0.18, 0.12, 0.085, 0.065, 0.055,
  0.048, 0.042, 0.038, 0.035, 0.032,
  0.028, 0.026, 0.024, 0.022, 0.020,
  0.018, 0.016, 0.015, 0.014, 0.013,
  0.012, 0.011, 0.010, 0.010, 0.010,
]

export function getPursePayout(purse: number, position: number): number {
  const pct = position <= PURSE_PCT.length ? PURSE_PCT[position - 1] : 0.008
  return Math.round(purse * pct)
}

function getPoints(position: number): number {
  return position <= POINTS_TABLE.length ? POINTS_TABLE[position - 1] : 1
}

function getStagePoints(position: number): number {
  return position <= STAGE_POINTS.length ? STAGE_POINTS[position - 1] : 0
}

// ---- Pseudo-random ----
function makeRng(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

function clamp(v: number, min: number, max: number) { return Math.max(min, Math.min(max, v)) }

// ---- Compute car performance from chassis + parts ----
function computeCarRating(chassis: Chassis | undefined) {
  if (!chassis || chassis.status !== 'ready') return { speed: 30, handling: 30, reliability: 30, aero: 30 }
  let speed = chassis.base_speed
  let handling = chassis.base_handling
  let reliability = chassis.base_reliability
  let aero = chassis.base_aero
  for (const p of chassis.installedParts) {
    // Skip parts still being installed
    if (p.installDaysLeft !== undefined && p.installDaysLeft > 0) continue
    const hf = (p.health ?? 100) / 100
    speed += Math.round(p.item.speed_bonus * hf)
    handling += Math.round(p.item.handling_bonus * hf)
    reliability += Math.round(p.item.reliability_bonus * hf)
    aero += Math.round(p.item.aero_bonus * hf)
  }
  return { speed, handling, reliability, aero }
}

// ---- Compute per-driver race strength ----
interface EntrantStats {
  driverId: number
  driverName: string
  carNumber: string
  teamName: string
  manufacturer: string
  isPlayer: boolean
  strength: number
  reliabilityChance: number
  wreckChance: number
  pitErrorChance: number
}

function getDriverTrackBonus(driver: MarketDriver, trackType: TrackType): number {
  switch (trackType) {
    case 'superspeedway': return driver.superspeedway
    case 'short_track': return driver.short_track
    case 'intermediate': return driver.intermediate
    case 'road_course': return driver.road_course
    case 'street': return driver.road_course // street uses road course skill
  }
}

function computePlayerStats(save: SaveSlotData, trackType: TrackType): EntrantStats {
  const driver = save.hiredDriver!
  const cc = save.hiredCrewChief
  const spotter = save.hiredSpotter
  const pitCrew = save.hiredPitCrew

  const car = computeCarRating(save.chassis.find(c => c.status === 'ready' && c.trackType === trackType)
    ?? save.chassis.find(c => c.status === 'ready'))

  // Driver contribution: 40% of total
  const trackBonus = getDriverTrackBonus(driver, trackType)
  const driverScore = (driver.pace * 0.35 + driver.racecraft * 0.25 + driver.consistency * 0.25 + trackBonus * 0.15)

  // Car contribution: 30% of total
  const carScore = (car.speed * 0.35 + car.handling * 0.25 + car.aero * 0.25 + car.reliability * 0.15)

  // Crew chief: 15%
  const ccScore = cc ? (cc.strategy * 0.35 + cc.setup * 0.4 + cc.adaptability * 0.25) : 30

  // Spotter: 5%
  const spotterScore = spotter ? (spotter.awareness * 0.4 + spotter.communication * 0.3 + spotter.positioning * 0.3) : 20

  // Pit crew: 10%
  const avgPit = pitCrew.length > 0
    ? pitCrew.reduce((sum, m) => sum + (m.speed * 0.4 + m.accuracy * 0.35 + m.consistency * 0.25), 0) / pitCrew.length
    : 20

  const strength = driverScore * 0.40 + carScore * 0.30 + ccScore * 0.15 + spotterScore * 0.05 + avgPit * 0.10

  // Reliability: base from car, worse if low
  const reliabilityChance = clamp(car.reliability / 100, 0.02, 0.99)
  // Wreck chance: lower racecraft + higher aggression = more wreck prone
  const wreckResist = (driver.racecraft * 0.5 + (spotter ? spotter.awareness * 0.3 : 10) + driver.consistency * 0.2) / 100
  // Pit error: based on pit crew accuracy
  const pitAccuracy = pitCrew.length > 0
    ? pitCrew.reduce((s, m) => s + m.accuracy, 0) / pitCrew.length / 100
    : 0.3

  return {
    driverId: driver.id,
    driverName: `${driver.firstName} ${driver.lastName}`,
    carNumber: save.carNumber || '1',
    teamName: save.selectedTeam?.name ?? 'Player Team',
    manufacturer: save.selectedTeam?.manufacturer ?? 'Chevrolet',
    isPlayer: true,
    strength,
    reliabilityChance,
    wreckChance: 1 - wreckResist,
    pitErrorChance: 1 - pitAccuracy,
  }
}

// ---- AI entrant stats computed from MarketDriver attributes ----
function computeAIStats(entry: AICarEntry, trackType: TrackType): EntrantStats {
  const d = entry.driver
  const trackBonus = getDriverTrackBonus(d, trackType)
  const driverScore = (d.pace * 0.35 + d.racecraft * 0.25 + d.consistency * 0.25 + trackBonus * 0.15)
  // AI cars get a car rating based on team strength (derived from driver tier)
  const base = driverBaseStrength(d)
  const carScore = base * 0.85 + 10 // correlated with team quality
  const strength = driverScore * 0.50 + carScore * 0.30 + 40 * 0.10 + 30 * 0.10

  const reliabilityChance = clamp((base + 10) / 110, 0.4, 0.95)
  const wreckResist = (d.racecraft * 0.5 + d.consistency * 0.3 + 30 * 0.2) / 100
  const pitAccuracy = 0.6 + (base / 100) * 0.3

  return {
    driverId: d.id,
    driverName: `${d.firstName} ${d.lastName}`,
    carNumber: entry.carNumber,
    teamName: entry.teamName,
    manufacturer: entry.manufacturer,
    isPlayer: false,
    strength,
    reliabilityChance,
    wreckChance: 1 - wreckResist,
    pitErrorChance: 1 - pitAccuracy,
  }
}

// Module-level AI field cache (regenerated per series, persists across races in a session)
let _cachedAIField: AICarEntry[] | null = null
let _cachedSeriesId: number = -1
let _cachedExclude: string = ''

export function getAIField(seriesId: number, excludeNumbers: Set<string> = new Set()): AICarEntry[] {
  const excludeKey = [...excludeNumbers].sort().join(',')
  if (_cachedAIField && _cachedSeriesId === seriesId && _cachedExclude === excludeKey) {
    return _cachedAIField
  }
  _cachedAIField = generateAIField(seriesId, excludeNumbers)
  _cachedSeriesId = seriesId
  _cachedExclude = excludeKey
  return _cachedAIField
}

export function simulateRace(
  save: SaveSlotData,
  trackName: string,
  round: number,
  totalLaps: number,
  purse: number = 0,
): SeasonRaceResult {
  const seriesId = save.selectedSeries?.id ?? 3
  const trackType = getTrackType(trackName)
  const rng = makeRng(seriesId * 10000 + round * 137 + save.currentSeason * 31)
  const r = () => rng()

  // Build entrant list
  const entrants: (EntrantStats & { raceScore: number })[] = []

  // Player entry
  const playerStats = computePlayerStats(save, trackType)
  entrants.push({ ...playerStats, raceScore: 0 })

  // AI entries — use the full AICarEntry system
  const playerNumbers = new Set<string>()
  if (save.carNumber) playerNumbers.add(save.carNumber)
  const aiField = getAIField(seriesId, playerNumbers)
  for (const entry of aiField) {
    // Skip AI cars from the player's own team
    if (entry.teamName === save.selectedTeam?.name) continue
    const aiStats = computeAIStats(entry, trackType)
    const variation = (r() - 0.5) * 6
    entrants.push({
      ...aiStats,
      strength: clamp(aiStats.strength + variation, 20, 99),
      raceScore: 0,
    })
  }

  // Simulate race: compute race score for each entrant
  const results: DriverRaceResult[] = []
  for (const e of entrants) {
    let status: DriverRaceResult['status'] = 'running'
    let lapsCompleted = totalLaps

    // Mechanical failure check (2-6% chance depending on reliability)
    const mechChance = 0.02 + (1 - e.reliabilityChance) * 0.06
    if (r() < mechChance) {
      status = 'dnf_mechanical'
      lapsCompleted = Math.max(1, Math.floor(r() * totalLaps * 0.8))
    }

    // Wreck check (3-10% chance)
    if (status === 'running' && r() < e.wreckChance * 0.12) {
      status = 'dnf_wreck'
      lapsCompleted = Math.max(1, Math.floor(r() * totalLaps * 0.9))
    }

    // Pit error check (2-8% chance, DNF if really bad)
    if (status === 'running' && r() < e.pitErrorChance * 0.1) {
      status = 'dnf_pit_error'
      lapsCompleted = Math.max(1, Math.floor(totalLaps * 0.5 + r() * totalLaps * 0.4))
    }

    // Race performance score (higher = better finish)
    // Reduced variance: ±4 max, making skill dominant. A 50-rated driver can't beat 99-rated.
    const raceVariance = (r() - 0.5) * 8
    const raceScore = status === 'running'
      ? e.strength + raceVariance
      : -(totalLaps - lapsCompleted) // DNF drivers get negative scores

    results.push({
      driverId: e.driverId,
      driverName: e.driverName,
      carNumber: e.carNumber,
      teamName: e.teamName,
      manufacturer: e.manufacturer,
      startPos: 0,
      finishPos: 0,
      lapsCompleted,
      lapsLed: 0,
      status,
      pointsEarned: 0,
      stagePoints: 0,
      purseEarned: 0,
      isPlayer: e.isPlayer,
    })

    entrants[entrants.indexOf(e)].raceScore = raceScore
  }

  // Sort by race score (higher = better) to determine finish positions
  const sorted = [...entrants].sort((a, b) => b.raceScore - a.raceScore)

  // Generate qualifying order (strength-based with variance)
  const qualOrder = [...entrants].sort((a, b) => (b.strength + (r() - 0.5) * 15) - (a.strength + (r() - 0.5) * 15))

  for (let i = 0; i < sorted.length; i++) {
    const result = results.find(res => res.driverId === sorted[i].driverId)!
    result.finishPos = i + 1
    result.startPos = qualOrder.findIndex(e => e.driverId === sorted[i].driverId) + 1
    result.pointsEarned = result.status === 'running' ? getPoints(i + 1) : Math.max(1, getPoints(sorted.length))
    result.purseEarned = getPursePayout(purse, i + 1)
    // Leader gets some laps led
    if (i === 0 && result.status === 'running') {
      result.lapsLed = Math.floor(totalLaps * (0.1 + r() * 0.3))
    } else if (i < 3 && result.status === 'running') {
      result.lapsLed = Math.floor(r() * totalLaps * 0.1)
    }
  }

  // ---- Stage Points Simulation ----
  const numStages = STAGES_PER_SERIES[seriesId] ?? 2
  // Simulate each stage: running order at stage end uses strength + small variance
  for (let stage = 0; stage < numStages; stage++) {
    const stageOrder = [...entrants]
      .filter(e => {
        const res = results.find(res => res.driverId === e.driverId)!
        // Only award stage points to drivers still running (or DNF'd after this stage)
        const stageLap = Math.floor(totalLaps * (stage + 1) / (numStages + 1))
        return res.lapsCompleted >= stageLap
      })
      .sort((a, b) => (b.strength + (r() - 0.5) * 6) - (a.strength + (r() - 0.5) * 6))

    for (let i = 0; i < Math.min(10, stageOrder.length); i++) {
      const result = results.find(res => res.driverId === stageOrder[i].driverId)!
      const sp = getStagePoints(i + 1)
      result.stagePoints += sp
      result.pointsEarned += sp
    }
  }

  // Sort results by finish position for display
  results.sort((a, b) => a.finishPos - b.finishPos)

  return { round, driverResults: results }
}

// ---- Update standings ----
export function updateStandings(
  currentStandings: StandingsEntry[],
  raceResult: SeasonRaceResult,
): StandingsEntry[] {
  const standings = [...currentStandings]

  for (const result of raceResult.driverResults) {
    let entry = standings.find(s => s.driverId === result.driverId)
    if (!entry) {
      entry = {
        driverId: result.driverId,
        driverName: result.driverName,
        carNumber: result.carNumber,
        teamName: result.teamName,
        manufacturer: result.manufacturer,
        points: 0,
        wins: 0,
        top5: 0,
        top10: 0,
        dnfs: 0,
        stagePoints: 0,
        isPlayer: result.isPlayer,
      }
      standings.push(entry)
    }
    entry.points += result.pointsEarned
    entry.stagePoints = (entry.stagePoints ?? 0) + (result.stagePoints ?? 0)
    if (result.finishPos === 1) entry.wins++
    if (result.finishPos <= 5) entry.top5++
    if (result.finishPos <= 10) entry.top10++
    if (result.status !== 'running') entry.dnfs++
  }

  // Sort by points descending
  standings.sort((a, b) => b.points - a.points || b.wins - a.wins)
  return standings
}

export function initializeStandings(seriesId: number, playerDriverId: number, playerDriverName: string, playerTeamName: string, playerCarNumber: string = '1', playerManufacturer: string = 'Chevrolet'): StandingsEntry[] {
  const aiField = getAIField(seriesId)
  const standings: StandingsEntry[] = [
    {
      driverId: playerDriverId,
      driverName: playerDriverName,
      carNumber: playerCarNumber,
      teamName: playerTeamName,
      manufacturer: playerManufacturer,
      points: 0, wins: 0, top5: 0, top10: 0, dnfs: 0, stagePoints: 0,
      isPlayer: true,
    },
  ]
  for (const entry of aiField) {
    standings.push({
      driverId: entry.driver.id,
      driverName: `${entry.driver.firstName} ${entry.driver.lastName}`,
      carNumber: entry.carNumber,
      teamName: entry.teamName,
      manufacturer: entry.manufacturer,
      points: 0, wins: 0, top5: 0, top10: 0, dnfs: 0, stagePoints: 0,
      isPlayer: false,
    })
  }
  // Sort alphabetically by driver name for pre-season display
  standings.sort((a, b) => a.driverName.localeCompare(b.driverName))
  return standings
}

// ---- Talent Progression System ----
// After each race, drivers and AI gain/lose stats based on performance and track type
export function applyTalentProgression(
  save: SaveSlotData,
  raceResult: SeasonRaceResult,
  trackType: TrackType,
): void {
  const fieldSize = raceResult.driverResults.length

  // Apply to player's hired driver
  if (save.hiredDriver) {
    const pResult = raceResult.driverResults.find(r => r.isPlayer)
    if (pResult) {
      applyDriverProgression(save.hiredDriver, pResult, trackType, fieldSize)
    }
  }

  // Apply to AI drivers (modifies attributes on the cached AI field)
  const seriesId = save.selectedSeries?.id ?? 3
  const aiField = getAIField(seriesId)
  for (const entry of aiField) {
    const aiResult = raceResult.driverResults.find(r => r.driverId === entry.driver.id)
    if (!aiResult) continue
    applyDriverProgression(entry.driver, aiResult, trackType, fieldSize)
  }
}

function applyDriverProgression(
  driver: MarketDriver,
  result: DriverRaceResult,
  trackType: TrackType,
  fieldSize: number,
): void {
  const posRatio = result.finishPos / fieldSize
  const isDNF = result.status !== 'running'
  const isWreck = result.status === 'dnf_wreck'

  // Track-specific stat changes
  const trackAttrKey = trackType === 'street' ? 'road_course' : trackType
  if (isDNF && isWreck) {
    // Wreck: lose track-type stat
    driver[trackAttrKey] = clamp(driver[trackAttrKey] - 1, 1, 99)
    driver.consistency = clamp(driver.consistency - 1, 1, 99)
  } else if (isDNF) {
    // Mechanical/pit DNF: minor consistency hit
    driver.consistency = clamp(driver.consistency - 0.5, 1, 99)
  } else if (posRatio <= 0.1) {
    // Top 10% finish: gain track stat + general
    driver[trackAttrKey] = clamp(driver[trackAttrKey] + 1, 1, 99)
    driver.pace = clamp(driver.pace + 0.3, 1, 99)
    driver.racecraft = clamp(driver.racecraft + 0.2, 1, 99)
  } else if (posRatio <= 0.25) {
    // Top 25%: minor gain
    driver[trackAttrKey] = clamp(driver[trackAttrKey] + 0.5, 1, 99)
    driver.consistency = clamp(driver.consistency + 0.2, 1, 99)
  } else if (posRatio > 0.75) {
    // Bottom 25%: minor decline
    driver[trackAttrKey] = clamp(driver[trackAttrKey] - 0.3, 1, 99)
  }

  // Win bonus
  if (result.finishPos === 1) {
    driver.pace = clamp(driver.pace + 0.5, 1, 99)
    driver.racecraft = clamp(driver.racecraft + 0.5, 1, 99)
  }

  // Round all stats to nearest integer for display
  driver.pace = Math.round(driver.pace)
  driver.racecraft = Math.round(driver.racecraft)
  driver.consistency = Math.round(driver.consistency)
  driver.aggression = Math.round(driver.aggression)
  driver.superspeedway = Math.round(driver.superspeedway)
  driver.short_track = Math.round(driver.short_track)
  driver.intermediate = Math.round(driver.intermediate)
  driver.road_course = Math.round(driver.road_course)
}

// ---- Part Wear System ----
// Call after each race to degrade installed parts on the player's active chassis
export function applyPartWear(
  save: SaveSlotData,
  playerResult: DriverRaceResult,
  trackType: TrackType,
): void {
  // Find matching chassis
  const chassis = save.chassis.find(c => c.status === 'ready' && c.trackType === trackType)
    ?? save.chassis.find(c => c.status === 'ready')
  if (!chassis) return

  const isWreck = playerResult.status === 'dnf_wreck'
  const isMechanical = playerResult.status === 'dnf_mechanical'

  for (const part of chassis.installedParts) {
    let wear = 0
    if (isWreck) {
      // Heavy damage: 15-30%
      wear = 15 + Math.floor(Math.random() * 16)
    } else if (isMechanical) {
      // Mechanical failure: moderate damage to engine/transmission, light to others
      if (part.item.category === 'engine' || part.item.category === 'transmission') {
        wear = 10 + Math.floor(Math.random() * 11)
      } else {
        wear = 2 + Math.floor(Math.random() * 4)
      }
    } else {
      // Normal racing wear: 2-5%
      wear = 2 + Math.floor(Math.random() * 4)
    }
    part.health = Math.max(0, part.health - wear)
  }
}
