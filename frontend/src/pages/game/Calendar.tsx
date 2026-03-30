import React, { useState, useMemo, useRef, useEffect } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import styles from './Calendar.module.css'
import { GameContext, SeasonRaceResult, TrackType } from '../../types'
import { SCHEDULES, RaceInfo, getScheduleForYear } from '../../data/schedule'
import { getTrack } from '../../data/tracks'
import { getActiveSlotId, loadSlot, saveSlot } from '../../services/saveManager'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const TRACK_TYPE_LABELS: Record<TrackType, string> = {
  superspeedway: 'Superspeedway',
  short_track: 'Short Track',
  intermediate: 'Intermediate',
  road_course: 'Road Course',
  street: 'Street Circuit',
  dirt: 'Dirt',
}

const TRACK_TYPE_COLORS: Record<string, string> = {
  superspeedway: '#f44336',
  short_track: '#ff9800',
  intermediate: '#4caf50',
  road_course: '#2196f3',
  dirt: '#8d6e63',
}

type ServiceNotice = {
  installed: string[]
  uninstalled: string[]
}

const REQUIRED_PART_CATEGORIES = ['engine', 'suspension', 'aerodynamics', 'brakes', 'transmission'] as const

function isPartReadyForBuild(part: { item: { category: string }; installDaysLeft?: number; uninstallDaysLeft?: number }) {
  const installDone = part.installDaysLeft === undefined || part.installDaysLeft <= 0
  const notUninstalling = part.uninstallDaysLeft === undefined || part.uninstallDaysLeft <= 0
  return installDone && notUninstalling
}

function formatMoney(n: number) {
  return n >= 1000000 ? `$${(n / 1000000).toFixed(1)}M` : `$${n.toLocaleString()}`
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T12:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function formatDateFull(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

function eventKey(race: Pick<RaceInfo, 'date' | 'name' | 'track'>) {
  return `${race.date}|${race.name}|${race.track}`
}

function getDuelNumber(race: Pick<RaceInfo, 'name'>): 1 | 2 | null {
  if (race.name.startsWith('Duel 1')) return 1
  if (race.name.startsWith('Duel 2')) return 2
  return null
}

const Calendar: React.FC = () => {
  const { saveData, refreshSave } = useOutletContext<GameContext>()
  const navigate = useNavigate()
  const seriesId = saveData.selectedSeries?.id ?? 3
  const currentDate = saveData.currentDate || `${new Date().getFullYear()}-01-01`
  const currentDateObj = new Date(currentDate + 'T12:00:00')
  const year = currentDateObj.getFullYear()
  const schedule = saveData.activeSchedule ?? getScheduleForYear(seriesId, year)

  const [viewMonth, setViewMonth] = useState(currentDateObj.getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [pendingSimDate, setPendingSimDate] = useState<string | null>(null)
  const [showSeasonOver, setShowSeasonOver] = useState(false)
  const [serviceNotice, setServiceNotice] = useState<ServiceNotice | null>(null)
  const [selectedResult, setSelectedResult] = useState<{ race: RaceInfo; result: SeasonRaceResult } | null>(null)

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
        const key = eventKey(race)
        if (keys.has(key)) continue
        keys.add(key)
        remaining -= 1
        if (remaining <= 0) break
      }
    }

    return keys
  }, [saveData.seasonResults, scheduleByDate, currentDate])

  // The season ends the day after the final championship race
  const seasonEndDate = useMemo(() => {
    const pointsRaces = scheduleByDate.filter(r => !r.isExhibition)
    const lastRace = pointsRaces[pointsRaces.length - 1]
    return lastRace ? addDays(lastRace.date, 1) : null
  }, [scheduleByDate])

  // Build a map of date -> races for quick lookups
  const racesByDate = useMemo(() => {
    const map = new Map<string, RaceInfo[]>()
    for (const race of scheduleByDate) {
      const existing = map.get(race.date) ?? []
      existing.push(race)
      map.set(race.date, existing)
    }
    return map
  }, [scheduleByDate])

  const daysInMonth = getDaysInMonth(year, viewMonth)
  const firstDay = getFirstDayOfMonth(year, viewMonth)

  // Build calendar grid cells
  const cells: { day: number; races?: RaceInfo[]; isPast: boolean; isToday: boolean }[] = []
  for (let i = 0; i < firstDay; i++) {
    cells.push({ day: 0, isPast: false, isToday: false })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const races = racesByDate.get(dateStr)
    const isPast = dateStr < currentDate
    const isToday = dateStr === currentDate
    cells.push({ day: d, races, isPast, isToday })
  }

  const prevMonth = () => setViewMonth(m => Math.max(0, m - 1))
  const nextMonth = () => setViewMonth(m => Math.min(11, m + 1))

  const goToToday = () => setViewMonth(currentDateObj.getMonth())

  // Advance time helper
  const advanceTime = (days: number) => {
    const targetDate = addDays(currentDate, days)
    if (seasonEndDate && targetDate >= seasonEndDate) {
      setShowSeasonOver(true)
      return
    }
    const slotId = getActiveSlotId()
    if (!slotId) return
    const data = loadSlot(slotId)
    if (!data) return

    const completedInstalls: string[] = []
    const completedUninstalls: string[] = []

    let newDate = data.currentDate || '2026-01-01'
    for (let i = 0; i < days; i++) {
      newDate = addDays(newDate, 1)
      // Tick down install timers on all chassis parts
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

    // Also advance currentWeek to match the next unplayed championship round
    const sched = data.activeSchedule ?? SCHEDULES[data.selectedSeries?.id ?? 3] ?? SCHEDULES[3]
    const pointsRaces = sched.filter(r => !r.isExhibition)
    const completedRounds = (data.seasonResults ?? []).length
    data.currentWeek = completedRounds + 1

    // Check if season should transition phases
    if (data.seasonPhase === 'preseason') {
      // Move to regular once we hit or pass the first race date
      const firstRace = sched[0]
      if (firstRace && newDate >= firstRace.date) {
        data.seasonPhase = 'regular'
      }
    }
    if (data.seasonPhase === 'regular') {
      const lastRace = pointsRaces[pointsRaces.length - 1]
      if (lastRace && completedRounds >= pointsRaces.length) {
        data.seasonPhase = 'postseason'
      }
    }

    data.lastPlayedAt = new Date().toISOString()
    saveSlot(data)
    refreshSave()

    if (completedInstalls.length > 0 || completedUninstalls.length > 0) {
      setServiceNotice({ installed: completedInstalls, uninstalled: completedUninstalls })
    }
  }

  const simToDate = (targetDate: string) => {
    if (seasonEndDate && targetDate >= seasonEndDate) {
      setShowSeasonOver(true)
      return
    }
    const diff = Math.ceil(
      (new Date(targetDate + 'T12:00:00').getTime() - new Date(currentDate + 'T12:00:00').getTime()) / 86400000
    )
    if (diff > 0) advanceTime(diff)
  }

  // Sim menu state
  const [simOpen, setSimOpen] = useState(false)
  const simRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (simRef.current && !simRef.current.contains(e.target as Node)) {
        setSimOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Next upcoming race
  const nextRace = useMemo(() => {
    return scheduleByDate.find(r => r.date >= currentDate && !completedRaceKeys.has(eventKey(r))) ?? null
  }, [scheduleByDate, currentDate, completedRaceKeys])

  // Check if today has a race
  const todayRaces = racesByDate.get(currentDate) ?? []
  const selectedRaces = selectedDate ? (racesByDate.get(selectedDate) ?? []) : []
  const playerDuelAssignment = saveData.hiredDriver
    ? (saveData.daytonaSpeedweeks?.qualifyingOrder.find((q) => q.driverId === saveData.hiredDriver!.id)?.duel ?? null)
    : null

  const resultsByEvent = useMemo(() => {
    const map = new Map<string, SeasonRaceResult>()
    const seasonResults = saveData.seasonResults ?? []
    const consumed = new Set<number>()

    // New saves store explicit race metadata for exact lookup.
    seasonResults.forEach((result, idx) => {
      if (result.raceDate && result.raceName && result.raceTrack) {
        map.set(eventKey({ date: result.raceDate, name: result.raceName, track: result.raceTrack }), result)
        consumed.add(idx)
      }
    })

    // Fallback for legacy saves: pair remaining results to completed events by chronological order.
    const unresolved = seasonResults.filter((_, idx) => !consumed.has(idx))
    const completedEvents = scheduleByDate.filter((race) => race.date < currentDate || race.date === currentDate)
    let pointer = 0
    for (const race of completedEvents) {
      const key = eventKey(race)
      if (map.has(key)) continue
      if (pointer >= unresolved.length) break
      map.set(key, unresolved[pointer])
      pointer += 1
    }

    return map
  }, [saveData.seasonResults, scheduleByDate, currentDate])

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <h1 className={styles.heading}>Race Calendar</h1>
        <div className={styles.dateDisplay}>
          <span className={styles.currentDateLabel}>{formatDateFull(currentDate)}</span>
        </div>
      </div>

      {serviceNotice && (
        <div className={styles.serviceNotice}>
          <div className={styles.serviceNoticeHead}>
            <strong>Garage Update</strong>
            <button className={styles.serviceDismiss} onClick={() => setServiceNotice(null)}>Dismiss</button>
          </div>

          {serviceNotice.installed.length > 0 && (
            <div className={styles.serviceGroup}>
              <span className={styles.serviceLabel}>Installed</span>
              <p className={styles.serviceText}>{serviceNotice.installed.join(' • ')}</p>
            </div>
          )}

          {serviceNotice.uninstalled.length > 0 && (
            <div className={styles.serviceGroup}>
              <span className={`${styles.serviceLabel} ${styles.uninstallLabel}`}>Uninstalled</span>
              <p className={styles.serviceText}>{serviceNotice.uninstalled.join(' • ')}</p>
            </div>
          )}
        </div>
      )}

      {/* Sim Controls */}
      <div className={styles.advanceBar}>
        <div className={styles.simDropdown} ref={simRef}>
          <button className={styles.simBtn} onClick={() => setSimOpen(o => !o)}>
            Simulate ▼
          </button>
          {simOpen && (
            <div className={styles.simMenu}>
              <button className={styles.simOption} onClick={() => { setSimOpen(false); advanceTime(1) }}>Sim 1 Day</button>
              <button className={styles.simOption} onClick={() => { setSimOpen(false); advanceTime(7) }}>Sim 1 Week</button>
              {nextRace && (
                <button className={styles.simOption} onClick={() => { setSimOpen(false); simToDate(nextRace.date) }}>
                  Sim to Next Race
                </button>
              )}
            </div>
          )}
        </div>
        {todayRaces.length > 0 && (
          <span className={styles.raceTodayBadge}>
            {todayRaces.length === 1 ? `Race Today: ${todayRaces[0].name}` : `${todayRaces.length} Events Today`}
          </span>
        )}
      </div>

      {/* Legend */}
      <div className={styles.legend}>
        {Object.entries(TRACK_TYPE_COLORS).map(([type, color]) => (
          <span key={type} className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: color }} />
            {TRACK_TYPE_LABELS[type as TrackType]}
          </span>
        ))}
        <span className={styles.legendItem}>
          <span className={styles.legendDot} style={{ background: 'var(--text-muted)', opacity: 0.4 }} />
          Complete
        </span>
      </div>

      <div className={styles.calendarLayout}>
        {/* Calendar grid */}
        <div className={styles.calendarCol}>
          <div className={styles.monthNav}>
            <button className={styles.navBtn} onClick={prevMonth} disabled={viewMonth === 0}>&#9664;</button>
            <span className={styles.monthLabel}>
              {MONTHS[viewMonth]} {year}
              {viewMonth !== currentDateObj.getMonth() && (
                <button className={styles.todayBtn} onClick={goToToday}>Today</button>
              )}
            </span>
            <button className={styles.navBtn} onClick={nextMonth} disabled={viewMonth === 11}>&#9654;</button>
          </div>

          <div className={styles.calGrid}>
            {DAYS_OF_WEEK.map(d => (
              <div key={d} className={styles.dayHeader}>{d}</div>
            ))}
            {cells.map((cell, i) => {
              const dateStr = cell.day > 0 ? `${year}-${String(viewMonth + 1).padStart(2, '0')}-${String(cell.day).padStart(2, '0')}` : ''
              const isFuture = dateStr > currentDate
              return (
                <div
                  key={i}
                  className={`${styles.dayCell} ${cell.day === 0 ? styles.emptyCell : ''} ${cell.races?.length ? styles.raceCell : ''} ${cell.isPast ? styles.completedCell : ''} ${cell.isToday ? styles.currentCell : ''} ${selectedDate && dateStr === selectedDate ? styles.selectedCell : ''} ${isFuture && !cell.races?.length ? styles.clickableCell : ''}`}
                  onClick={() => {
                    if (cell.races?.length) {
                      setSelectedDate(dateStr)
                    } else if (isFuture && cell.day > 0) {
                      setPendingSimDate(dateStr)
                    }
                  }}
                  title={isFuture && !cell.races?.length ? `Click to sim to ${dateStr}` : undefined}
                >
                  {cell.day > 0 && (
                    <>
                      <span className={styles.dayNum}>{cell.day}</span>
                      {cell.races && (
                        <span className={styles.raceDots}>
                          {cell.races.slice(0, 3).map((race, idx) => {
                            const tInfo = getTrack(race.track)
                            const tType = tInfo?.type ?? 'intermediate'
                            return (
                              <span
                                key={`${race.name}-${idx}`}
                                className={styles.raceDot}
                                style={{ background: cell.isPast ? 'var(--text-muted)' : TRACK_TYPE_COLORS[tType] }}
                                title={race.name}
                              />
                            )
                          })}
                          {cell.races.length > 3 && <span className={styles.raceCount}>+{cell.races.length - 3}</span>}
                        </span>
                      )}
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Race detail / schedule list */}
        <div className={styles.detailCol}>
          {selectedRaces.length > 0 ? (
            <div className={styles.raceDetail}>
              <h2 className={styles.raceGroupTitle}>{formatDateFull(selectedRaces[0].date)}</h2>
              <div className={styles.sameDayList}>
                {selectedRaces.map((race, idx) => {
                  const selectedTrackInfo = getTrack(race.track)
                  const selectedTrackType: TrackType = selectedTrackInfo?.type ?? 'intermediate'
                  const trackDisplayName = selectedTrackInfo ? `${race.track} (${selectedTrackInfo.location})` : race.track
                  return (
                    <div key={`${race.name}-${idx}`} className={styles.sameDayItem}>
                      <div className={styles.raceDetailHeader}>
                        {race.isExhibition ? (
                          <span className={styles.roundBadge} style={{ borderColor: '#ff9800', color: '#ff9800' }}>Exhibition</span>
                        ) : (
                          <span className={styles.roundBadge}>Round {race.round}</span>
                        )}
                        {playerDuelAssignment && getDuelNumber(race) === playerDuelAssignment && (
                          <span className={styles.roundBadge} style={{ borderColor: '#4caf50', color: '#4caf50' }}>Your Duel</span>
                        )}
                        <span
                          className={styles.trackTypeBadge}
                          style={{ borderColor: TRACK_TYPE_COLORS[selectedTrackType], color: TRACK_TYPE_COLORS[selectedTrackType] }}
                        >
                          {TRACK_TYPE_LABELS[selectedTrackType]}
                        </span>
                      </div>
                      <h3 className={styles.raceName}>{race.name}</h3>
                      <span className={styles.trackName}>{trackDisplayName}</span>
                      <div className={styles.raceStats}>
                        <div className={styles.raceStat}>
                          <span>Laps</span>
                          <strong>{race.laps}</strong>
                        </div>
                        <div className={styles.raceStat}>
                          <span>Purse</span>
                          <strong>{formatMoney(race.purse)}</strong>
                        </div>
                        {selectedTrackInfo && (
                          <>
                            <div className={styles.raceStat}>
                              <span>Length</span>
                              <strong>{selectedTrackInfo.lengthMiles} mi</strong>
                            </div>
                          </>
                        )}
                      </div>
                      {race.date < currentDate && resultsByEvent.get(eventKey(race)) && (
                        <button
                          className={styles.resultsBtn}
                          onClick={() => setSelectedResult({ race, result: resultsByEvent.get(eventKey(race))! })}
                        >
                          View Results
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
              {selectedRaces[0].date >= currentDate && (
                <div className={styles.raceStatus}>
                  {selectedRaces[0].date === currentDate
                    ? '► Race Day!'
                    : (() => {
                        const diff = Math.ceil((new Date(selectedRaces[0].date + 'T12:00:00').getTime() - new Date(currentDate + 'T12:00:00').getTime()) / 86400000)
                        return `${diff} day${diff !== 1 ? 's' : ''} away`
                      })()
                  }
                </div>
              )}
              {selectedRaces[0].date > currentDate && (
                <button className={styles.simToRaceBtn} onClick={() => setPendingSimDate(selectedRaces[0].date)}>
                  Sim to Race Day
                </button>
              )}
            </div>
          ) : (
            <div className={styles.noSelection}>
              <p>Select a date on the calendar to view its event details</p>
            </div>
          )}

          {/* Upcoming races list */}
          <h3 className={styles.subHead}>Season Schedule</h3>
          <div className={styles.scheduleList}>
            {scheduleByDate.map((race, idx) => {
              const tInfo = getTrack(race.track)
              const tType = tInfo?.type ?? 'intermediate'
              const trackDisplayName = tInfo ? `${race.track} (${tInfo.location})` : race.track
              const isPast = race.date < currentDate
              const isToday = race.date === currentDate
              return (
                <button
                  key={`${race.round}-${race.name}-${idx}`}
                  className={`${styles.scheduleRow} ${isPast ? styles.scheduleCompleted : ''} ${isToday ? styles.scheduleCurrent : ''} ${selectedDate === race.date ? styles.scheduleSelected : ''}`}
                  onClick={() => {
                    setSelectedDate(race.date)
                    const d = new Date(race.date + 'T12:00:00')
                    setViewMonth(d.getMonth())
                  }}
                >
                  <span className={styles.schedRound}>
                    {race.isExhibition ? 'EX' : race.round}
                  </span>
                  <span
                    className={styles.schedDot}
                    style={{ background: isPast ? 'var(--text-muted)' : TRACK_TYPE_COLORS[tType] }}
                  />
                  <div className={styles.schedInfo}>
                    <span className={styles.schedName}>{race.name}</span>
                    <span className={styles.schedTrack}>{trackDisplayName}</span>
                  </div>
                  <span className={styles.schedDate}>
                    {new Date(race.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  {!isPast && !isToday && (
                    <span
                      className={styles.schedSimBtn}
                      onClick={(e) => { e.stopPropagation(); setPendingSimDate(race.date) }}
                      title="Sim to this race"
                    >
                      ▶
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Sim Confirm Popup */}
      {pendingSimDate && (
        <div className={styles.confirmOverlay} onClick={() => setPendingSimDate(null)}>
          <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.confirmTitle}>Simulate Time</h3>
            <p className={styles.confirmText}>
              Advance to <strong>{formatDateFull(pendingSimDate)}</strong>?
            </p>
            <p className={styles.confirmDays}>
              {(() => {
                const diff = Math.ceil((new Date(pendingSimDate + 'T12:00:00').getTime() - new Date(currentDate + 'T12:00:00').getTime()) / 86400000)
                return `${diff} day${diff !== 1 ? 's' : ''} will pass`
              })()}
            </p>
            <div className={styles.confirmBtns}>
              <button className={styles.confirmCancel} onClick={() => setPendingSimDate(null)}>Cancel</button>
              <button className={styles.confirmOk} onClick={() => {
                if (seasonEndDate && pendingSimDate >= seasonEndDate) {
                  setPendingSimDate(null)
                  setShowSeasonOver(true)
                  return
                }
                simToDate(pendingSimDate)
                setPendingSimDate(null)
              }}>Simulate</button>
            </div>
          </div>
        </div>
      )}

      {/* Season Over Popup */}
      {showSeasonOver && (
        <div className={styles.confirmOverlay} onClick={() => setShowSeasonOver(false)}>
          <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.confirmTitle}>Season Complete!</h3>
            <p className={styles.confirmText}>
              The <strong>{saveData.selectedSeries?.name ?? 'series'}</strong> season is over.
              The championship race has wrapped up — it’s time to head to the offseason.
            </p>
            <p className={styles.confirmText} style={{ marginTop: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Review your season results, build next year’s schedule, and get ready for {(saveData.currentSeason ?? 2026) + 1}.
            </p>
            <div className={styles.confirmBtns}>
              <button className={styles.confirmCancel} onClick={() => setShowSeasonOver(false)}>Stay on Calendar</button>
              <button className={styles.confirmOk} onClick={() => { setShowSeasonOver(false); navigate('/game/offseason') }}>Go to Offseason →</button>
            </div>
          </div>
        </div>
      )}

      {/* Past Event Results Popup */}
      {selectedResult && (
        <div className={styles.confirmOverlay} onClick={() => setSelectedResult(null)}>
          <div className={styles.resultsModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.resultsModalHeader}>
              <h3 className={styles.confirmTitle}>Race Results</h3>
              <button className={styles.confirmCancel} onClick={() => setSelectedResult(null)}>Close</button>
            </div>

            <p className={styles.resultsRaceName}>{selectedResult.race.name}</p>
            <p className={styles.resultsRaceMeta}>
              {selectedResult.race.track} • {formatDateFull(selectedResult.race.date)}
            </p>

            <div className={styles.resultsTable}>
              <div className={styles.resultsHeadRow}>
                <span>Pos</span>
                <span>Driver</span>
                <span>Team</span>
                <span>Status</span>
                <span>Pts</span>
                <span>Purse</span>
              </div>
              {selectedResult.result.driverResults.map((row) => (
                <div key={`${row.driverId}-${row.finishPos}-${row.carNumber}`} className={styles.resultsDataRow}>
                  <span>{row.finishPos}</span>
                  <span>{row.driverName}</span>
                  <span>{row.teamName}</span>
                  <span>
                    {row.status === 'running' ? 'Finished' :
                     row.status === 'dns' ? 'DNS' :
                     row.status === 'dnf_wreck' ? 'Wreck' :
                     row.status === 'dnf_mechanical' ? 'Mechanical' : 'Pit Error'}
                  </span>
                  <span>{row.pointsEarned}</span>
                  <span>{formatMoney(row.purseEarned)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Calendar
