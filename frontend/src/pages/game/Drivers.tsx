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

const Drivers: React.FC = () => {
  const { saveData, refreshSave } = useOutletContext<GameContext>()
  const seriesId = saveData.selectedSeries?.id ?? 3

  const market = useMemo(() => generateDriverMarket(seriesId), [seriesId])
  const [selected, setSelected] = useState<MarketDriver | null>(null)
  const [hired, setHired] = useState<MarketDriver | undefined>(saveData.hiredDriver)
  const [money, setMoney] = useState(saveData.money)
  const [filter, setFilter] = useState<'all' | 'affordable'>('all')

  const filtered = filter === 'affordable'
    ? market.filter(d => d.salary <= money)
    : market

  const handleHire = (driver: MarketDriver) => {
    const slotId = getActiveSlotId()
    if (!slotId) return
    const data = loadSlot(slotId)
    if (!data) return

    data.hiredDriver = driver
    data.money = data.money // salary deducted per-season, not upfront
    saveSlot(data)
    setHired(driver)
    setSelected(driver)
    refreshSave()
  }

  const handleRelease = () => {
    const slotId = getActiveSlotId()
    if (!slotId) return
    const data = loadSlot(slotId)
    if (!data) return

    data.hiredDriver = undefined
    saveSlot(data)
    setHired(undefined)
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
  React.useEffect(() => { syncMoney() }, [hired])

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <h1 className={styles.heading}>Driver Market</h1>
        <span className={styles.balance}>Balance: {formatMoney(money)}</span>
      </div>

      {hired && (
        <div className={styles.currentDriver}>
          <div className={styles.currentInfo}>
            <span className={styles.currentLabel}>Current Driver</span>
            <span className={styles.currentName}>{hired.firstName} {hired.lastName}</span>
            <span className={styles.currentSalary}>{formatMoney(hired.salary)}/season</span>
          </div>
          <button className={styles.releaseBtn} onClick={handleRelease}>Release Driver</button>
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
          {filtered.map(d => (
            <button
              key={d.id}
              className={`${styles.driverCard} ${selected?.id === d.id ? styles.selectedCard : ''} ${hired?.id === d.id ? styles.hiredCard : ''}`}
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
          ))}
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

              {hired?.id !== selected.id && (
                <button className={styles.hireBtn} onClick={() => handleHire(selected)}>
                  Sign {selected.firstName} {selected.lastName}
                </button>
              )}
              {hired?.id === selected.id && (
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
