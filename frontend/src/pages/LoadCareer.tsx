import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './LoadCareer.module.css'
import { LocalCareerFile, SaveSlotData, Team } from '../types'
import { getAllSlots, loadSlot, deleteSlot, saveSlot, setActiveSlotId } from '../services/saveManager'

const SLOT_COUNT = 5
const DEFAULT_ORG_STATS = { championshipWins: 0, raceWins: 0, top5s: 0, top10s: 0, poles: 0, races: 0, dnfs: 0 }

type PendingImportCandidate =
  | { format: 'full'; slotId: number; parsed: SaveSlotData }
  | { format: 'legacy'; slotId: number; parsed: LocalCareerFile }

function formatSaveDate(currentDate?: string): string {
  if (!currentDate) {
    return 'Date unavailable'
  }

  const parsedDate = new Date(`${currentDate}T12:00:00`)
  if (Number.isNaN(parsedDate.getTime())) {
    return currentDate
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(parsedDate)
}

function sanitizeFileSegment(value: string): string {
  const sanitized = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return sanitized || 'career'
}

const LoadCareer: React.FC = () => {
  const navigate = useNavigate()
  const [toMenu, setToMenu] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const backTimerRef = useRef<number | null>(null)
  const [importError, setImportError] = useState('')
  const [slots, setSlots] = useState<(SaveSlotData | null)[]>([])
  const [importTargetSlotId, setImportTargetSlotId] = useState<number | null>(null)
  const [confirmImportSlotId, setConfirmImportSlotId] = useState<number | null>(null)
  const [pendingImportCandidate, setPendingImportCandidate] = useState<PendingImportCandidate | null>(null)

  useEffect(() => {
    setSlots(getAllSlots())
    return () => {
      if (backTimerRef.current !== null) {
        window.clearTimeout(backTimerRef.current)
      }
    }
  }, [])

  const handleBackClick = () => {
    if (toMenu) {
      return
    }

    setToMenu(true)
    backTimerRef.current = window.setTimeout(() => {
      navigate('/')
    }, 400)
  }

  const isValidTeam = (team: unknown): team is Team => {
    if (!team || typeof team !== 'object') {
      return false
    }

    const candidate = team as Record<string, unknown>

    return (
      typeof candidate.id === 'number' &&
      typeof candidate.name === 'string' &&
      typeof candidate.founded_year === 'number' &&
      typeof candidate.base_city === 'string' &&
      typeof candidate.budget === 'number' &&
      typeof candidate.reputation === 'number' &&
      typeof candidate.garage_rating === 'number' &&
      typeof candidate.headquarters === 'string'
    )
  }

  const isValidOwner = (owner: unknown): owner is SaveSlotData['owner'] => {
    if (!owner || typeof owner !== 'object') {
      return false
    }

    const candidate = owner as Record<string, unknown>
    return (
      typeof candidate.firstName === 'string' &&
      typeof candidate.lastName === 'string' &&
      typeof candidate.nationality === 'string' &&
      typeof candidate.birthMonth === 'number' &&
      typeof candidate.birthDay === 'number' &&
      typeof candidate.birthYear === 'number'
    )
  }

  const isValidCareerFile = (value: unknown): value is LocalCareerFile => {
    if (!value || typeof value !== 'object') {
      return false
    }

    const candidate = value as Record<string, unknown>
    return typeof candidate.playerName === 'string' && isValidTeam(candidate.selectedTeam)
  }

  const isValidFullSaveFile = (value: unknown): value is SaveSlotData => {
    if (!value || typeof value !== 'object') {
      return false
    }

    const candidate = value as Record<string, unknown>
    return (
      typeof candidate.slotId === 'number' &&
      typeof candidate.createdAt === 'string' &&
      typeof candidate.lastPlayedAt === 'string' &&
      isValidOwner(candidate.owner) &&
      typeof candidate.money === 'number' &&
      Array.isArray(candidate.chassis) &&
      Array.isArray(candidate.inventory) &&
      typeof candidate.currentWeek === 'number' &&
      typeof candidate.currentSeason === 'number'
    )
  }

  const buildImportedSave = (parsed: SaveSlotData, targetSlotId: number): SaveSlotData => ({
    ...parsed,
    slotId: targetSlotId,
    lastPlayedAt: new Date().toISOString(),
    chassis: Array.isArray(parsed.chassis) ? parsed.chassis : [],
    inventory: Array.isArray(parsed.inventory) ? parsed.inventory : [],
    hiredPitCrew: Array.isArray(parsed.hiredPitCrew) ? parsed.hiredPitCrew : [],
    hiredDrivers: Array.isArray(parsed.hiredDrivers) ? parsed.hiredDrivers : [],
    hiredCrewChiefs: Array.isArray(parsed.hiredCrewChiefs) ? parsed.hiredCrewChiefs : [],
    hiredSpotters: Array.isArray(parsed.hiredSpotters) ? parsed.hiredSpotters : [],
    hiredPitCrews: Array.isArray(parsed.hiredPitCrews) ? parsed.hiredPitCrews : [],
    carEntries: Array.isArray(parsed.carEntries) ? parsed.carEntries : [],
    seasonResults: Array.isArray(parsed.seasonResults) ? parsed.seasonResults : [],
    standings: Array.isArray(parsed.standings) ? parsed.standings : [],
    ownerStandings: Array.isArray(parsed.ownerStandings) ? parsed.ownerStandings : [],
    orgStats: parsed.orgStats ?? DEFAULT_ORG_STATS,
    currentDate: typeof parsed.currentDate === 'string' ? parsed.currentDate : `${parsed.currentSeason || 2026}-01-01`,
    carNumber: typeof parsed.carNumber === 'string' ? parsed.carNumber : '1',
    maxAge: typeof parsed.maxAge === 'number' ? parsed.maxAge : 65,
    seasonPhase: parsed.seasonPhase ?? 'regular',
    driverChampionshipEarnings: typeof parsed.driverChampionshipEarnings === 'number' ? parsed.driverChampionshipEarnings : 0,
    ownerChampionshipEarnings: typeof parsed.ownerChampionshipEarnings === 'number' ? parsed.ownerChampionshipEarnings : 0,
  })

  const buildLegacyImportedSave = (parsed: LocalCareerFile, targetSlotId: number): SaveSlotData => ({
    slotId: targetSlotId,
    createdAt: new Date().toISOString(),
    lastPlayedAt: new Date().toISOString(),
    owner: parsed.owner ?? {
      firstName: parsed.playerName.split(' ')[0] || 'Imported',
      lastName: parsed.playerName.split(' ').slice(1).join(' ') || 'Owner',
      nationality: '',
      birthMonth: 0,
      birthDay: 0,
      birthYear: 0,
    },
    selectedTeam: parsed.selectedTeam,
    money: 500000,
    chassis: [],
    inventory: [],
    currentWeek: parsed.currentWeek ?? 1,
    currentSeason: parsed.currentSeason ?? 2026,
    totalChampionships: parsed.totalChampionships ?? 0,
    totalWins: parsed.totalWins ?? 0,
    hiredPitCrew: [],
    hiredDrivers: [],
    hiredCrewChiefs: [],
    hiredSpotters: [],
    hiredPitCrews: [],
    carEntries: [],
    orgStats: DEFAULT_ORG_STATS,
    seasonResults: [],
    standings: [],
    currentDate: `${parsed.currentSeason ?? 2026}-01-01`,
    carNumber: '1',
    maxAge: 65,
    ownerStandings: [],
    seasonPhase: 'regular' as const,
    driverChampionshipEarnings: 0,
    ownerChampionshipEarnings: 0,
  })

  const handleImportClick = (slotId: number) => {
    setImportTargetSlotId(slotId)
    setConfirmImportSlotId(null)
    setPendingImportCandidate(null)
    setImportError('')
    fileInputRef.current?.click()
  }

  const handleConfirmImportClick = () => {
    if (confirmImportSlotId === null || !pendingImportCandidate) {
      return
    }

    const importedSave = pendingImportCandidate.format === 'full'
      ? buildImportedSave(pendingImportCandidate.parsed, pendingImportCandidate.slotId)
      : buildLegacyImportedSave(pendingImportCandidate.parsed, pendingImportCandidate.slotId)

    saveSlot(importedSave)
    setSlots(getAllSlots())
    setImportError('')
    setImportTargetSlotId(null)
    setPendingImportCandidate(null)
    setConfirmImportSlotId(null)
  }

  const handleExportSlot = (slotId: number) => {
    const slotData = loadSlot(slotId)
    if (!slotData) {
      return
    }

    const ownerName = `${slotData.owner.firstName}-${slotData.owner.lastName}`
    const teamName = slotData.selectedTeam?.name ?? 'no-team'
    const fileName = `${sanitizeFileSegment(ownerName)}-${sanitizeFileSegment(teamName)}-week-${slotData.currentWeek}.json`
    const blob = new Blob([JSON.stringify(slotData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    window.setTimeout(() => URL.revokeObjectURL(url), 0)
  }

  const handleLoadSlot = (slotId: number) => {
    const slotData = loadSlot(slotId)
    if (!slotData || !slotData.selectedTeam) return
    setActiveSlotId(slotId)
    localStorage.setItem('selectedTeam', JSON.stringify(slotData.selectedTeam))
    localStorage.setItem('playerName', `${slotData.owner.firstName} ${slotData.owner.lastName}`)
    navigate('/game')
  }

  const handleDeleteSlot = (slotId: number) => {
    deleteSlot(slotId)
    setSlots(getAllSlots())
  }

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      setImportTargetSlotId(null)
      return
    }

    if (importTargetSlotId === null) {
      setImportError('Choose an empty save slot and use its Import Save button.')
      event.target.value = ''
      return
    }

    try {
      const raw = await file.text()
      const parsed: unknown = JSON.parse(raw)

      if (!isValidFullSaveFile(parsed) && !isValidCareerFile(parsed)) {
        throw new Error('Invalid career save format.')
      }

      if (isValidFullSaveFile(parsed)) {
        setPendingImportCandidate({ format: 'full', slotId: importTargetSlotId, parsed })
      } else {
        setPendingImportCandidate({ format: 'legacy', slotId: importTargetSlotId, parsed })
      }
      setConfirmImportSlotId(importTargetSlotId)
      setImportError('')
    } catch (error) {
      console.error('Failed to import career file:', error)
      setImportError('This file could not be loaded. Import a valid career save JSON file.')
      setPendingImportCandidate(null)
      setConfirmImportSlotId(null)
    } finally {
      event.target.value = ''
    }
  }

  return (
    <div className={`${styles.container} ${toMenu ? styles.toMenu : ''}`}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={handleBackClick}>
          ← Back
        </button>
        <div className={styles.headerText}>
          <h1 className={styles.title}>Load Career</h1>
          <p className={styles.subtitle}>Choose a save slot to continue your team owner journey.</p>
        </div>
      </div>

      {importError && <div className={styles.errorBanner}>{importError}</div>}

      <div className={styles.slotList}>
        {Array.from({ length: SLOT_COUNT }, (_, i) => {
          const slot = slots[i] ?? null
          const slotId = i + 1
          const hasTeam = slot?.selectedTeam != null
          const ownerName = slot ? `${slot.owner.firstName} ${slot.owner.lastName}` : null
          const teamName = hasTeam ? slot.selectedTeam!.name : 'No team selected'
          const saveTimeline = slot ? `Week ${slot.currentWeek} - ${formatSaveDate(slot.currentDate)}` : null

          return (
            <div key={slotId} className={styles.slotCard}>
              <span className={styles.slotLabel}>Save Slot {slotId}</span>
              <div className={styles.slotInfo}>
                {slot ? (
                  <>
                    <span className={styles.slotName}>{ownerName}</span>
                    <span className={styles.slotTeam}>{teamName}</span>
                    <span className={styles.slotDate}>{saveTimeline}</span>
                  </>
                ) : (
                  <span className={styles.slotEmpty}>No saved career data</span>
                )}
              </div>
              {slot ? (
                <div className={styles.slotActions}>
                  <button className={`${styles.slotButton} ${styles.exportButton}`} onClick={() => handleExportSlot(slotId)}>
                    Export
                  </button>
                  {hasTeam && (
                    <button className={styles.slotButton} onClick={() => handleLoadSlot(slotId)}>
                      Load
                    </button>
                  )}
                  <button className={styles.deleteButton} onClick={() => handleDeleteSlot(slotId)}>
                    Delete
                  </button>
                </div>
              ) : (
                <button className={styles.slotButton} onClick={() => handleImportClick(slotId)}>
                  Import Save
                </button>
              )}
            </div>
          )
        })}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        className={styles.fileInput}
        onChange={handleImportFile}
      />

      <div className={styles.footer}>
        <div className={styles.version}>v0.1.0 - Pre-Alpha</div>
        <div className={styles.copyright}>© Project Racing</div>
      </div>

      {confirmImportSlotId !== null && (
        <div
          className={styles.confirmOverlay}
          onClick={() => {
            setConfirmImportSlotId(null)
            setPendingImportCandidate(null)
          }}
        >
          <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.confirmTitle}>Confirm Import</h3>
            <p className={styles.confirmText}>Import this save file into Save Slot {confirmImportSlotId}?</p>
            <div className={styles.confirmActions}>
              <button
                className={styles.confirmCancel}
                onClick={() => {
                  setConfirmImportSlotId(null)
                  setPendingImportCandidate(null)
                  setImportTargetSlotId(null)
                }}
              >
                Cancel
              </button>
              <button className={styles.confirmImport} onClick={handleConfirmImportClick}>
                Import
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default LoadCareer