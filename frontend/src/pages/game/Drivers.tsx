import React, { useState, useMemo } from 'react'
import { useOutletContext } from 'react-router-dom'
import styles from './Drivers.module.css'
import { GameContext, MarketDriver } from '../../types'
import { generateDriverMarket } from '../../data/drivers'
import { getActiveSlotId, loadSlot, saveSlot } from '../../services/saveManager'

const formatMoney = (n: number) => `$${n.toLocaleString()}`

const ATTR_LABELS: { key: keyof MarketDriver; label: string; group: 'general' | 'track' }[] = [
  { key: 'pace', label: 'Pace', group: 'general' },
  { key: 'racecraft', label: 'Racecraft', group: 'general' },
  { key: 'consistency', label: 'Consistency', group: 'general' },
  { key: 'aggression', label: 'Aggression', group: 'general' },
  { key: 'superspeedway', label: 'Superspeedway', group: 'track' },
  { key: 'short_track', label: 'Short Track', group: 'track' },
  { key: 'intermediate', label: 'Intermediate', group: 'track' },
  { key: 'road_course', label: 'Road Course', group: 'track' },
]

function attrColor(val: number): string {
  if (val >= 85) return '#4caf50'
  if (val >= 70) return '#8bc34a'
  if (val >= 55) return '#ffc107'
  if (val >= 40) return '#ff9800'
  return '#f44336'
}

const MAX_DRIVERS = 4

const Drivers: React.FC = () => {
  const { saveData, refreshSave } = useOutletContext<GameContext>()
  const seriesId = saveData.selectedSeries?.id ?? 3

  const market = useMemo(() => generateDriverMarket(seriesId), [seriesId])
  const [selected, setSelected] = useState<MarketDriver | null>(null)
  const [hiredDrivers, setHiredDrivers] = useState<MarketDriver[]>(saveData.hiredDrivers ?? (saveData.hiredDriver ? [saveData.hiredDriver] : []))
  const [money, setMoney] = useState(saveData.money)
  const [filter, setFilter] = useState<'all' | 'affordable'>('all')
  const [pendingHireDriver, setPendingHireDriver] = useState<MarketDriver | null>(null)
  const [pendingHireCarNumber, setPendingHireCarNumber] = useState<string>('')

  const carNumbers = useMemo(() => {
    const fromEntries = (saveData.carEntries ?? []).map((entry) => entry.carNumber).filter((num) => !!num)
    return fromEntries.length > 0 ? fromEntries : [saveData.carNumber || '1']
  }, [saveData.carEntries, saveData.carNumber])

  const assignedCarByDriverId = useMemo(() => {
    const assigned = new Map<number, string>()
    for (const entry of saveData.carEntries ?? []) {
      if (entry.driverId !== undefined) assigned.set(entry.driverId, entry.carNumber)
    }
    return assigned
  }, [saveData.carEntries])

  const openCarNumbers = useMemo(() => {
    const taken = new Set<number>((saveData.carEntries ?? []).map((entry) => entry.driverId).filter((id): id is number => id !== undefined))
    return carNumbers.filter((num) => {
      const entry = (saveData.carEntries ?? []).find((carEntry) => carEntry.carNumber === num)
      return !!entry && (entry.driverId === undefined || (selected ? entry.driverId === selected.id : false)) && !taken.has(entry.driverId ?? -1)
    })
  }, [carNumbers, saveData.carEntries, selected])

  React.useEffect(() => {
    if (!pendingHireDriver) return
    if (pendingHireCarNumber && openCarNumbers.includes(pendingHireCarNumber)) return
    setPendingHireCarNumber(openCarNumbers[0] ?? '')
  }, [pendingHireDriver, pendingHireCarNumber, openCarNumbers])

  const filtered = filter === 'affordable'
    ? market.filter(d => d.salary <= money)
    : market

  const handleHire = (driver: MarketDriver, carNumber: string) => {
    if (hiredDrivers.length >= MAX_DRIVERS) return
    if (!carNumber) return

    const slotId = getActiveSlotId()
    if (!slotId) return
    const data = loadSlot(slotId)
    if (!data) return

    const drivers = data.hiredDrivers ?? []
    // Don't hire duplicates
    if (drivers.some(d => d.id === driver.id)) return

    const carEntry = (data.carEntries ?? []).find((entry) => entry.carNumber === carNumber)
    if (!carEntry || carEntry.driverId !== undefined) return

    drivers.push(driver)
    data.hiredDrivers = drivers
    carEntry.driverId = driver.id
    carEntry.driver = driver
    // Keep legacy field in sync with first driver
    data.hiredDriver = data.carEntries.find((entry) => entry.carNumber === data.carNumber)?.driver ?? drivers[0]
    saveSlot(data)
    setHiredDrivers([...drivers])
    setSelected(driver)
    setPendingHireDriver(null)
    setPendingHireCarNumber('')
    refreshSave()
  }

  const handleRelease = (driverId: number) => {
    const slotId = getActiveSlotId()
    if (!slotId) return
    const data = loadSlot(slotId)
    if (!data) return

    const drivers = (data.hiredDrivers ?? []).filter(d => d.id !== driverId)
    data.hiredDrivers = drivers
    data.carEntries = (data.carEntries ?? []).map((entry) => {
      if (entry.driverId !== driverId) return entry
      return { ...entry, driverId: undefined, driver: undefined }
    })
    data.hiredDriver = data.carEntries.find((entry) => entry.carNumber === data.carNumber)?.driver ?? drivers[0] ?? undefined
    saveSlot(data)
    setHiredDrivers([...drivers])
    if (selected?.id === driverId) setSelected(null)
    refreshSave()
  }

  // Keep money synced
  const syncMoney = () => {
    const slotId = getActiveSlotId()
    if (slotId) {
      const data = loadSlot(slotId)
      if (data) setMoney(data.money)
    }
  }
  React.useEffect(() => { syncMoney() }, [hiredDrivers])

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <h1 className={styles.heading}>Driver Market</h1>
        <span className={styles.balance}>Balance: {formatMoney(money)}</span>
      </div>

      {hiredDrivers.length > 0 && (
        <div className={styles.currentDriver}>
          <div className={styles.currentInfo}>
            <span className={styles.currentLabel}>Signed Drivers ({hiredDrivers.length}/{MAX_DRIVERS})</span>
            {hiredDrivers.map(d => (
              <div key={d.id} className={styles.hiredDriverRow}>
                <span className={styles.currentName}>{d.firstName} {d.lastName}</span>
                <span className={styles.currentCar}>#{assignedCarByDriverId.get(d.id) ?? '-'}</span>
                <span className={styles.currentSalary}>{formatMoney(d.salary)}/season</span>
                <button className={styles.releaseBtn} onClick={() => handleRelease(d.id)}>Release</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.filterRow}>
        <button className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`} onClick={() => setFilter('all')}>
          All Drivers ({market.length})
        </button>
        <button className={`${styles.filterBtn} ${filter === 'affordable' ? styles.active : ''}`} onClick={() => setFilter('affordable')}>
          Affordable
        </button>
      </div>

      <div className={styles.content}>
        <div className={styles.listCol}>
          {filtered.map(d => {
            const isHired = hiredDrivers.some(h => h.id === d.id)
            return (
              <button
                key={d.id}
                className={`${styles.driverCard} ${selected?.id === d.id ? styles.selectedCard : ''} ${isHired ? styles.hiredCard : ''}`}
                onClick={() => setSelected(d)}
              >
                <div className={styles.cardMain}>
                  <span className={styles.driverName}>{d.firstName} {d.lastName}</span>
                  <span className={styles.driverMeta}>Age {d.age} &middot; {d.experience} yr exp</span>
                </div>
                <div className={styles.cardRight}>
                  <span className={styles.salary}>{formatMoney(d.salary)}/season</span>
                  <span className={styles.overallBadge}>{Math.round((d.pace + d.racecraft + d.consistency) / 3)}</span>
                </div>
              </button>
            )
          })}
        </div>

        <div className={styles.detailCol}>
          {selected ? (
            <>
              <h2 className={styles.detailName}>{selected.firstName} {selected.lastName}</h2>
              <div className={styles.detailMeta}>
                <span>Age {selected.age}</span>
                <span>{selected.experience} yrs experience</span>
                <span>{formatMoney(selected.salary)}/season</span>
                {selected.contractRaces > 0 && <span>{selected.contractRaces}-race deal</span>}
              </div>

              <h3 className={styles.sectionTitle}>General Attributes</h3>
              <div className={styles.attrGrid}>
                {ATTR_LABELS.filter(a => a.group === 'general').map(a => (
                  <div key={a.key} className={styles.attrRow}>
                    <span className={styles.attrLabel}>{a.label}</span>
                    <div className={styles.attrBar}>
                      <div className={styles.attrFill} style={{ width: `${selected[a.key] as number}%`, background: attrColor(selected[a.key] as number) }} />
                    </div>
                    <span className={styles.attrVal} style={{ color: attrColor(selected[a.key] as number) }}>
                      {selected[a.key] as number}
                    </span>
                  </div>
                ))}
              </div>

              <h3 className={styles.sectionTitle}>Track Type Skills</h3>
              <div className={styles.attrGrid}>
                {ATTR_LABELS.filter(a => a.group === 'track').map(a => (
                  <div key={a.key} className={styles.attrRow}>
                    <span className={styles.attrLabel}>{a.label}</span>
                    <div className={styles.attrBar}>
                      <div className={styles.attrFill} style={{ width: `${selected[a.key] as number}%`, background: attrColor(selected[a.key] as number) }} />
                    </div>
                    <span className={styles.attrVal} style={{ color: attrColor(selected[a.key] as number) }}>
                      {selected[a.key] as number}
                    </span>
                  </div>
                ))}
              </div>

              {!hiredDrivers.some(d => d.id === selected.id) && hiredDrivers.length < MAX_DRIVERS && (
                <>
                  <button
                    className={styles.hireBtn}
                    onClick={() => {
                      setPendingHireDriver(selected)
                      setPendingHireCarNumber(openCarNumbers[0] ?? '')
                    }}
                    disabled={openCarNumbers.length === 0}
                  >
                    Sign {selected.firstName} {selected.lastName}
                  </button>
                  {openCarNumbers.length === 0 && (
                    <div className={styles.signedBadge} style={{ color: '#ff9800' }}>No Open Car Slots</div>
                  )}
                </>
              )}
              {!hiredDrivers.some(d => d.id === selected.id) && hiredDrivers.length >= MAX_DRIVERS && (
                <div className={styles.signedBadge} style={{ color: '#ff9800' }}>Roster Full (4/4)</div>
              )}
              {hiredDrivers.some(d => d.id === selected.id) && (
                <div className={styles.signedBadge}>&#10003; Signed To #{assignedCarByDriverId.get(selected.id) ?? '-'}</div>
              )}
            </>
          ) : (
            <p className={styles.selectPrompt}>Select a driver to view their attributes</p>
          )}
        </div>
      </div>

      {pendingHireDriver && (
        <div className={styles.modalOverlay} onClick={() => setPendingHireDriver(null)}>
          <div className={styles.hireModal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Assign Driver To Car</h3>
            <p className={styles.modalText}>
              Select which car number <strong>{pendingHireDriver.firstName} {pendingHireDriver.lastName}</strong> will drive.
            </p>
            <div className={styles.modalRow}>
              <label className={styles.modalLabel} htmlFor="hire-car-number">Car Number</label>
              <select
                id="hire-car-number"
                className={styles.modalSelect}
                value={pendingHireCarNumber}
                onChange={(e) => setPendingHireCarNumber(e.target.value)}
              >
                {openCarNumbers.map((carNumber) => (
                  <option key={`modal-assign-${carNumber}`} value={carNumber}>#{carNumber}</option>
                ))}
              </select>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.releaseBtn} onClick={() => setPendingHireDriver(null)}>Cancel</button>
              <button
                className={styles.hireBtn}
                onClick={() => handleHire(pendingHireDriver, pendingHireCarNumber)}
                disabled={!pendingHireCarNumber}
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Drivers
