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

  const filtered = filter === 'affordable'
    ? market.filter(d => d.salary <= money)
    : market

  const handleHire = (driver: MarketDriver) => {
    if (hiredDrivers.length >= MAX_DRIVERS) return
    const slotId = getActiveSlotId()
    if (!slotId) return
    const data = loadSlot(slotId)
    if (!data) return

    const drivers = data.hiredDrivers ?? []
    // Don't hire duplicates
    if (drivers.some(d => d.id === driver.id)) return
    drivers.push(driver)
    data.hiredDrivers = drivers
    // Keep legacy field in sync with first driver
    data.hiredDriver = drivers[0]
    saveSlot(data)
    setHiredDrivers([...drivers])
    setSelected(driver)
    refreshSave()
  }

  const handleRelease = (driverId: number) => {
    const slotId = getActiveSlotId()
    if (!slotId) return
    const data = loadSlot(slotId)
    if (!data) return

    const drivers = (data.hiredDrivers ?? []).filter(d => d.id !== driverId)
    data.hiredDrivers = drivers
    data.hiredDriver = drivers[0] ?? undefined
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
                <button className={styles.hireBtn} onClick={() => handleHire(selected)}>
                  Sign {selected.firstName} {selected.lastName}
                </button>
              )}
              {!hiredDrivers.some(d => d.id === selected.id) && hiredDrivers.length >= MAX_DRIVERS && (
                <div className={styles.signedBadge} style={{ color: '#ff9800' }}>Roster Full (4/4)</div>
              )}
              {hiredDrivers.some(d => d.id === selected.id) && (
                <div className={styles.signedBadge}>&#10003; Currently Signed</div>
              )}
            </>
          ) : (
            <p className={styles.selectPrompt}>Select a driver to view their attributes</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Drivers
