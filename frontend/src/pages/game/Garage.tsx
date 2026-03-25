import React, { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import styles from './Garage.module.css'
import { GameContext, Chassis, ChassisStatus, InventoryItem } from '../../types'
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

function generateId() {
  return `chassis_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

const Garage: React.FC = () => {
  const { saveData, refreshSave } = useOutletContext<GameContext>()
  const [chassisList, setChassisList] = useState<Chassis[]>(saveData.chassis)
  const [selected, setSelected] = useState<Chassis | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)
  const [newName, setNewName] = useState('')

  const persist = (updated: Chassis[]) => {
    setChassisList(updated)
    const slotId = getActiveSlotId()
    if (slotId) {
      const data = loadSlot(slotId)
      if (data) {
        data.chassis = updated
        saveSlot(data)
        refreshSave()
      }
    }
  }

  const handleBuild = () => {
    const name = newName.trim() || `Chassis #${chassisList.length + 1}`
    const chassis: Chassis = {
      id: generateId(),
      name,
      series_id: saveData.selectedSeries?.id ?? 3,
      status: 'building',
      base_speed: 50,
      base_handling: 50,
      base_reliability: 50,
      base_aero: 50,
      weight_lbs: 3400,
      build_progress: 0,
      installedParts: [],
      created_at: new Date().toISOString(),
    }
    persist([...chassisList, chassis])
    setNewName('')
    setShowNewForm(false)
    setSelected(chassis)
  }

  const handleAdvanceBuild = (c: Chassis) => {
    const cost = 25000
    const slotId = getActiveSlotId()
    if (!slotId) return
    const data = loadSlot(slotId)
    if (!data || data.money < cost) return

    const updated = chassisList.map((ch) => {
      if (ch.id !== c.id) return ch
      const newProgress = Math.min(ch.build_progress + 25, 100)
      return {
        ...ch,
        build_progress: newProgress,
        status: (newProgress >= 100 ? 'ready' : 'building') as ChassisStatus,
      }
    })
    data.money -= cost
    data.chassis = updated
    saveSlot(data)
    setChassisList(updated)
    setSelected(updated.find((ch) => ch.id === c.id) ?? null)
  }

  const handleRemovePart = (chassis: Chassis, part: InventoryItem) => {
    const slotId = getActiveSlotId()
    if (!slotId) return
    const data = loadSlot(slotId)
    if (!data) return

    const updatedChassis = chassisList.map((ch) => {
      if (ch.id !== chassis.id) return ch
      return { ...ch, installedParts: ch.installedParts.filter((p) => p.id !== part.id) }
    })

    const uninstalledPart: InventoryItem = { ...part, chassisId: undefined }
    data.inventory = [...data.inventory, uninstalledPart]
    data.chassis = updatedChassis
    saveSlot(data)
    setChassisList(updatedChassis)
    setSelected(updatedChassis.find((ch) => ch.id === chassis.id) ?? null)
  }

  const uninstalledParts = (() => {
    const slotId = getActiveSlotId()
    if (!slotId) return []
    const data = loadSlot(slotId)
    if (!data) return []
    return data.inventory.filter((i) => !i.chassisId)
  })()

  const handleInstallPart = (chassis: Chassis, part: InventoryItem) => {
    const slotId = getActiveSlotId()
    if (!slotId) return
    const data = loadSlot(slotId)
    if (!data) return

    const installedPart: InventoryItem = { ...part, chassisId: chassis.id }

    const updatedChassis = chassisList.map((ch) => {
      if (ch.id !== chassis.id) return ch
      return { ...ch, installedParts: [...ch.installedParts, installedPart] }
    })

    data.inventory = data.inventory.filter((i) => i.id !== part.id)
    data.chassis = updatedChassis
    saveSlot(data)
    setChassisList(updatedChassis)
    setSelected(updatedChassis.find((ch) => ch.id === chassis.id) ?? null)
  }

  const computeStats = (c: Chassis) => {
    let speed = c.base_speed
    let handling = c.base_handling
    let reliability = c.base_reliability
    let aero = c.base_aero
    let weight = c.weight_lbs
    for (const p of c.installedParts) {
      speed += p.item.speed_bonus
      handling += p.item.handling_bonus
      reliability += p.item.reliability_bonus
      aero += p.item.aero_bonus
      weight -= p.item.weight_reduction
    }
    return { speed, handling, reliability, aero, weight }
  }

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <h1 className={styles.heading}>Garage</h1>
        <button className={styles.newBtn} onClick={() => setShowNewForm(!showNewForm)}>
          + Build New Chassis
        </button>
      </div>

      {showNewForm && (
        <div className={styles.newForm}>
          <input
            className={styles.nameInput}
            type="text"
            placeholder="Chassis name (optional)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            maxLength={40}
          />
          <button className={styles.confirmBtn} onClick={handleBuild}>Start Build</button>
          <button className={styles.cancelBtn} onClick={() => setShowNewForm(false)}>Cancel</button>
        </div>
      )}

      <div className={styles.content}>
        {/* Chassis list */}
        <div className={styles.listCol}>
          {chassisList.length === 0 ? (
            <p className={styles.empty}>No chassis yet. Build your first one!</p>
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
                {c.status === 'building' && (
                  <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: `${c.build_progress}%` }} />
                  </div>
                )}
              </button>
            ))
          )}
        </div>

        {/* Detail panel */}
        <div className={styles.detailCol}>
          {selected ? (
            <>
              <h2 className={styles.detailName}>{selected.name}</h2>
              <span
                className={styles.detailStatus}
                style={{ color: STATUS_COLORS[selected.status] }}
              >
                {STATUS_LABELS[selected.status]}
              </span>

              {selected.status === 'building' && (
                <div className={styles.buildSection}>
                  <div className={styles.progressBarLg}>
                    <div className={styles.progressFill} style={{ width: `${selected.build_progress}%` }} />
                  </div>
                  <span className={styles.progressText}>{selected.build_progress}% complete</span>
                  <button className={styles.advanceBtn} onClick={() => handleAdvanceBuild(selected)}>
                    Advance Build ($25,000)
                  </button>
                </div>
              )}

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

              {/* Installed parts */}
              <h3 className={styles.subHead}>Installed Parts ({selected.installedParts.length})</h3>
              {selected.installedParts.length === 0 ? (
                <p className={styles.muted}>No parts installed yet.</p>
              ) : (
                <div className={styles.partsList}>
                  {selected.installedParts.map((p) => (
                    <div key={p.id} className={styles.partRow}>
                      <div>
                        <span className={styles.partName}>{p.item.name}</span>
                        <span className={styles.partCat}>{p.item.category}</span>
                      </div>
                      <button className={styles.removeBtn} onClick={() => handleRemovePart(selected, p)}>
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Available parts to install */}
              {selected.status === 'ready' && uninstalledParts.length > 0 && (
                <>
                  <h3 className={styles.subHead}>Available Parts</h3>
                  <div className={styles.partsList}>
                    {uninstalledParts.map((p) => (
                      <div key={p.id} className={styles.partRow}>
                        <div>
                          <span className={styles.partName}>{p.item.name}</span>
                          <span className={styles.partCat}>{p.item.category}</span>
                        </div>
                        <button className={styles.installBtn} onClick={() => handleInstallPart(selected, p)}>
                          Install
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
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
