import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './LoadCareer.module.css'
import { LocalCareerFile, SaveSlotData, Team } from '../types'
import { getAllSlots, loadSlot, deleteSlot, saveSlot, setActiveSlotId } from '../services/saveManager'

const SLOT_COUNT = 5

const LoadCareer: React.FC = () => {
  const navigate = useNavigate()
  const [toMenu, setToMenu] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const backTimerRef = useRef<number | null>(null)
  const [importError, setImportError] = useState('')
  const [slots, setSlots] = useState<(SaveSlotData | null)[]>([])

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

  const isValidCareerFile = (value: unknown): value is LocalCareerFile => {
    if (!value || typeof value !== 'object') {
      return false
    }

    const candidate = value as Record<string, unknown>
    return typeof candidate.playerName === 'string' && isValidTeam(candidate.selectedTeam)
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
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
      return
    }

    try {
      const raw = await file.text()
      const parsed: unknown = JSON.parse(raw)

      if (!isValidCareerFile(parsed)) {
        throw new Error('Invalid career save format.')
      }

      // Find first empty slot for the import
      let targetSlotId: number | null = null
      for (let i = 0; i < SLOT_COUNT; i++) {
        if (!slots[i]) {
          targetSlotId = i + 1
          break
        }
      }
      if (targetSlotId === null) {
        setImportError('All save slots are full. Delete a save first to import.')
        return
      }

      const importedSave: SaveSlotData = {
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
        seasonResults: [],
        standings: [],
      }

      saveSlot(importedSave)
      setActiveSlotId(targetSlotId)
      setSlots(getAllSlots())

      localStorage.setItem('selectedTeam', JSON.stringify(parsed.selectedTeam))
      localStorage.setItem('playerName', parsed.playerName)

      setImportError('')
      navigate('/game')
    } catch (error) {
      console.error('Failed to import career file:', error)
      setImportError('This file could not be loaded. Import a valid career save JSON file.')
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

          return (
            <div key={slotId} className={styles.slotCard}>
              <span className={styles.slotLabel}>Save Slot {slotId}</span>
              <span className={styles.slotState}>{slot ? (hasTeam ? 'Active' : 'New') : 'Empty'}</span>
              <span className={styles.slotStatus}>
                {slot
                  ? `${slot.owner.firstName} ${slot.owner.lastName}${hasTeam ? ` — ${slot.selectedTeam!.name}` : ' — No team selected'}`
                  : 'No saved career data'}
              </span>
              {slot ? (
                <div className={styles.slotActions}>
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
                <button className={styles.slotButton} disabled>
                  No Save Present
                </button>
              )}
            </div>
          )
        })}
      </div>

      <div className={styles.importPanel}>
        <div>
          <h2 className={styles.importTitle}>Import Local Save</h2>
          <p className={styles.importText}>
            Load a career from a JSON file stored on the player&apos;s PC. This same local-file approach can later support custom teams, drivers, and sponsors.
          </p>
        </div>
        <button className={styles.primaryButton} onClick={handleImportClick}>
          Import Save File
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          className={styles.fileInput}
          onChange={handleImportFile}
        />
      </div>

      <div className={styles.footer}>
        <div className={styles.version}>v0.1.0 - Pre-Alpha</div>
        <div className={styles.copyright}>© Project Racing</div>
      </div>
    </div>
  )
}

export default LoadCareer