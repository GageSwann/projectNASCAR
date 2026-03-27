import React, { useState, useMemo } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import styles from './OffSeason.module.css'
import {
  GameContext,
  RaceScheduleEntry,
  DRIVER_CHAMPIONSHIP_PURSE,
  OWNER_CHAMPIONSHIP_PURSE,
} from '../../types'
import { getScheduleForYear, EXHIBITION_SLOTS, SERIES_RACE_COUNT, ExhibitionSlot } from '../../data/schedule'
import { TRACKS } from '../../data/tracks'
import { getActiveSlotId, loadSlot, saveSlot } from '../../services/saveManager'

const formatMoney = (n: number) =>
  n >= 1000000 ? `$${(n / 1000000).toFixed(1)}M` : `$${n.toLocaleString()}`

type Tab = 'summary' | 'schedule' | 'start'

const DEFAULT_LAPS: Record<string, number> = {
  superspeedway: 200,
  intermediate: 267,
  short_track: 400,
  road_course: 70,
  dirt: 150,
}

const DEFAULT_PURSE = 5000000

const OffSeason: React.FC = () => {
  const { saveData, refreshSave } = useOutletContext<GameContext>()
  const navigate = useNavigate()
  const seriesId = saveData.selectedSeries?.id ?? 3
  const nextYear = saveData.currentSeason + 1
  const maxRaces = SERIES_RACE_COUNT[seriesId] ?? 36

  const [tab, setTab] = useState<Tab>('summary')

  // Regular championship races (no exhibitions)
  const [customRaces, setCustomRaces] = useState<RaceScheduleEntry[]>(
    saveData.customSchedule?.filter(r => !r.isExhibition) ?? []
  )

  // Exhibition events — always present, track/date editable
  const defaultExhibitions = EXHIBITION_SLOTS[seriesId] ?? []
  const savedExhibitions = saveData.customSchedule?.filter(r => r.isExhibition) ?? []
  const [exhibitions, setExhibitions] = useState<RaceScheduleEntry[]>(
    savedExhibitions.length === defaultExhibitions.length
      ? savedExhibitions
      : defaultExhibitions.map((ex: ExhibitionSlot) => ({
          round: 0,
          name: ex.name,
          track: ex.defaultTrack,
          date: `${nextYear}-${ex.defaultDateMMDD}`,
          laps: ex.laps,
          purse: ex.purse,
          isExhibition: true,
        }))
  )

  // Championship standings
  const driverStandings = useMemo(
    () => [...(saveData.standings ?? [])].sort((a, b) => b.points - a.points || b.wins - a.wins),
    [saveData.standings]
  )
  const ownerStandings = useMemo(
    () => [...(saveData.ownerStandings ?? [])].sort((a, b) => b.points - a.points || b.wins - a.wins),
    [saveData.ownerStandings]
  )

  // Player positions
  const playerDriverPos = driverStandings.findIndex(s => s.isPlayer) + 1
  const playerOwnerPos = ownerStandings.findIndex(s => s.isPlayer) + 1

  const driverPurse = DRIVER_CHAMPIONSHIP_PURSE[seriesId] ?? {}
  const ownerPurse = OWNER_CHAMPIONSHIP_PURSE[seriesId] ?? {}

  const playerDriverPayout = driverPurse[playerDriverPos] ?? 0
  const playerOwnerPayout = ownerPurse[playerOwnerPos] ?? 0

  // Owner age calculation
  const ownerAge = saveData.currentSeason - saveData.owner.birthYear
  const maxAge = saveData.maxAge ?? 65
  const canContinue = ownerAge < maxAge

  // ---------- Schedule Builder ----------
  const addRace = (trackName: string) => {
    if (customRaces.length >= maxRaces) return
    const track = TRACKS.find(t => t.name === trackName)
    if (!track) return
    const round = customRaces.length + 1
    // Space races ~1 week apart starting mid-Feb
    const baseDate = new Date(`${nextYear}-02-15T12:00:00`)
    baseDate.setDate(baseDate.getDate() + (round - 1) * 7)
    const dateStr = baseDate.toISOString().slice(0, 10)
    const laps = DEFAULT_LAPS[track.type] ?? 200
    setCustomRaces(prev => [
      ...prev,
      { round, name: `Race ${round} at ${track.name}`, track: track.name, date: dateStr, laps, purse: DEFAULT_PURSE },
    ])
  }

  const removeRace = (index: number) => {
    setCustomRaces(prev => {
      const next = prev.filter((_, i) => i !== index)
      return next.map((r, i) => ({ ...r, round: i + 1 }))
    })
  }

  const updateRace = (index: number, field: keyof RaceScheduleEntry, value: string | number) => {
    setCustomRaces(prev =>
      prev.map((r, i) => (i === index ? { ...r, [field]: value } : r))
    )
  }

  const updateExhibition = (index: number, field: 'track' | 'date' | 'laps', value: string | number) => {
    setExhibitions(prev =>
      prev.map((ex, i) => (i === index ? { ...ex, [field]: value } : ex))
    )
  }

  const useDefaultSchedule = () => {
    setCustomRaces([])
    // Reset exhibitions back to defaults
    setExhibitions(
      defaultExhibitions.map((ex: ExhibitionSlot) => ({
        round: 0,
        name: ex.name,
        track: ex.defaultTrack,
        date: `${nextYear}-${ex.defaultDateMMDD}`,
        laps: ex.laps,
        purse: ex.purse,
        isExhibition: true,
      }))
    )
  }

  // ---------- Start New Season ----------
  const startNewSeason = () => {
    const slotId = getActiveSlotId()
    if (!slotId) return
    const fresh = loadSlot(slotId)
    if (!fresh) return

    // Award championship purses
    fresh.driverChampionshipEarnings = (fresh.driverChampionshipEarnings ?? 0) + playerDriverPayout
    fresh.ownerChampionshipEarnings = (fresh.ownerChampionshipEarnings ?? 0) + playerOwnerPayout
    fresh.money += playerDriverPayout + playerOwnerPayout

    // Reset for new season
    fresh.currentSeason += 1
    fresh.currentDate = `${fresh.currentSeason}-01-01`
    fresh.currentWeek = 1
    fresh.seasonResults = []
    fresh.standings = []
    fresh.ownerStandings = []
    fresh.seasonPhase = 'preseason'

    // Set active schedule for the new season (using the already-incremented year)
    // Combine exhibition events + regular races into one ordered list
    if (customRaces.length > 0) {
      const combined: RaceScheduleEntry[] = [...exhibitions, ...customRaces]
      fresh.customSchedule = combined
      fresh.activeSchedule = combined
    } else {
      // Default schedule already contains the correct exhibitions via getScheduleForYear
      fresh.customSchedule = undefined
      fresh.activeSchedule = getScheduleForYear(seriesId, fresh.currentSeason)
    }

    saveSlot(fresh)
    refreshSave()
    navigate('/game')
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Offseason — Season {saveData.currentSeason}</h1>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button className={`${styles.tab} ${tab === 'summary' ? styles.tabActive : ''}`} onClick={() => setTab('summary')}>
          Season Summary
        </button>
        <button className={`${styles.tab} ${tab === 'schedule' ? styles.tabActive : ''}`} onClick={() => setTab('schedule')}>
          Schedule Builder
        </button>
        <button className={`${styles.tab} ${tab === 'start' ? styles.tabActive : ''}`} onClick={() => setTab('start')}>
          Start Season {saveData.currentSeason + 1}
        </button>
      </div>

      {/* SUMMARY TAB */}
      {tab === 'summary' && (
        <div className={styles.summarySection}>
          {/* Driver Championship */}
          <div className={styles.standingsBlock}>
            <h2>Driver Championship</h2>
            <div className={styles.payoutHighlight}>
              <span>Your Finish: P{playerDriverPos || '—'}</span>
              <span className={styles.payoutAmount}>
                {playerDriverPayout > 0 ? `+${formatMoney(playerDriverPayout)}` : '—'}
              </span>
            </div>
            <div className={styles.standingsTable}>
              <div className={styles.standingsHeader}>
                <span className={styles.sCol1}>Pos</span>
                <span className={styles.sCol2}>Driver</span>
                <span className={styles.sCol3}>Pts</span>
                <span className={styles.sCol4}>Wins</span>
                <span className={styles.sCol5}>Payout</span>
              </div>
              {driverStandings.slice(0, 20).map((s, i) => (
                <div key={s.driverId} className={`${styles.standingsRow} ${s.isPlayer ? styles.playerRow : ''}`}>
                  <span className={styles.sCol1}>{i + 1}</span>
                  <span className={styles.sCol2}>{s.driverName}</span>
                  <span className={styles.sCol3}>{s.points}</span>
                  <span className={styles.sCol4}>{s.wins}</span>
                  <span className={styles.sCol5}>{driverPurse[i + 1] ? formatMoney(driverPurse[i + 1]) : '—'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Owner Championship */}
          <div className={styles.standingsBlock}>
            <h2>Owner Championship</h2>
            <div className={styles.payoutHighlight}>
              <span>Your Finish: P{playerOwnerPos || '—'}</span>
              <span className={styles.payoutAmount}>
                {playerOwnerPayout > 0 ? `+${formatMoney(playerOwnerPayout)}` : '—'}
              </span>
            </div>
            <div className={styles.standingsTable}>
              <div className={styles.standingsHeader}>
                <span className={styles.sCol1}>Pos</span>
                <span className={styles.sCol2}>Team</span>
                <span className={styles.sCol3}>Car #</span>
                <span className={styles.sCol4}>Pts</span>
                <span className={styles.sCol5}>Payout</span>
              </div>
              {ownerStandings.slice(0, 20).map((s, i) => (
                <div key={`${s.carNumber}-${s.teamName}`} className={`${styles.standingsRow} ${s.isPlayer ? styles.playerRow : ''}`}>
                  <span className={styles.sCol1}>{i + 1}</span>
                  <span className={styles.sCol2}>{s.teamName}</span>
                  <span className={styles.sCol3}>#{s.carNumber}</span>
                  <span className={styles.sCol4}>{s.points}</span>
                  <span className={styles.sCol5}>{ownerPurse[i + 1] ? formatMoney(ownerPurse[i + 1]) : '—'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SCHEDULE BUILDER TAB */}
      {tab === 'schedule' && (
        <div className={styles.schedulerSection}>
          <p className={styles.schedulerInfo}>
            Build a custom schedule for Season {nextYear}. Exhibition events are always included (track &amp; date are editable).
            Add up to <strong>{maxRaces}</strong> regular races.
          </p>

          {/* --- Exhibition events (always present) --- */}
          <div className={styles.exhibitionBlock}>
            <div className={styles.exhibitionHeader}>
              <span>Exhibition Events</span>
              <span className={styles.exhibitionNote}>Required every season — change track/date as you like</span>
            </div>
            {exhibitions.map((ex, i) => (
              <div key={ex.name} className={styles.raceRow}>
                <span className={styles.exBadge}>EX</span>
                <span className={styles.raceName}>{ex.name}</span>
                <select
                  className={styles.trackSelectInline}
                  value={ex.track}
                  onChange={e => updateExhibition(i, 'track', e.target.value)}
                >
                  {TRACKS.map(t => (
                    <option key={t.id} value={t.name}>{t.name}</option>
                  ))}
                </select>
                <input
                  className={styles.raceDateInput}
                  type="date"
                  value={ex.date}
                  onChange={e => updateExhibition(i, 'date', e.target.value)}
                />
                <input
                  className={styles.raceLapsInput}
                  type="number"
                  min={10}
                  max={300}
                  value={ex.laps}
                  onChange={e => updateExhibition(i, 'laps', parseInt(e.target.value) || 60)}
                />
                <span className={styles.raceLapsLabel}>laps</span>
              </div>
            ))}
          </div>

          {/* --- Regular races --- */}
          <div className={styles.addTrackRow}>
            <select
              id="track-select"
              className={styles.trackSelect}
              defaultValue=""
              disabled={customRaces.length >= maxRaces}
              onChange={e => {
                if (e.target.value) {
                  addRace(e.target.value)
                  e.target.value = ''
                }
              }}
            >
              <option value="" disabled>
                {customRaces.length >= maxRaces ? `Max ${maxRaces} races reached` : 'Add a race...'}
              </option>
              {TRACKS.map(t => (
                <option key={t.id} value={t.name}>
                  {t.name} ({t.type})
                </option>
              ))}
            </select>
            <span className={styles.raceCounter}>{customRaces.length} / {maxRaces}</span>
            <button className={styles.defaultBtn} onClick={useDefaultSchedule}>
              Use Default Schedule
            </button>
          </div>

          {customRaces.length === 0 ? (
            <p className={styles.emptyMsg}>No custom races added — default {maxRaces}-race schedule will be used.</p>
          ) : (
            <div className={styles.raceList}>
              {customRaces.map((r, i) => (
                <div key={i} className={styles.raceRow}>
                  <span className={styles.raceRound}>R{r.round}</span>
                  <span className={styles.raceTrack}>{r.track}</span>
                  <input
                    className={styles.raceDateInput}
                    type="date"
                    value={r.date}
                    onChange={e => updateRace(i, 'date', e.target.value)}
                  />
                  <input
                    className={styles.raceLapsInput}
                    type="number"
                    min={10}
                    max={600}
                    value={r.laps}
                    onChange={e => updateRace(i, 'laps', parseInt(e.target.value) || 100)}
                  />
                  <span className={styles.raceLapsLabel}>laps</span>
                  <button className={styles.removeBtn} onClick={() => removeRace(i)}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* START NEW SEASON TAB */}
      {tab === 'start' && (
        <div className={styles.startSection}>
          <div className={styles.startCard}>
            <h2>Ready for Season {saveData.currentSeason + 1}?</h2>
            <div className={styles.startDetails}>
              <div className={styles.startRow}>
                <span>Owner Age</span>
                <span>{ownerAge} / {maxAge}</span>
              </div>
              <div className={styles.startRow}>
                <span>Driver Championship Payout</span>
                <span className={styles.payoutGreen}>{playerDriverPayout > 0 ? `+${formatMoney(playerDriverPayout)}` : '—'}</span>
              </div>
              <div className={styles.startRow}>
                <span>Owner Championship Payout</span>
                <span className={styles.payoutGreen}>{playerOwnerPayout > 0 ? `+${formatMoney(playerOwnerPayout)}` : '—'}</span>
              </div>
              <div className={styles.startRow}>
                <span>Schedule</span>
                <span>{customRaces.length > 0 ? `Custom (${customRaces.length} races + ${exhibitions.length} exhibition)` : 'Default'}</span>
              </div>
            </div>
            {canContinue ? (
              <button className={styles.startBtn} onClick={startNewSeason}>
                Start Season {saveData.currentSeason + 1}
              </button>
            ) : (
              <div className={styles.retired}>
                <h3>Career Complete</h3>
                <p>You have reached the maximum age of {maxAge}. Your career is over after {saveData.currentSeason - saveData.owner.birthYear - 25} seasons!</p>
                <button className={styles.menuBtn} onClick={() => navigate('/')}>
                  Return to Main Menu
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default OffSeason
