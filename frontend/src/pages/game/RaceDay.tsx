import React, { useState } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import styles from './RaceDay.module.css'
import { GameContext, DriverRaceResult } from '../../types'
import { SCHEDULES } from '../../data/schedule'
import { getTrack } from '../../data/tracks'
import { simulateRace, updateStandings, initializeStandings, applyTalentProgression } from '../../data/raceSim'
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

type Phase = 'pre' | 'simming' | 'results'

const RaceDay: React.FC = () => {
  const { saveData, refreshSave } = useOutletContext<GameContext>()
  const navigate = useNavigate()
  const seriesId = saveData.selectedSeries?.id ?? 3
  const schedule = SCHEDULES[seriesId] ?? SCHEDULES[3]
  const week = saveData.currentWeek
  const seasonOver = week > schedule.length

  const race = schedule[Math.min(week - 1, schedule.length - 1)]
  const trackInfo = getTrack(race.track)
  const trackType = trackInfo?.type ?? 'intermediate'

  const [phase, setPhase] = useState<Phase>('pre')
  const [raceResult, setRaceResult] = useState<DriverRaceResult[] | null>(null)
  const [playerResult, setPlayerResult] = useState<DriverRaceResult | null>(null)

  // Readiness checks
  const hasDriver = !!saveData.hiredDriver
  const hasChassis = saveData.chassis.some(c => c.status === 'ready')
  const ready = hasDriver && hasChassis

  const simulateAndSave = () => {
    if (!ready) return
    setPhase('simming')

    //小delay for UX
    setTimeout(() => {
      // Load fresh from localStorage to avoid stale context
      const slotId = getActiveSlotId()
      if (!slotId) return
      const freshSave = loadSlot(slotId)
      if (!freshSave) return

      // Initialize standings if empty
      let standings = freshSave.standings ?? []
      if (standings.length === 0 && freshSave.hiredDriver) {
        const driverName = `${freshSave.hiredDriver.firstName} ${freshSave.hiredDriver.lastName}`
        standings = initializeStandings(seriesId, freshSave.hiredDriver.id, driverName, freshSave.selectedTeam?.name ?? 'Player Team')
      }

      const result = simulateRace(freshSave, race.track, race.round, race.laps)
      const newStandings = updateStandings(standings, result)

      // Find player result
      const pResult = result.driverResults.find(r => r.isPlayer) ?? null
      setRaceResult(result.driverResults)
      setPlayerResult(pResult)

      // Calculate salary cost for this race (per-season salary / total races)
      const totalRaces = schedule.length
      let salaryCost = 0
      if (freshSave.hiredDriver) salaryCost += freshSave.hiredDriver.salary / totalRaces
      if (freshSave.hiredCrewChief) salaryCost += freshSave.hiredCrewChief.salary / totalRaces
      if (freshSave.hiredSpotter) salaryCost += freshSave.hiredSpotter.salary / totalRaces
      for (const m of (freshSave.hiredPitCrew ?? [])) salaryCost += m.salary / totalRaces
      salaryCost = Math.round(salaryCost)

      // Update wins
      const playerWon = pResult?.finishPos === 1

      // Update save
      freshSave.seasonResults = [...(freshSave.seasonResults ?? []), result]
      freshSave.standings = newStandings
      freshSave.currentWeek = week + 1
      freshSave.money = Math.max(0, freshSave.money - salaryCost)
      if (playerWon) freshSave.totalWins = (freshSave.totalWins ?? 0) + 1

      // Apply talent progression to player driver and AI
      const tType = getTrackType(race.track)
      applyTalentProgression(freshSave, result, tType)

      saveSlot(freshSave)
      refreshSave()
      setPhase('results')
    }, 1200)
  }

  const handleContinue = () => {
    navigate('/game')
  }

  if (seasonOver) {
    return (
      <div className={styles.page}>
        <div className={styles.seasonEnd}>
          <h1>Season Complete!</h1>
          <p>All {schedule.length} races have been run.</p>
          <button className={styles.primaryBtn} onClick={() => navigate('/game/rankings')}>
            View Final Standings
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      {/* Track Header */}
      <div className={styles.trackHeader}>
        <div className={styles.roundBadge}>Round {race.round} of {schedule.length}</div>
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
                <span className={styles.checkTitle}>Race Car</span>
                <span className={styles.checkDetail}>
                  {hasChassis
                    ? `${saveData.chassis.find(c => c.status === 'ready')?.name} — Ready`
                    : 'No chassis ready'}
                </span>
              </div>
              {!hasChassis && <button className={styles.fixBtn} onClick={() => navigate('/game/garage')}>Build →</button>}
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
          </div>

          {/* Race cost summary */}
          <div className={styles.costSummary}>
            <h3>Race Cost Summary</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 0.5rem' }}>Salaries prorated per race ({schedule.length} race season)</p>
            <div className={styles.costRows}>
              {saveData.hiredDriver && (
                <div className={styles.costRow}>
                  <span>Driver Salary</span><span>{formatMoney(Math.round(saveData.hiredDriver.salary / schedule.length))}</span>
                </div>
              )}
              {saveData.hiredCrewChief && (
                <div className={styles.costRow}>
                  <span>Crew Chief</span><span>{formatMoney(Math.round(saveData.hiredCrewChief.salary / schedule.length))}</span>
                </div>
              )}
              {saveData.hiredSpotter && (
                <div className={styles.costRow}>
                  <span>Spotter</span><span>{formatMoney(Math.round(saveData.hiredSpotter.salary / schedule.length))}</span>
                </div>
              )}
              {(saveData.hiredPitCrew ?? []).map(m => (
                <div key={m.id} className={styles.costRow}>
                  <span>Pit: {m.firstName} {m.lastName}</span><span>{formatMoney(Math.round(m.salary / schedule.length))}</span>
                </div>
              ))}
              <div className={`${styles.costRow} ${styles.costTotal}`}>
                <span>Total Per Race</span>
                <span>{formatMoney(Math.round(
                  ((saveData.hiredDriver?.salary ?? 0) +
                  (saveData.hiredCrewChief?.salary ?? 0) +
                  (saveData.hiredSpotter?.salary ?? 0) +
                  (saveData.hiredPitCrew ?? []).reduce((s, m) => s + m.salary, 0)) / schedule.length
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
              </div>
            ))}
          </div>

          <button className={styles.primaryBtn} onClick={handleContinue}>
            Continue to Next Week
          </button>
        </div>
      )}
    </div>
  )
}

export default RaceDay
