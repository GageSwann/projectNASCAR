import React, { useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import styles from './Garage.module.css'
import { GameContext, Chassis, ChassisStatus, InventoryItem, ItemCategory, TrackType, INSTALL_DAYS_BY_TIER } from '../../types'
import { getActiveSlotId, loadSlot, saveSlot } from '../../services/saveManager'
import { computeCarRatings } from '../../data/carRatings'

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
  dirt: 'Dirt',
}

const ALL_PART_CATEGORIES: ItemCategory[] = ['engine', 'suspension', 'aerodynamics', 'brakes', 'transmission']
type GarageSort = 'status' | 'build' | 'name' | 'track'

function isInstallComplete(part: InventoryItem): boolean {
  return part.installDaysLeft === undefined || part.installDaysLeft <= 0
}

function isUninstalling(part: InventoryItem): boolean {
  return part.uninstallDaysLeft !== undefined && part.uninstallDaysLeft > 0
}

function isBuildPartActive(part: InventoryItem): boolean {
  return isInstallComplete(part) && !isUninstalling(part)
}

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
  const [scrapConfirm, setScrapConfirm] = useState<Chassis | null>(null)
  const [listSort, setListSort] = useState<GarageSort>('status')

  // Get installed categories for the selected chassis
  const installedCategories = (c: Chassis): Set<ItemCategory> => {
    return new Set(c.installedParts.map(p => p.item.category))
  }

  // Categories that are actively contributing to chassis attributes
  const activeInstalledCategories = (c: Chassis): Set<ItemCategory> => {
    return new Set(c.installedParts.filter(isBuildPartActive).map(p => p.item.category))
  }

  const isChassisRaceReady = (c: Chassis): boolean => {
    return ALL_PART_CATEGORIES.every(cat => c.installedParts.some(p => p.item.category === cat && isBuildPartActive(p)))
  }

  const getDisplayStatus = (c: Chassis): ChassisStatus => {
    if (c.status === 'damaged' || c.status === 'totaled') return c.status
    return isChassisRaceReady(c) ? 'ready' : 'building'
  }

  // Missing categories
  const missingCategories = (c: Chassis): ItemCategory[] => {
    const installed = activeInstalledCategories(c)
    return ALL_PART_CATEGORIES.filter(cat => !installed.has(cat))
  }

  const handleRemovePart = (chassis: Chassis, part: InventoryItem) => {
    if (!isInstallComplete(part) || isUninstalling(part)) return

    const slotId = getActiveSlotId()
    if (!slotId) return
    const data = loadSlot(slotId)
    if (!data) return

    const uninstallDays = INSTALL_DAYS_BY_TIER[part.item.tier] ?? 2
    const uninstallStartDate = saveData.currentDate || new Date().toISOString().slice(0, 10)

    const updatedChassis = chassisList.map((ch) => {
      if (ch.id !== chassis.id) return ch
      const newParts = ch.installedParts.map((p) => {
        if (p.id !== part.id) return p
        return {
          ...p,
          uninstallStartDate,
          uninstallDaysLeft: uninstallDays,
        }
      })
      return {
        ...ch,
        installedParts: newParts,
        status: ('building' as ChassisStatus),
      }
    })

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
      return { ...ch, installedParts: [...ch.installedParts, installedPart], status: 'building' }
    })

    data.inventory = data.inventory.filter((i) => i.id !== part.id)
    data.chassis = updatedChassis
    saveSlot(data)
    setChassisList(updatedChassis)
    setSelected(updatedChassis.find((ch) => ch.id === chassis.id) ?? null)
    refreshSave()
  }

  const calculateResaleValue = (chassis: Chassis): number => {
    // Resale at 30% of original purchase price
    return Math.floor(chassis.purchasePrice * 0.3)
  }

  const handleDeleteChassis = (chassis: Chassis) => {
    const slotId = getActiveSlotId()
    if (!slotId) return
    const data = loadSlot(slotId)
    if (!data) return

    const resaleValue = calculateResaleValue(chassis)

    // Return installed parts to inventory
    for (const p of chassis.installedParts) {
      data.inventory.push({
        ...p,
        chassisId: undefined,
        installStartDate: undefined,
        installDaysLeft: undefined,
        uninstallStartDate: undefined,
        uninstallDaysLeft: undefined,
      })
    }

    // Refund player for scrapped chassis
    data.money += resaleValue

    const updatedChassis = chassisList.filter(c => c.id !== chassis.id)
    data.chassis = updatedChassis
    saveSlot(data)
    setChassisList(updatedChassis)
    setSelected(null)
    setScrapConfirm(null)
    refreshSave()
  }

  const computeStats = (c: Chassis) => {
    return computeCarRatings(c, false)
  }

  const isFullyEquipped = (c: Chassis) => missingCategories(c).length === 0
  const getInstallingCount = (c: Chassis) => c.installedParts.filter(p => !isInstallComplete(p)).length
  const getActiveCount = (c: Chassis) => c.installedParts.filter(isInstallComplete).length
  const getBuildCompletion = (c: Chassis) => Math.round((getActiveCount(c) / ALL_PART_CATEGORIES.length) * 100)

  const sortedChassisList = useMemo(() => {
    const statusOrder: Record<ChassisStatus, number> = {
      ready: 0,
      building: 1,
      damaged: 2,
      totaled: 3,
    }

    const list = [...chassisList]
    return list.sort((a, b) => {
      switch (listSort) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'build':
          return getBuildCompletion(b) - getBuildCompletion(a) || a.name.localeCompare(b.name)
        case 'track':
          return TRACK_TYPE_LABELS[a.trackType].localeCompare(TRACK_TYPE_LABELS[b.trackType]) || a.name.localeCompare(b.name)
        case 'status':
        default:
          return statusOrder[getDisplayStatus(a)] - statusOrder[getDisplayStatus(b)] || getBuildCompletion(b) - getBuildCompletion(a) || a.name.localeCompare(b.name)
      }
    })
  }, [chassisList, listSort])

  useEffect(() => {
    if (chassisList.length === 0) {
      if (selected) setSelected(null)
      return
    }

    if (!selected) {
      setSelected(sortedChassisList[0])
      return
    }

    const updated = chassisList.find(ch => ch.id === selected.id)
    if (!updated) {
      setSelected(sortedChassisList[0])
      return
    }

    if (updated !== selected) {
      setSelected(updated)
    }
  }, [chassisList, selected, sortedChassisList])

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
          <div className={styles.listTools}>
            <span className={styles.listCount}>{chassisList.length} total</span>
            <label className={styles.sortField}>
              <span>Sort</span>
              <select
                className={styles.sortSelect}
                value={listSort}
                onChange={(event) => setListSort(event.target.value as GarageSort)}
              >
                <option value="status">Status + Build</option>
                <option value="build">Build Progress</option>
                <option value="name">Name</option>
                <option value="track">Track Type</option>
              </select>
            </label>
          </div>

          {chassisList.length === 0 ? (
            <p className={styles.empty}>No chassis yet. Buy one from the Store!</p>
          ) : (
            sortedChassisList.map((c) => (
              <button
                key={c.id}
                className={`${styles.chassisCard} ${selected?.id === c.id ? styles.selectedCard : ''}`}
                onClick={() => setSelected(c)}
              >
                <div className={styles.cardTop}>
                  <span className={styles.chassisName}>{c.name}</span>
                  <span
                    className={styles.statusBadge}
                    style={{ borderColor: STATUS_COLORS[getDisplayStatus(c)], color: STATUS_COLORS[getDisplayStatus(c)] }}
                  >
                    {STATUS_LABELS[getDisplayStatus(c)]}
                  </span>
                </div>
                <span className={styles.trackTypeTag}>{TRACK_TYPE_LABELS[c.trackType]}</span>
                <div className={styles.cardMeta}>
                  <span>{getActiveCount(c)}/5 active</span>
                  {getInstallingCount(c) > 0 && <span className={styles.installingMeta}>{getInstallingCount(c)} installing</span>}
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
                      style={{ color: STATUS_COLORS[getDisplayStatus(selected)] }}
                    >
                      {STATUS_LABELS[getDisplayStatus(selected)]}
                    </span>
                    <span className={styles.detailTrackType}>{TRACK_TYPE_LABELS[selected.trackType]}</span>
                  </div>
                </div>
                <button className={styles.deleteBtn} onClick={() => setScrapConfirm(selected)}>
                  Scrap Chassis
                </button>
              </div>

              {(() => {
                const stats = computeStats(selected)
                const activeCount = getActiveCount(selected)
                const installingCount = getInstallingCount(selected)
                const missing = missingCategories(selected)
                const buildPercent = getBuildCompletion(selected)

                return (
                  <>
                    <div className={styles.buildPanel}>
                      <div className={styles.buildRow}>
                        <span className={styles.buildLabel}>Build Readiness</span>
                        <strong className={styles.buildValue}>{buildPercent}%</strong>
                      </div>
                      <div className={styles.buildBar}>
                        <div className={styles.buildFill} style={{ width: `${buildPercent}%` }} />
                      </div>
                      <div className={styles.buildMeta}>
                        <span>{activeCount}/5 active</span>
                        <span>{installingCount} installing</span>
                        <span>{missing.length} missing</span>
                      </div>
                    </div>

                    <div className={styles.statsGrid}>
                      <div className={styles.statItem}><span>Speed</span><strong>{stats.speed}</strong></div>
                      <div className={styles.statItem}><span>Handling</span><strong>{stats.handling}</strong></div>
                      <div className={styles.statItem}><span>Reliability</span><strong>{stats.reliability}</strong></div>
                      <div className={styles.statItem}><span>Aero</span><strong>{stats.aero}</strong></div>
                      <div className={styles.statItem}><span>Weight</span><strong>{stats.weight} lbs</strong></div>
                    </div>
                  </>
                )
              })()}

              {/* Missing parts warning */}
              {!isFullyEquipped(selected) ? (
                <div className={styles.missingWarning}>
                  Missing active parts: {missingCategories(selected).join(', ')}
                </div>
              ) : getInstallingCount(selected) > 0 ? (
                <div className={styles.missingWarning}>
                  Install in progress: {getInstallingCount(selected)} part(s) still being fitted.
                </div>
              ) : null}

              {/* Installed parts */}
              <h3 className={styles.subHead}>Installed Parts ({getActiveCount(selected)}/5 active)</h3>
              {getInstallingCount(selected) > 0 && (
                <p className={styles.muted}>{getInstallingCount(selected)} part(s) are installing and not affecting attributes yet.</p>
              )}
              {selected.installedParts.length === 0 ? (
                <p className={styles.muted}>No parts installed yet.</p>
              ) : (
                <div className={styles.partsList}>
                  {selected.installedParts.map((p) => {
                    const isInstalling = p.installDaysLeft !== undefined && p.installDaysLeft > 0
                    const isPartUninstalling = isUninstalling(p)
                    return (
                      <div key={p.id} className={`${styles.partRow} ${isInstalling ? styles.installingRow : ''} ${isPartUninstalling ? styles.uninstallingRow : ''}`}>
                        <div className={styles.partInfo}>
                          <span className={styles.partName}>
                            {p.item.name}
                            {isInstalling && (
                              <span className={styles.installBadge}>Installing ({p.installDaysLeft}d left)</span>
                            )}
                            {isPartUninstalling && (
                              <span className={styles.uninstallBadge}>Uninstalling ({p.uninstallDaysLeft}d left)</span>
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
                        <button
                          className={styles.removeBtn}
                          onClick={() => handleRemovePart(selected, p)}
                          disabled={isInstalling || isPartUninstalling}
                        >
                          {isInstalling ? 'Installing' : isPartUninstalling ? 'Uninstalling' : 'Uninstall'}
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
                            Install ({INSTALL_DAYS_BY_TIER[p.item.tier] ?? 2}d)
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

      {/* Scrap Confirmation Dialog */}
      {scrapConfirm && (
        <div className={styles.scrapOverlay} onClick={() => setScrapConfirm(null)}>
          <div className={styles.scrapModal} onClick={e => e.stopPropagation()}>
            <h3 className={styles.scrapTitle}>⚠ Scrap Chassis?</h3>
            <p className={styles.scrapText}>
              You are about to scrap <strong>{scrapConfirm.name}</strong>.
            </p>
            <p className={styles.scrapText}>
              All <strong>{scrapConfirm.installedParts.length} installed parts</strong> will be returned to your inventory.
            </p>
            <p className={styles.scrapValue}>
              You will receive <strong>${calculateResaleValue(scrapConfirm).toLocaleString()}</strong> in reimbursement.
            </p>
            <div className={styles.scrapBtns}>
              <button className={styles.scrapCancel} onClick={() => setScrapConfirm(null)}>Keep Chassis</button>
              <button className={styles.scrapConfirm} onClick={() => handleDeleteChassis(scrapConfirm)}>Scrap It</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Garage
