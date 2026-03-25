import React, { useState, useMemo } from 'react'
import { useOutletContext } from 'react-router-dom'
import styles from './Staff.module.css'
import {
  GameContext, MarketCrewChief, MarketSpotter, MarketPitCrewMember,
  PIT_CREW_ROLE_LABELS, PitCrewRole,
} from '../../types'
import { generateCrewChiefs, generateSpotters, generatePitCrew } from '../../data/staff'
import { getActiveSlotId, loadSlot, saveSlot } from '../../services/saveManager'

const formatMoney = (n: number) => `$${n.toLocaleString()}`

type Tab = 'crew_chief' | 'spotter' | 'pit_crew'

function attrColor(val: number): string {
  if (val >= 85) return '#4caf50'
  if (val >= 70) return '#8bc34a'
  if (val >= 55) return '#ffc107'
  if (val >= 40) return '#ff9800'
  return '#f44336'
}

function AttrBar({ label, value }: { label: string; value: number }) {
  return (
    <div className={styles.attrRow}>
      <span className={styles.attrLabel}>{label}</span>
      <div className={styles.attrBar}>
        <div className={styles.attrFill} style={{ width: `${value}%`, background: attrColor(value) }} />
      </div>
      <span className={styles.attrVal} style={{ color: attrColor(value) }}>{value}</span>
    </div>
  )
}

const PIT_ROLES_NEEDED: PitCrewRole[] = ['tire_changer_front', 'tire_changer_rear', 'tire_carrier_front', 'tire_carrier_rear', 'jackman']

const Staff: React.FC = () => {
  const { saveData, refreshSave } = useOutletContext<GameContext>()
  const seriesId = saveData.selectedSeries?.id ?? 3

  const crewChiefs = useMemo(() => generateCrewChiefs(seriesId), [seriesId])
  const spotters = useMemo(() => generateSpotters(seriesId), [seriesId])
  const pitPool = useMemo(() => generatePitCrew(seriesId), [seriesId])

  const [tab, setTab] = useState<Tab>('crew_chief')
  const [hiredCC, setHiredCC] = useState<MarketCrewChief | undefined>(saveData.hiredCrewChief)
  const [hiredSpotter, setHiredSpotter] = useState<MarketSpotter | undefined>(saveData.hiredSpotter)
  const [hiredPit, setHiredPit] = useState<MarketPitCrewMember[]>(saveData.hiredPitCrew ?? [])
  const [money, setMoney] = useState(saveData.money)
  const [selectedCC, setSelectedCC] = useState<MarketCrewChief | null>(null)
  const [selectedSp, setSelectedSp] = useState<MarketSpotter | null>(null)
  const [pitRoleFilter, setPitRoleFilter] = useState<PitCrewRole | 'all'>('all')

  const persistSave = () => {
    const slotId = getActiveSlotId()
    if (!slotId) return
    const data = loadSlot(slotId)
    if (!data) return
    setMoney(data.money)
  }

  // ---- Crew Chief ----
  const handleHireCC = (cc: MarketCrewChief) => {
    const slotId = getActiveSlotId()
    if (!slotId) return
    const data = loadSlot(slotId)
    if (!data) return
    data.hiredCrewChief = cc
    saveSlot(data)
    setHiredCC(cc)
    persistSave()
    refreshSave()
  }

  const handleReleaseCC = () => {
    const slotId = getActiveSlotId()
    if (!slotId) return
    const data = loadSlot(slotId)
    if (!data) return
    data.hiredCrewChief = undefined
    saveSlot(data)
    setHiredCC(undefined)
    refreshSave()
  }

  // ---- Spotter ----
  const handleHireSpotter = (sp: MarketSpotter) => {
    const slotId = getActiveSlotId()
    if (!slotId) return
    const data = loadSlot(slotId)
    if (!data) return
    data.hiredSpotter = sp
    saveSlot(data)
    setHiredSpotter(sp)
    persistSave()
    refreshSave()
  }

  const handleReleaseSpotter = () => {
    const slotId = getActiveSlotId()
    if (!slotId) return
    const data = loadSlot(slotId)
    if (!data) return
    data.hiredSpotter = undefined
    saveSlot(data)
    setHiredSpotter(undefined)
    refreshSave()
  }

  // ---- Pit Crew ----
  const handleHirePit = (member: MarketPitCrewMember) => {
    const slotId = getActiveSlotId()
    if (!slotId) return
    const data = loadSlot(slotId)
    if (!data) return

    // Replace existing member in same role, or add if slot open
    const existing = data.hiredPitCrew.findIndex(m => m.role === member.role)
    if (existing >= 0) {
      data.hiredPitCrew[existing] = member
    } else if (data.hiredPitCrew.length < 5) {
      data.hiredPitCrew.push(member)
    } else {
      return // crew is full
    }
    saveSlot(data)
    setHiredPit([...data.hiredPitCrew])
    persistSave()
    refreshSave()
  }

  const handleReleasePit = (role: PitCrewRole) => {
    const slotId = getActiveSlotId()
    if (!slotId) return
    const data = loadSlot(slotId)
    if (!data) return
    data.hiredPitCrew = data.hiredPitCrew.filter(m => m.role !== role)
    saveSlot(data)
    setHiredPit([...data.hiredPitCrew])
    refreshSave()
  }

  const filteredPit = pitRoleFilter === 'all' ? pitPool : pitPool.filter(m => m.role === pitRoleFilter)

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <h1 className={styles.heading}>Staff Market</h1>
        <span className={styles.balance}>Balance: {formatMoney(money)}</span>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button className={`${styles.tab} ${tab === 'crew_chief' ? styles.tabActive : ''}`} onClick={() => setTab('crew_chief')}>
          Crew Chief {hiredCC ? '✓' : ''}
        </button>
        <button className={`${styles.tab} ${tab === 'spotter' ? styles.tabActive : ''}`} onClick={() => setTab('spotter')}>
          Spotter {hiredSpotter ? '✓' : ''}
        </button>
        <button className={`${styles.tab} ${tab === 'pit_crew' ? styles.tabActive : ''}`} onClick={() => setTab('pit_crew')}>
          Pit Crew ({hiredPit.length}/5)
        </button>
      </div>

      {/* ======== CREW CHIEF TAB ======== */}
      {tab === 'crew_chief' && (
        <div className={styles.tabContent}>
          {hiredCC && (
            <div className={styles.hired}>
              <div className={styles.hiredInfo}>
                <span className={styles.hiredLabel}>Current Crew Chief</span>
                <span className={styles.hiredName}>{hiredCC.firstName} {hiredCC.lastName}</span>
                <span className={styles.hiredSalary}>{formatMoney(hiredCC.salary)}/season</span>
              </div>
              <button className={styles.releaseBtn} onClick={handleReleaseCC}>Release</button>
            </div>
          )}
          <div className={styles.grid}>
            {crewChiefs.map(cc => (
              <div
                key={cc.id}
                className={`${styles.staffCard} ${hiredCC?.id === cc.id ? styles.hiredStaffCard : ''} ${selectedCC?.id === cc.id ? styles.selectedStaffCard : ''}`}
                onClick={() => setSelectedCC(cc)}
              >
                <div className={styles.staffCardHeader}>
                  <span className={styles.staffName}>{cc.firstName} {cc.lastName}</span>
                  <span className={styles.staffSalary}>{formatMoney(cc.salary)}/season</span>
                </div>
                <span className={styles.staffMeta}>Age {cc.age} &middot; {cc.experience} yrs</span>
                <AttrBar label="Strategy" value={cc.strategy} />
                <AttrBar label="Setup" value={cc.setup} />
                <AttrBar label="Adaptability" value={cc.adaptability} />
                {hiredCC?.id !== cc.id ? (
                  <button className={styles.hireSmBtn} onClick={(e) => { e.stopPropagation(); handleHireCC(cc) }}>Hire</button>
                ) : (
                  <span className={styles.hiredTag}>Hired ✓</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======== SPOTTER TAB ======== */}
      {tab === 'spotter' && (
        <div className={styles.tabContent}>
          {hiredSpotter && (
            <div className={styles.hired}>
              <div className={styles.hiredInfo}>
                <span className={styles.hiredLabel}>Current Spotter</span>
                <span className={styles.hiredName}>{hiredSpotter.firstName} {hiredSpotter.lastName}</span>
                <span className={styles.hiredSalary}>{formatMoney(hiredSpotter.salary)}/season</span>
              </div>
              <button className={styles.releaseBtn} onClick={handleReleaseSpotter}>Release</button>
            </div>
          )}
          <div className={styles.grid}>
            {spotters.map(sp => (
              <div
                key={sp.id}
                className={`${styles.staffCard} ${hiredSpotter?.id === sp.id ? styles.hiredStaffCard : ''} ${selectedSp?.id === sp.id ? styles.selectedStaffCard : ''}`}
                onClick={() => setSelectedSp(sp)}
              >
                <div className={styles.staffCardHeader}>
                  <span className={styles.staffName}>{sp.firstName} {sp.lastName}</span>
                  <span className={styles.staffSalary}>{formatMoney(sp.salary)}/season</span>
                </div>
                <span className={styles.staffMeta}>Age {sp.age} &middot; {sp.experience} yrs</span>
                <AttrBar label="Awareness" value={sp.awareness} />
                <AttrBar label="Communication" value={sp.communication} />
                <AttrBar label="Positioning" value={sp.positioning} />
                {hiredSpotter?.id !== sp.id ? (
                  <button className={styles.hireSmBtn} onClick={(e) => { e.stopPropagation(); handleHireSpotter(sp) }}>Hire</button>
                ) : (
                  <span className={styles.hiredTag}>Hired ✓</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======== PIT CREW TAB ======== */}
      {tab === 'pit_crew' && (
        <div className={styles.tabContent}>
          {/* Current pit crew roster */}
          <div className={styles.pitRoster}>
            <h3 className={styles.subHead}>Your Pit Crew</h3>
            <div className={styles.pitSlots}>
              {PIT_ROLES_NEEDED.map(role => {
                const member = hiredPit.find(m => m.role === role)
                return (
                  <div key={role} className={`${styles.pitSlot} ${member ? styles.pitFilled : ''}`}>
                    <span className={styles.pitRoleLabel}>{PIT_CREW_ROLE_LABELS[role]}</span>
                    {member ? (
                      <>
                        <span className={styles.pitMemberName}>{member.firstName} {member.lastName}</span>
                        <span className={styles.pitMemberStats}>
                          SPD {member.speed} &middot; ACC {member.accuracy} &middot; CON {member.consistency}
                        </span>
                        <button className={styles.releasePitBtn} onClick={() => handleReleasePit(role)}>×</button>
                      </>
                    ) : (
                      <span className={styles.pitEmpty}>Empty</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Role filter */}
          <div className={styles.filterRow}>
            <button className={`${styles.filterBtn} ${pitRoleFilter === 'all' ? styles.active : ''}`} onClick={() => setPitRoleFilter('all')}>All</button>
            {PIT_ROLES_NEEDED.map(role => (
              <button
                key={role}
                className={`${styles.filterBtn} ${pitRoleFilter === role ? styles.active : ''}`}
                onClick={() => setPitRoleFilter(role)}
              >
                {PIT_CREW_ROLE_LABELS[role]}
              </button>
            ))}
          </div>

          <div className={styles.grid}>
            {filteredPit.map(m => {
              const isHired = hiredPit.some(h => h.id === m.id)
              return (
                <div key={m.id} className={`${styles.staffCard} ${isHired ? styles.hiredStaffCard : ''}`}>
                  <div className={styles.staffCardHeader}>
                    <span className={styles.staffName}>{m.firstName} {m.lastName}</span>
                    <span className={styles.staffSalary}>{formatMoney(m.salary)}/season</span>
                  </div>
                  <span className={styles.pitRoleBadge}>{PIT_CREW_ROLE_LABELS[m.role]}</span>
                  <AttrBar label="Speed" value={m.speed} />
                  <AttrBar label="Accuracy" value={m.accuracy} />
                  <AttrBar label="Consistency" value={m.consistency} />
                  {!isHired ? (
                    <button className={styles.hireSmBtn} onClick={() => handleHirePit(m)}>Hire</button>
                  ) : (
                    <span className={styles.hiredTag}>Hired ✓</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default Staff
