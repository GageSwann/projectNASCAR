import React, { useState, useMemo, useRef, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import styles from './Calendar.module.css'
import { GameContext, TrackType } from '../../types'
import { SCHEDULES, RaceInfo } from '../../data/schedule'
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
}

const TRACK_TYPE_COLORS: Record<string, string> = {
  superspeedway: '#f44336',
  short_track: '#ff9800',
  intermediate: '#4caf50',
  road_course: '#2196f3',
  street: '#9c27b0',
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

const Calendar: React.FC = () => {
  const { saveData, refreshSave } = useOutletContext<GameContext>()
  const seriesId = saveData.selectedSeries?.id ?? 3
  const schedule = saveData.activeSchedule ?? SCHEDULES[seriesId] ?? SCHEDULES[3]
  const currentDate = saveData.currentDate || '2026-01-01'

  const currentDateObj = new Date(currentDate + 'T12:00:00')
  const [viewMonth, setViewMonth] = useState(currentDateObj.getMonth())
  const [selectedRace, setSelectedRace] = useState<RaceInfo | null>(null)

  const year = currentDateObj.getFullYear()

  // Build a map of date -> race for quick lookups
  const racesByDate = useMemo(() => {
    const map = new Map<string, RaceInfo>()
    for (const race of schedule) {
      map.set(race.date, race)
    }
    return map
  }, [schedule])

  const daysInMonth = getDaysInMonth(year, viewMonth)
  const firstDay = getFirstDayOfMonth(year, viewMonth)

  // Build calendar grid cells
  const cells: { day: number; race?: RaceInfo; isPast: boolean; isToday: boolean }[] = []
  for (let i = 0; i < firstDay; i++) {
    cells.push({ day: 0, isPast: false, isToday: false })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const race = racesByDate.get(dateStr)
    const isPast = dateStr < currentDate
    const isToday = dateStr === currentDate
    cells.push({ day: d, race, isPast, isToday })
  }

  const prevMonth = () => setViewMonth(m => Math.max(0, m - 1))
  const nextMonth = () => setViewMonth(m => Math.min(11, m + 1))

  const goToToday = () => setViewMonth(currentDateObj.getMonth())

  // Advance time helper
  const advanceTime = (days: number) => {
    const slotId = getActiveSlotId()
    if (!slotId) return
    const data = loadSlot(slotId)
    if (!data) return

    let newDate = data.currentDate || '2026-01-01'
    for (let i = 0; i < days; i++) {
      newDate = addDays(newDate, 1)
      // Tick down install timers on all chassis parts
      for (const ch of data.chassis) {
        for (const part of ch.installedParts) {
          if (part.installDaysLeft !== undefined && part.installDaysLeft > 0) {
            part.installDaysLeft--
          }
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
  }

  const simToDate = (targetDate: string) => {
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
    const racedRounds = new Set((saveData.seasonResults ?? []).map(r => r.round))
    return schedule.find(r => r.date >= currentDate && !racedRounds.has(r.round)) ?? null
  }, [schedule, currentDate, saveData.seasonResults])

  // Check if today has a race
  const todayRace = racesByDate.get(currentDate)

  const selectedTrackInfo = selectedRace ? getTrack(selectedRace.track) : null
  const selectedTrackType: TrackType = selectedTrackInfo?.type ?? 'intermediate'

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <h1 className={styles.heading}>Race Calendar</h1>
        <div className={styles.dateDisplay}>
          <span className={styles.currentDateLabel}>{formatDateFull(currentDate)}</span>
        </div>
      </div>

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
        {todayRace && (
          <span className={styles.raceTodayBadge}>
            Race Today: {todayRace.name}
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
          Past
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
                  className={`${styles.dayCell} ${cell.day === 0 ? styles.emptyCell : ''} ${cell.race ? styles.raceCell : ''} ${cell.isPast ? styles.completedCell : ''} ${cell.isToday ? styles.currentCell : ''} ${selectedRace && cell.race && selectedRace.date === cell.race.date && selectedRace.name === cell.race.name ? styles.selectedCell : ''} ${isFuture && !cell.race ? styles.clickableCell : ''}`}
                  onClick={() => {
                    if (cell.race) {
                      setSelectedRace(cell.race)
                    } else if (isFuture && cell.day > 0) {
                      simToDate(dateStr)
                    }
                  }}
                  title={isFuture && !cell.race ? `Sim to ${dateStr}` : undefined}
                >
                  {cell.day > 0 && (
                    <>
                      <span className={styles.dayNum}>{cell.day}</span>
                      {cell.race && (() => {
                        const tInfo = getTrack(cell.race.track)
                        const tType = tInfo?.type ?? 'intermediate'
                        return (
                          <span
                            className={styles.raceDot}
                            style={{ background: cell.isPast ? 'var(--text-muted)' : TRACK_TYPE_COLORS[tType] }}
                            title={cell.race.name}
                          />
                        )
                      })()}
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Race detail / schedule list */}
        <div className={styles.detailCol}>
          {selectedRace ? (
            <div className={styles.raceDetail}>
              <div className={styles.raceDetailHeader}>
                {selectedRace.isExhibition ? (
                  <span className={styles.roundBadge} style={{ borderColor: '#ff9800', color: '#ff9800' }}>Exhibition</span>
                ) : (
                  <span className={styles.roundBadge}>Round {selectedRace.round}</span>
                )}
                <span
                  className={styles.trackTypeBadge}
                  style={{ borderColor: TRACK_TYPE_COLORS[selectedTrackType], color: TRACK_TYPE_COLORS[selectedTrackType] }}
                >
                  {TRACK_TYPE_LABELS[selectedTrackType]}
                </span>
              </div>
              <h2 className={styles.raceName}>{selectedRace.name}</h2>
              <span className={styles.trackName}>{selectedRace.track}</span>
              <div className={styles.raceStats}>
                <div className={styles.raceStat}>
                  <span>Date</span>
                  <strong>{new Date(selectedRace.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</strong>
                </div>
                <div className={styles.raceStat}>
                  <span>Laps</span>
                  <strong>{selectedRace.laps}</strong>
                </div>
                <div className={styles.raceStat}>
                  <span>Purse</span>
                  <strong>{formatMoney(selectedRace.purse)}</strong>
                </div>
                {selectedTrackInfo && (
                  <>
                    <div className={styles.raceStat}>
                      <span>Length</span>
                      <strong>{selectedTrackInfo.lengthMiles} mi</strong>
                    </div>
                    <div className={styles.raceStat}>
                      <span>Banking</span>
                      <strong>{selectedTrackInfo.banking}</strong>
                    </div>
                  </>
                )}
              </div>
              <div className={styles.raceStatus}>
                {selectedRace.date < currentDate
                  ? '✓ Past'
                  : selectedRace.date === currentDate
                    ? '► Race Day!'
                    : (() => {
                        const diff = Math.ceil((new Date(selectedRace.date + 'T12:00:00').getTime() - new Date(currentDate + 'T12:00:00').getTime()) / 86400000)
                        return `${diff} day${diff !== 1 ? 's' : ''} away`
                      })()
                }
              </div>
              {selectedRace.date > currentDate && (
                <button className={styles.simToRaceBtn} onClick={() => simToDate(selectedRace.date)}>
                  Sim to Race Day
                </button>
              )}
            </div>
          ) : (
            <div className={styles.noSelection}>
              <p>Select a race on the calendar to view details</p>
            </div>
          )}

          {/* Upcoming races list */}
          <h3 className={styles.subHead}>Season Schedule</h3>
          <div className={styles.scheduleList}>
            {schedule.map((race, idx) => {
              const tInfo = getTrack(race.track)
              const tType = tInfo?.type ?? 'intermediate'
              const isPast = race.date < currentDate
              const isToday = race.date === currentDate
              return (
                <button
                  key={`${race.round}-${race.name}-${idx}`}
                  className={`${styles.scheduleRow} ${isPast ? styles.scheduleCompleted : ''} ${isToday ? styles.scheduleCurrent : ''} ${selectedRace && selectedRace.date === race.date && selectedRace.name === race.name ? styles.scheduleSelected : ''}`}
                  onClick={() => {
                    setSelectedRace(race)
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
                    <span className={styles.schedTrack}>{race.track}</span>
                  </div>
                  <span className={styles.schedDate}>
                    {new Date(race.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  {!isPast && !isToday && (
                    <span
                      className={styles.schedSimBtn}
                      onClick={(e) => { e.stopPropagation(); simToDate(race.date) }}
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
    </div>
  )
}

export default Calendar
