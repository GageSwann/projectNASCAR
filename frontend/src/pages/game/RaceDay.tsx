import React, { useState, useMemo } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import styles from './RaceDay.module.css'
import { GameContext, DriverRaceResult, OwnerStandingsEntry } from '../../types'
import { SCHEDULES } from '../../data/schedule'
import { getTrack } from '../../data/tracks'
import { simulateRace, updateStandings, initializeStandings, applyTalentProgression, applyPartWear } from '../../data/raceSim'
import { getTrackType } from '../../data/tracks'
import { getActiveSlotId, loadSlot, saveSlot } from '../../services/saveManager'

const formatMoney = (n: number) => n >= 1000000 ? `$${(n / 1000000).toFixed(1)}M` : `$${n.toLocaleString()}`

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const TRACK_TYPE_LABELS: Record<string, string> = {
  superspeedway: 'Superspeedway',
  short_track: 'Short Track',
  intermediate: 'Intermediate',
  road_course: 'Road Course',
  street: 'Street Circuit',
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

type Phase = 'pre' | 'simming' | 'results'

const RaceDay: React.FC = () => {
  const { saveData, refreshSave } = useOutletContext<GameContext>()
  const navigate = useNavigate()
  const seriesId = saveData.selectedSeries?.id ?? 3
  const schedule = saveData.activeSchedule ?? SCHEDULES[seriesId] ?? SCHEDULES[3]
  const currentDate = saveData.currentDate || '2026-01-01'

  // Find today's race
  const todayRace = useMemo(() => {
    return schedule.find(r => r.date === currentDate) ?? null
  }, [schedule, currentDate])

  // Find next upcoming race
  const nextRace = useMemo(() => {
    const racedRounds = new Set((saveData.seasonResults ?? []).map(r => r.round))
    return schedule.find(r => r.date >= currentDate && !racedRounds.has(r.round)) ?? null
  }, [schedule, currentDate, saveData.seasonResults])

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

  // Readiness checks
  const hasDriver = !!saveData.hiredDriver
  const matchingChassis = saveData.chassis.find(c => c.status === 'ready' && c.trackType === trackType)
  const hasChassis = !!matchingChassis
  const hasAnyChassis = saveData.chassis.some(c => c.status === 'ready')

  // Check if all installed parts on the matching chassis are fully installed
  const hasUnfinishedParts = matchingChassis?.installedParts.some(
    p => p.installDaysLeft !== undefined && p.installDaysLeft > 0
  ) ?? false

  const ready = hasDriver && hasChassis && !hasUnfinishedParts && isRaceDay

  const simulateAndSave = () => {
    if (!ready) return
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

      const result = simulateRace(freshSave, race.track, race.round, race.laps, race.purse)
      const pResult = result.driverResults.find(r => r.isPlayer) ?? null
      setRaceResult(result.driverResults)
      setPlayerResult(pResult)

      // If exhibition, don't update championship standings
      if (!race.isExhibition) {
        const newStandings = updateStandings(standings, result)
        freshSave.standings = newStandings

        // Update owner standings
        let ownerStandings = freshSave.ownerStandings ?? []
        ownerStandings = updateOwnerStandings(ownerStandings, result, freshSave.carNumber || '1', freshSave.selectedTeam?.name ?? 'Player Team', freshSave.selectedTeam?.manufacturer ?? 'Chevrolet')
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

      freshSave.seasonResults = [...(freshSave.seasonResults ?? []), result]
      freshSave.currentWeek = (freshSave.seasonResults.length) + 1
      freshSave.money = Math.max(0, freshSave.money - salaryCost + (pResult?.purseEarned ?? 0))
      if (playerWon) freshSave.totalWins = (freshSave.totalWins ?? 0) + 1

      // Advance date to day after race
      const raceDate = new Date(race.date + 'T12:00:00')
      raceDate.setDate(raceDate.getDate() + 1)
      freshSave.currentDate = raceDate.toISOString().slice(0, 10)

      // Apply talent progression
      const tType = getTrackType(race.track)
      applyTalentProgression(freshSave, result, tType)

      // Apply part wear/damage
      if (pResult) {
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

      // Simulate race without player entry — create a modified save with no driver
      const skippedSave = { ...freshSave, hiredDriver: undefined as any }
      const result = simulateRace(skippedSave, race.track, race.round, race.laps, race.purse)

      // Player gets no results
      setRaceResult(result.driverResults)
      setPlayerResult(null)

      if (!race.isExhibition) {
        const newStandings = updateStandings(standings, result)
        freshSave.standings = newStandings

        let ownerStandings = freshSave.ownerStandings ?? []
        ownerStandings = updateOwnerStandings(ownerStandings, result, freshSave.carNumber || '1', freshSave.selectedTeam?.name ?? 'Player Team', freshSave.selectedTeam?.manufacturer ?? 'Chevrolet')
        freshSave.ownerStandings = ownerStandings
      } else {
        freshSave.standings = standings
      }

      freshSave.seasonResults = [...(freshSave.seasonResults ?? []), result]
      freshSave.currentWeek = (freshSave.seasonResults.length) + 1

      // Advance date to day after race
      const raceDate = new Date(race.date + 'T12:00:00')
      raceDate.setDate(raceDate.getDate() + 1)
      freshSave.currentDate = raceDate.toISOString().slice(0, 10)

      // Apply talent progression for AI only
      const tType = getTrackType(race.track)
      applyTalentProgression(freshSave, result, tType)

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
        <div className={styles.roundBadge}>{race.isExhibition ? 'Exhibition' : `Round ${race.round} of ${pointsRaces.length}`}</div>
        <h1 className={styles.raceName}>{race.name}</h1>
        <div className={styles.trackDetails}>
          <span className={styles.trackName}>{race.track}</span>
          <span className={styles.trackMeta}>{formatDate(race.date)}</span>
        </div>
      </div>

      {/* Track Info Card */}
      <div className={styles.trackCard}>
        <div className={styles.trackVisual}>
          <div className={styles.trackShape} data-type={trackType}>
            <span className={styles.trackTypeLabel}>{TRACK_TYPE_LABELS[trackType] ?? trackType}</span>
          </div>
        </div>
        <div className={styles.trackStats}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Length</span>
            <span className={styles.statValue}>{trackInfo?.lengthMiles ?? '?'} mi</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Banking</span>
            <span className={styles.statValue}>{trackInfo?.banking ?? '?'}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Laps</span>
            <span className={styles.statValue}>{race.laps}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Type</span>
            <span className={styles.statValue}>{TRACK_TYPE_LABELS[trackType] ?? trackType}</span>
          </div>
        </div>
      </div>

      {/* PRE-RACE PHASE */}
      {phase === 'pre' && (
        <div className={styles.preRace}>
          <h2 className={styles.sectionTitle}>Pre-Race Checklist</h2>
          <div className={styles.checklist}>
            <div className={`${styles.checkItem} ${hasDriver ? styles.checkGood : styles.checkBad}`}>
              <span className={styles.checkIcon}>{hasDriver ? '✓' : '✗'}</span>
              <div className={styles.checkInfo}>
                <span className={styles.checkTitle}>Driver</span>
                <span className={styles.checkDetail}>
                  {saveData.hiredDriver
                    ? `${saveData.hiredDriver.firstName} ${saveData.hiredDriver.lastName} — ${formatMoney(saveData.hiredDriver.salary)}/season`
                    : 'No driver hired'}
                </span>
              </div>
              {!hasDriver && <button className={styles.fixBtn} onClick={() => navigate('/game/drivers')}>Hire →</button>}
            </div>

            <div className={`${styles.checkItem} ${hasChassis ? styles.checkGood : styles.checkBad}`}>
              <span className={styles.checkIcon}>{hasChassis ? '✓' : '✗'}</span>
              <div className={styles.checkInfo}>
                <span className={styles.checkTitle}>Race Car ({TRACK_TYPE_LABELS[trackType]})</span>
                <span className={styles.checkDetail}>
                  {hasChassis
                    ? `${matchingChassis!.name} — Ready`
                    : hasAnyChassis
                      ? `No ${TRACK_TYPE_LABELS[trackType]} chassis — wrong track type`
                      : 'No chassis ready'}
                </span>
              </div>
              {!hasChassis && <button className={styles.fixBtn} onClick={() => navigate('/game/store')}>Shop →</button>}
            </div>

            <div className={`${styles.checkItem} ${saveData.hiredCrewChief ? styles.checkGood : styles.checkWarn}`}>
              <span className={styles.checkIcon}>{saveData.hiredCrewChief ? '✓' : '!'}</span>
              <div className={styles.checkInfo}>
                <span className={styles.checkTitle}>Crew Chief</span>
                <span className={styles.checkDetail}>
                  {saveData.hiredCrewChief
                    ? `${saveData.hiredCrewChief.firstName} ${saveData.hiredCrewChief.lastName}`
                    : 'None (default crew)'}
                </span>
              </div>
            </div>

            <div className={`${styles.checkItem} ${saveData.hiredSpotter ? styles.checkGood : styles.checkWarn}`}>
              <span className={styles.checkIcon}>{saveData.hiredSpotter ? '✓' : '!'}</span>
              <div className={styles.checkInfo}>
                <span className={styles.checkTitle}>Spotter</span>
                <span className={styles.checkDetail}>
                  {saveData.hiredSpotter
                    ? `${saveData.hiredSpotter.firstName} ${saveData.hiredSpotter.lastName}`
                    : 'None (default spotter)'}
                </span>
              </div>
            </div>

            <div className={`${styles.checkItem} ${(saveData.hiredPitCrew?.length ?? 0) === 5 ? styles.checkGood : styles.checkWarn}`}>
              <span className={styles.checkIcon}>{(saveData.hiredPitCrew?.length ?? 0) === 5 ? '✓' : '!'}</span>
              <div className={styles.checkInfo}>
                <span className={styles.checkTitle}>Pit Crew</span>
                <span className={styles.checkDetail}>
                  {(saveData.hiredPitCrew?.length ?? 0)}/5 members filled
                </span>
              </div>
            </div>

            {hasChassis && hasUnfinishedParts && (
              <div className={`${styles.checkItem} ${styles.checkBad}`}>
                <span className={styles.checkIcon}>✗</span>
                <div className={styles.checkInfo}>
                  <span className={styles.checkTitle}>Parts Installation</span>
                  <span className={styles.checkDetail}>
                    Some parts are still being installed — advance time to complete
                  </span>
                </div>
              </div>
            )}

            {!isRaceDay && (
              <div className={`${styles.checkItem} ${styles.checkBad}`}>
                <span className={styles.checkIcon}>✗</span>
                <div className={styles.checkInfo}>
                  <span className={styles.checkTitle}>Race Day</span>
                  <span className={styles.checkDetail}>
                    No race scheduled for today ({formatDate(currentDate)}) — advance time from the Calendar or Overview
                  </span>
                </div>
              </div>
            )}
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
          {/* Player highlight */}
          {playerResult && (
            <div className={`${styles.playerHighlight} ${playerResult.status !== 'running' ? styles.dnfHighlight : playerResult.finishPos <= 3 ? styles.podiumHighlight : ''}`}>
              <div className={styles.phPos}>
                {playerResult.status !== 'running'
                  ? 'DNF'
                  : `P${playerResult.finishPos}`}
              </div>
              <div className={styles.phInfo}>
                <span className={styles.phName}>{playerResult.driverName}</span>
                <span className={styles.phTeam}>{playerResult.teamName}</span>
                {playerResult.status !== 'running' && (
                  <span className={styles.phDnf}>
                    {playerResult.status === 'dnf_wreck' ? 'Wrecked' :
                     playerResult.status === 'dnf_mechanical' ? 'Mechanical Failure' :
                     'Pit Road Error'}
                    {' — Lap '}{playerResult.lapsCompleted}/{race.laps}
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
