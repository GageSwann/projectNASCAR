import React, { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import styles from './Garage.module.css'
import { GameContext, Chassis, ChassisStatus, InventoryItem, ItemCategory, TrackType, INSTALL_DAYS_BY_TIER } from '../../types'
import { getActiveSlotId, loadSlot, saveSlot } from '../../services/saveManager'

const STATUS_LABELS: Record<ChassisStatus, string> = {
  building: 'Building',
  ready: 'Race Ready',
  damaged: 'Damaged',
  totaled: 'Totaled',
}

const STATUS_COLORS: Record<ChassisStatus, string> = {
  building: '#f0ad4e',
  ready: '#4caf50',
  damaged: '#ff9800',
  totaled: '#f44336',
}

const TRACK_TYPE_LABELS: Record<TrackType, string> = {
  superspeedway: 'Superspeedway',
  short_track: 'Short Track',
  intermediate: 'Intermediate',
  road_course: 'Road Course',
  street: 'Street Circuit',
}

const ALL_PART_CATEGORIES: ItemCategory[] = ['engine', 'suspension', 'aerodynamics', 'brakes', 'transmission']

function getHealthColor(health: number): string {
  if (health >= 75) return '#4caf50'
  if (health >= 50) return '#ff9800'
  if (health >= 25) return '#f44336'
  return '#b71c1c'
}

const Garage: React.FC = () => {
  const { saveData, refreshSave } = useOutletContext<GameContext>()
  const [chassisList, setChassisList] = useState<Chassis[]>(saveData.chassis)
  const [selected, setSelected] = useState<Chassis | null>(null)
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState('')

  // Get installed categories for the selected chassis
  const installedCategories = (c: Chassis): Set<ItemCategory> => {
    return new Set(c.installedParts.map(p => p.item.category))
  }

  // Missing categories
  const missingCategories = (c: Chassis): ItemCategory[] => {
    const installed = installedCategories(c)
    return ALL_PART_CATEGORIES.filter(cat => !installed.has(cat))
  }

  const handleRemovePart = (chassis: Chassis, part: InventoryItem) => {
    const slotId = getActiveSlotId()
    if (!slotId) return
    const data = loadSlot(slotId)
    if (!data) return

    const updatedChassis = chassisList.map((ch) => {
      if (ch.id !== chassis.id) return ch
      const newParts = ch.installedParts.filter((p) => p.id !== part.id)
      return {
        ...ch,
        installedParts: newParts,
        status: ('ready' as ChassisStatus), // stays ready, just missing a part
      }
    })

    const uninstalledPart: InventoryItem = { ...part, chassisId: undefined }
    data.inventory = [...data.inventory, uninstalledPart]
    data.chassis = updatedChassis
    saveSlot(data)
    setChassisList(updatedChassis)
    setSelected(updatedChassis.find((ch) => ch.id === chassis.id) ?? null)
    refreshSave()
  }

  const uninstalledParts = (() => {
    const slotId = getActiveSlotId()
    if (!slotId) return []
    const data = loadSlot(slotId)
    if (!data) return []
    return data.inventory.filter((i) => !i.chassisId)
  })()

  const handleInstallPart = (chassis: Chassis, part: InventoryItem) => {
    // Enforce 1 per category
    const installed = installedCategories(chassis)
    if (installed.has(part.item.category)) return

    const slotId = getActiveSlotId()
    if (!slotId) return
    const data = loadSlot(slotId)
    if (!data) return

    const installedPart: InventoryItem = {
      ...part,
      chassisId: chassis.id,
      installStartDate: saveData.currentDate || new Date().toISOString().slice(0, 10),
      installDaysLeft: INSTALL_DAYS_BY_TIER[part.item.tier] ?? 2,
    }

    const updatedChassis = chassisList.map((ch) => {
      if (ch.id !== chassis.id) return ch
      return { ...ch, installedParts: [...ch.installedParts, installedPart] }
    })

    data.inventory = data.inventory.filter((i) => i.id !== part.id)
    data.chassis = updatedChassis
    saveSlot(data)
    setChassisList(updatedChassis)
    setSelected(updatedChassis.find((ch) => ch.id === chassis.id) ?? null)
    refreshSave()
  }

  const handleDeleteChassis = (chassis: Chassis) => {
    const slotId = getActiveSlotId()
    if (!slotId) return
    const data = loadSlot(slotId)
    if (!data) return

    // Return installed parts to inventory
    for (const p of chassis.installedParts) {
      data.inventory.push({ ...p, chassisId: undefined })
    }

    const updatedChassis = chassisList.filter(c => c.id !== chassis.id)
    data.chassis = updatedChassis
    saveSlot(data)
    setChassisList(updatedChassis)
    setSelected(null)
    refreshSave()
  }

  const computeStats = (c: Chassis) => {
    let speed = c.base_speed
    let handling = c.base_handling
    let reliability = c.base_reliability
    let aero = c.base_aero
    let weight = c.weight_lbs
    for (const p of c.installedParts) {
      // Scale bonuses by health
      const hf = p.health / 100
      speed += Math.round(p.item.speed_bonus * hf)
      handling += Math.round(p.item.handling_bonus * hf)
      reliability += Math.round(p.item.reliability_bonus * hf)
      aero += Math.round(p.item.aero_bonus * hf)
      weight -= p.item.weight_reduction
    }
    return { speed, handling, reliability, aero, weight }
  }

  const isFullyEquipped = (c: Chassis) => missingCategories(c).length === 0

  const handleRename = (chassis: Chassis) => {
    const trimmed = nameInput.trim()
    if (!trimmed || trimmed === chassis.name) {
      setEditingName(false)
      return
    }
    const slotId = getActiveSlotId()
    if (!slotId) return
    const data = loadSlot(slotId)
    if (!data) return

    const updatedChassis = chassisList.map(ch =>
      ch.id === chassis.id ? { ...ch, name: trimmed } : ch
    )
    data.chassis = updatedChassis
    saveSlot(data)
    setChassisList(updatedChassis)
    setSelected(updatedChassis.find(ch => ch.id === chassis.id) ?? null)
    setEditingName(false)
    refreshSave()
  }

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <h1 className={styles.heading}>Garage</h1>
        <span className={styles.chassisCount}>{chassisList.length} chassis</span>
      </div>

      <div className={styles.content}>
        {/* Chassis list */}
        <div className={styles.listCol}>
          {chassisList.length === 0 ? (
            <p className={styles.empty}>No chassis yet. Buy one from the Store!</p>
          ) : (
            chassisList.map((c) => (
              <button
                key={c.id}
                className={`${styles.chassisCard} ${selected?.id === c.id ? styles.selectedCard : ''}`}
                onClick={() => setSelected(c)}
              >
                <div className={styles.cardTop}>
                  <span className={styles.chassisName}>{c.name}</span>
                  <span
                    className={styles.statusBadge}
                    style={{ borderColor: STATUS_COLORS[c.status], color: STATUS_COLORS[c.status] }}
                  >
                    {STATUS_LABELS[c.status]}
                  </span>
                </div>
                <span className={styles.trackTypeTag}>{TRACK_TYPE_LABELS[c.trackType]}</span>
                <div className={styles.cardMeta}>
                  <span>{c.installedParts.length}/8 parts</span>
                  {isFullyEquipped(c) && <span className={styles.fullBadge}>Full Build</span>}
                </div>
              </button>
            ))
          )}
        </div>

        {/* Detail panel */}
        <div className={styles.detailCol}>
          {selected ? (
            <>
              <div className={styles.detailHeader}>
                <div>
                  {editingName ? (
                    <div className={styles.renameRow}>
                      <input
                        className={styles.renameInput}
                        value={nameInput}
                        onChange={e => setNameInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleRename(selected); if (e.key === 'Escape') setEditingName(false) }}
                        autoFocus
                        maxLength={40}
                      />
                      <button className={styles.renameSave} onClick={() => handleRename(selected)}>Save</button>
                      <button className={styles.renameCancel} onClick={() => setEditingName(false)}>Cancel</button>
                    </div>
                  ) : (
                    <h2
                      className={styles.detailName}
                      onClick={() => { setEditingName(true); setNameInput(selected.name) }}
                      title="Click to rename"
                      style={{ cursor: 'pointer' }}
                    >
                      {selected.name} <span className={styles.editIcon}>✎</span>
                    </h2>
                  )}
                  <div className={styles.detailMeta}>
                    <span
                      className={styles.detailStatus}
                      style={{ color: STATUS_COLORS[selected.status] }}
                    >
                      {STATUS_LABELS[selected.status]}
                    </span>
                    <span className={styles.detailTrackType}>{TRACK_TYPE_LABELS[selected.trackType]}</span>
                  </div>
                </div>
                <button className={styles.deleteBtn} onClick={() => handleDeleteChassis(selected)}>
                  Scrap Chassis
                </button>
              </div>

              {(() => {
                const stats = computeStats(selected)
                return (
                  <div className={styles.statsGrid}>
                    <div className={styles.statItem}><span>Speed</span><strong>{stats.speed}</strong></div>
                    <div className={styles.statItem}><span>Handling</span><strong>{stats.handling}</strong></div>
                    <div className={styles.statItem}><span>Reliability</span><strong>{stats.reliability}</strong></div>
                    <div className={styles.statItem}><span>Aero</span><strong>{stats.aero}</strong></div>
                    <div className={styles.statItem}><span>Weight</span><strong>{stats.weight} lbs</strong></div>
                  </div>
                )
              })()}

              {/* Missing parts warning */}
              {!isFullyEquipped(selected) && (
                <div className={styles.missingWarning}>
                  Missing: {missingCategories(selected).join(', ')}
                </div>
              )}

              {/* Installed parts */}
              <h3 className={styles.subHead}>Installed Parts ({selected.installedParts.length}/8)</h3>
              {selected.installedParts.length === 0 ? (
                <p className={styles.muted}>No parts installed yet.</p>
              ) : (
                <div className={styles.partsList}>
                  {selected.installedParts.map((p) => {
                    const isInstalling = p.installDaysLeft !== undefined && p.installDaysLeft > 0
                    return (
                      <div key={p.id} className={`${styles.partRow} ${isInstalling ? styles.installingRow : ''}`}>
                        <div className={styles.partInfo}>
                          <span className={styles.partName}>
                            {p.item.name}
                            {isInstalling && (
                              <span className={styles.installBadge}>Installing ({p.installDaysLeft}d left)</span>
                            )}
                          </span>
                          <span className={styles.partCat}>{p.item.category}</span>
                        </div>
                        <div className={styles.partHealth}>
                          <div className={styles.healthBar}>
                            <div className={styles.healthFill} style={{ width: `${p.health}%`, background: getHealthColor(p.health) }} />
                          </div>
                          <span className={styles.healthText} style={{ color: getHealthColor(p.health) }}>{p.health}%</span>
                        </div>
                        <button className={styles.removeBtn} onClick={() => handleRemovePart(selected, p)}>
                          Remove
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Available parts to install (only show parts for categories not already filled) */}
              {(() => {
                const installed = installedCategories(selected)
                const available = uninstalledParts.filter(p => !installed.has(p.item.category))
                if (available.length === 0) return null
                return (
                  <>
                    <h3 className={styles.subHead}>Available Parts</h3>
                    <div className={styles.partsList}>
                      {available.map((p) => (
                        <div key={p.id} className={styles.partRow}>
                          <div className={styles.partInfo}>
                            <span className={styles.partName}>{p.item.name}</span>
                            <span className={styles.partCat}>{p.item.category}</span>
                          </div>
                          <div className={styles.partHealth}>
                            <div className={styles.healthBar}>
                              <div className={styles.healthFill} style={{ width: `${p.health}%`, background: getHealthColor(p.health) }} />
                            </div>
                            <span className={styles.healthText} style={{ color: getHealthColor(p.health) }}>{p.health}%</span>
                          </div>
                          <button className={styles.installBtn} onClick={() => handleInstallPart(selected, p)}>
                            Install
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )
              })()}
            </>
          ) : (
            <p className={styles.selectPrompt}>Select a chassis to view details</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Garage
