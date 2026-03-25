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

const PIT_ROLES_NEEDED: PitCrewRole[] = ['tire_changer_front', 'tire_changer_rear', 'tire_carrier_front', 'tire_carrier_rear', 'jackman', 'gas_man']

const MAX_STAFF = 4

const Staff: React.FC = () => {
  const { saveData, refreshSave } = useOutletContext<GameContext>()
  const seriesId = saveData.selectedSeries?.id ?? 3

  const crewChiefs = useMemo(() => generateCrewChiefs(seriesId), [seriesId])
  const spotters = useMemo(() => generateSpotters(seriesId), [seriesId])
  const pitPool = useMemo(() => generatePitCrew(seriesId), [seriesId])

  const [tab, setTab] = useState<Tab>('crew_chief')
  const [hiredCCs, setHiredCCs] = useState<MarketCrewChief[]>(saveData.hiredCrewChiefs ?? (saveData.hiredCrewChief ? [saveData.hiredCrewChief] : []))
  const [hiredSpotters, setHiredSpotters] = useState<MarketSpotter[]>(saveData.hiredSpotters ?? (saveData.hiredSpotter ? [saveData.hiredSpotter] : []))
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
    if (hiredCCs.length >= MAX_STAFF) return
    if (hiredCCs.some(c => c.id === cc.id)) return
    const slotId = getActiveSlotId()
    if (!slotId) return
    const data = loadSlot(slotId)
    if (!data) return
    const ccs = data.hiredCrewChiefs ?? []
    ccs.push(cc)
    data.hiredCrewChiefs = ccs
    data.hiredCrewChief = ccs[0]
    saveSlot(data)
    setHiredCCs([...ccs])
    persistSave()
    refreshSave()
  }

  const handleReleaseCC = (ccId: number) => {
    const slotId = getActiveSlotId()
    if (!slotId) return
    const data = loadSlot(slotId)
    if (!data) return
    const ccs = (data.hiredCrewChiefs ?? []).filter(c => c.id !== ccId)
    data.hiredCrewChiefs = ccs
    data.hiredCrewChief = ccs[0] ?? undefined
    saveSlot(data)
    setHiredCCs([...ccs])
    refreshSave()
  }

  // ---- Spotter ----
  const handleHireSpotter = (sp: MarketSpotter) => {
    if (hiredSpotters.length >= MAX_STAFF) return
    if (hiredSpotters.some(s => s.id === sp.id)) return
    const slotId = getActiveSlotId()
    if (!slotId) return
    const data = loadSlot(slotId)
    if (!data) return
    const sps = data.hiredSpotters ?? []
    sps.push(sp)
    data.hiredSpotters = sps
    data.hiredSpotter = sps[0]
    saveSlot(data)
    setHiredSpotters([...sps])
    persistSave()
    refreshSave()
  }

  const handleReleaseSpotter = (spId: number) => {
    const slotId = getActiveSlotId()
    if (!slotId) return
    const data = loadSlot(slotId)
    if (!data) return
    const sps = (data.hiredSpotters ?? []).filter(s => s.id !== spId)
    data.hiredSpotters = sps
    data.hiredSpotter = sps[0] ?? undefined
    saveSlot(data)
    setHiredSpotters([...sps])
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
    } else if (data.hiredPitCrew.length < 6) {
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
          Crew Chiefs ({hiredCCs.length}/{MAX_STAFF})
        </button>
        <button className={`${styles.tab} ${tab === 'spotter' ? styles.tabActive : ''}`} onClick={() => setTab('spotter')}>
          Spotters ({hiredSpotters.length}/{MAX_STAFF})
        </button>
        <button className={`${styles.tab} ${tab === 'pit_crew' ? styles.tabActive : ''}`} onClick={() => setTab('pit_crew')}>
          Pit Crew ({hiredPit.length}/6)
        </button>
      </div>

      {/* ======== CREW CHIEF TAB ======== */}
      {tab === 'crew_chief' && (
        <div className={styles.tabContent}>
          {hiredCCs.length > 0 && (
            <div className={styles.hired}>
              <span className={styles.hiredLabel}>Signed Crew Chiefs ({hiredCCs.length}/{MAX_STAFF})</span>
              {hiredCCs.map(cc => (
                <div key={cc.id} className={styles.hiredRow}>
                  <div className={styles.hiredInfo}>
                    <span className={styles.hiredName}>{cc.firstName} {cc.lastName}</span>
                    <span className={styles.hiredSalary}>{formatMoney(cc.salary)}/season</span>
                  </div>
                  <button className={styles.releaseBtn} onClick={() => handleReleaseCC(cc.id)}>Release</button>
                </div>
              ))}
            </div>
          )}
          <div className={styles.grid}>
            {crewChiefs.map(cc => {
              const isHired = hiredCCs.some(c => c.id === cc.id)
              const rosterFull = hiredCCs.length >= MAX_STAFF
              return (
                <div
                  key={cc.id}
                  className={`${styles.staffCard} ${isHired ? styles.hiredStaffCard : ''} ${selectedCC?.id === cc.id ? styles.selectedStaffCard : ''}`}
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
                  {isHired ? (
                    <span className={styles.hiredTag}>Hired ✓</span>
                  ) : rosterFull ? (
                    <span className={styles.hiredTag}>Roster Full</span>
                  ) : (
                    <button className={styles.hireSmBtn} onClick={(e) => { e.stopPropagation(); handleHireCC(cc) }}>Hire</button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ======== SPOTTER TAB ======== */}
      {tab === 'spotter' && (
        <div className={styles.tabContent}>
          {hiredSpotters.length > 0 && (
            <div className={styles.hired}>
              <span className={styles.hiredLabel}>Signed Spotters ({hiredSpotters.length}/{MAX_STAFF})</span>
              {hiredSpotters.map(sp => (
                <div key={sp.id} className={styles.hiredRow}>
                  <div className={styles.hiredInfo}>
                    <span className={styles.hiredName}>{sp.firstName} {sp.lastName}</span>
                    <span className={styles.hiredSalary}>{formatMoney(sp.salary)}/season</span>
                  </div>
                  <button className={styles.releaseBtn} onClick={() => handleReleaseSpotter(sp.id)}>Release</button>
                </div>
              ))}
            </div>
          )}
          <div className={styles.grid}>
            {spotters.map(sp => {
              const isHired = hiredSpotters.some(s => s.id === sp.id)
              const rosterFull = hiredSpotters.length >= MAX_STAFF
              return (
                <div
                  key={sp.id}
                  className={`${styles.staffCard} ${isHired ? styles.hiredStaffCard : ''} ${selectedSp?.id === sp.id ? styles.selectedStaffCard : ''}`}
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
                  {isHired ? (
                    <span className={styles.hiredTag}>Hired ✓</span>
                  ) : rosterFull ? (
                    <span className={styles.hiredTag}>Roster Full</span>
                  ) : (
                    <button className={styles.hireSmBtn} onClick={(e) => { e.stopPropagation(); handleHireSpotter(sp) }}>Hire</button>
                  )}
                </div>
              )
            })}
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
