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
  const [hiredPit, setHiredPit] = useState<MarketPitCrewMember[]>((saveData.carEntries ?? []).flatMap((entry) => entry.pitCrew ?? []))
  const [money, setMoney] = useState(saveData.money)
  const [selectedCC, setSelectedCC] = useState<MarketCrewChief | null>(null)
  const [selectedSp, setSelectedSp] = useState<MarketSpotter | null>(null)
  const [pitRoleFilter, setPitRoleFilter] = useState<PitCrewRole | 'all'>('all')
  const [pendingCC, setPendingCC] = useState<MarketCrewChief | null>(null)
  const [pendingCCCar, setPendingCCCar] = useState('')
  const [pendingSpotter, setPendingSpotter] = useState<MarketSpotter | null>(null)
  const [pendingSpotterCar, setPendingSpotterCar] = useState('')
  const [pendingPit, setPendingPit] = useState<MarketPitCrewMember | null>(null)
  const [pendingPitCar, setPendingPitCar] = useState('')

  const carNumbers = useMemo(() => {
    const entries = (saveData.carEntries ?? []).map((entry) => entry.carNumber).filter((num) => !!num)
    if (entries.length > 0) return entries
    return [saveData.carNumber || '1']
  }, [saveData.carEntries, saveData.carNumber])

  const getCarDisplay = (carNumber: string): string => {
    if (!carNumber || carNumber === '-') return 'Unassigned'
    const entry = (saveData.carEntries ?? []).find((carEntry) => carEntry.carNumber === carNumber)
    const lastName = entry?.driver?.lastName?.trim()
    return lastName ? `#${carNumber} - ${lastName}` : `#${carNumber}`
  }

  const crewChiefCarById = useMemo(() => {
    const map = new Map<number, string>()
    for (const entry of saveData.carEntries ?? []) {
      if (entry.crewChief) map.set(entry.crewChief.id, entry.carNumber)
    }
    return map
  }, [saveData.carEntries])

  const spotterCarById = useMemo(() => {
    const map = new Map<number, string>()
    for (const entry of saveData.carEntries ?? []) {
      if (entry.spotter) map.set(entry.spotter.id, entry.carNumber)
    }
    return map
  }, [saveData.carEntries])

  const pitCarByMemberId = useMemo(() => {
    const map = new Map<number, string>()
    for (const entry of saveData.carEntries ?? []) {
      for (const member of entry.pitCrew ?? []) {
        map.set(member.id, entry.carNumber)
      }
    }
    return map
  }, [saveData.carEntries])

  const openCrewChiefCars = useMemo(() => {
    return carNumbers.filter((carNumber) => {
      const entry = (saveData.carEntries ?? []).find((carEntry) => carEntry.carNumber === carNumber)
      return !!entry && !entry.crewChief
    })
  }, [carNumbers, saveData.carEntries])

  const openSpotterCars = useMemo(() => {
    return carNumbers.filter((carNumber) => {
      const entry = (saveData.carEntries ?? []).find((carEntry) => carEntry.carNumber === carNumber)
      return !!entry && !entry.spotter
    })
  }, [carNumbers, saveData.carEntries])

  const openPitCarsForRole = (role: PitCrewRole): string[] => {
    return carNumbers.filter((carNumber) => {
      const entry = (saveData.carEntries ?? []).find((carEntry) => carEntry.carNumber === carNumber)
      return !!entry && !(entry.pitCrew ?? []).some((member) => member.role === role)
    })
  }

  const persistSave = () => {
    const slotId = getActiveSlotId()
    if (!slotId) return
    const data = loadSlot(slotId)
    if (!data) return
    setMoney(data.money)
  }

  // ---- Crew Chief ----
  const handleHireCC = (cc: MarketCrewChief, carNumber: string) => {
    if (hiredCCs.length >= MAX_STAFF) return
    if (!carNumber) return
    if (hiredCCs.some(c => c.id === cc.id)) return
    const slotId = getActiveSlotId()
    if (!slotId) return
    const data = loadSlot(slotId)
    if (!data) return
    const entry = (data.carEntries ?? []).find((carEntry) => carEntry.carNumber === carNumber)
    if (!entry || entry.crewChief) return
    const ccs = data.hiredCrewChiefs ?? []
    ccs.push(cc)
    data.hiredCrewChiefs = ccs
    entry.crewChief = cc
    data.hiredCrewChief = data.carEntries.find((carEntry) => carEntry.carNumber === data.carNumber)?.crewChief ?? ccs[0]
    saveSlot(data)
    setHiredCCs([...ccs])
    setPendingCC(null)
    setPendingCCCar('')
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
    data.carEntries = (data.carEntries ?? []).map((entry) => {
      if (entry.crewChief?.id !== ccId) return entry
      return { ...entry, crewChief: undefined }
    })
    data.hiredCrewChief = data.carEntries.find((carEntry) => carEntry.carNumber === data.carNumber)?.crewChief ?? ccs[0] ?? undefined
    saveSlot(data)
    setHiredCCs([...ccs])
    refreshSave()
  }

  // ---- Spotter ----
  const handleHireSpotter = (sp: MarketSpotter, carNumber: string) => {
    if (hiredSpotters.length >= MAX_STAFF) return
    if (!carNumber) return
    if (hiredSpotters.some(s => s.id === sp.id)) return
    const slotId = getActiveSlotId()
    if (!slotId) return
    const data = loadSlot(slotId)
    if (!data) return
    const entry = (data.carEntries ?? []).find((carEntry) => carEntry.carNumber === carNumber)
    if (!entry || entry.spotter) return
    const sps = data.hiredSpotters ?? []
    sps.push(sp)
    data.hiredSpotters = sps
    entry.spotter = sp
    data.hiredSpotter = data.carEntries.find((carEntry) => carEntry.carNumber === data.carNumber)?.spotter ?? sps[0]
    saveSlot(data)
    setHiredSpotters([...sps])
    setPendingSpotter(null)
    setPendingSpotterCar('')
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
    data.carEntries = (data.carEntries ?? []).map((entry) => {
      if (entry.spotter?.id !== spId) return entry
      return { ...entry, spotter: undefined }
    })
    data.hiredSpotter = data.carEntries.find((carEntry) => carEntry.carNumber === data.carNumber)?.spotter ?? sps[0] ?? undefined
    saveSlot(data)
    setHiredSpotters([...sps])
    refreshSave()
  }

  // ---- Pit Crew ----
  const handleHirePit = (member: MarketPitCrewMember, carNumber: string) => {
    if (!carNumber) return
    const slotId = getActiveSlotId()
    if (!slotId) return
    const data = loadSlot(slotId)
    if (!data) return

    const carEntry = (data.carEntries ?? []).find((entry) => entry.carNumber === carNumber)
    if (!carEntry) return
    const assignedToAnyCar = (data.carEntries ?? []).some((entry) => (entry.pitCrew ?? []).some((pitMember) => pitMember.id === member.id))
    if (assignedToAnyCar) return

    const existingRole = (carEntry.pitCrew ?? []).some((pitMember) => pitMember.role === member.role)
    if (existingRole) return

    carEntry.pitCrew = [...(carEntry.pitCrew ?? []), member]
    data.hiredPitCrews = (data.carEntries ?? []).map((entry) => entry.pitCrew ?? [])
    data.hiredPitCrew = (data.carEntries ?? []).find((entry) => entry.carNumber === data.carNumber)?.pitCrew ?? []
    saveSlot(data)
    setHiredPit((data.carEntries ?? []).flatMap((entry) => entry.pitCrew ?? []))
    setPendingPit(null)
    setPendingPitCar('')
    persistSave()
    refreshSave()
  }

  const handleReleasePit = (carNumber: string, role: PitCrewRole) => {
    const slotId = getActiveSlotId()
    if (!slotId) return
    const data = loadSlot(slotId)
    if (!data) return

    data.carEntries = (data.carEntries ?? []).map((entry) => {
      if (entry.carNumber !== carNumber) return entry
      return { ...entry, pitCrew: (entry.pitCrew ?? []).filter((member) => member.role !== role) }
    })

    data.hiredPitCrews = (data.carEntries ?? []).map((entry) => entry.pitCrew ?? [])
    data.hiredPitCrew = (data.carEntries ?? []).find((entry) => entry.carNumber === data.carNumber)?.pitCrew ?? []
    saveSlot(data)
    setHiredPit((data.carEntries ?? []).flatMap((entry) => entry.pitCrew ?? []))
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
          Crew Chiefs ({hiredCCs.length}/{carNumbers.length})
        </button>
        <button className={`${styles.tab} ${tab === 'spotter' ? styles.tabActive : ''}`} onClick={() => setTab('spotter')}>
          Spotters ({hiredSpotters.length}/{carNumbers.length})
        </button>
        <button className={`${styles.tab} ${tab === 'pit_crew' ? styles.tabActive : ''}`} onClick={() => setTab('pit_crew')}>
          Pit Crew ({hiredPit.length}/{carNumbers.length * 6})
        </button>
      </div>

      {/* ======== CREW CHIEF TAB ======== */}
      {tab === 'crew_chief' && (
        <div className={styles.tabContent}>
          {hiredCCs.length > 0 && (
            <div className={styles.hired}>
              <span className={styles.hiredLabel}>Signed Crew Chiefs ({hiredCCs.length}/{carNumbers.length})</span>
              {hiredCCs.map(cc => (
                <div key={cc.id} className={styles.hiredRow}>
                  <div className={styles.hiredInfo}>
                    <span className={styles.hiredName}>{cc.firstName} {cc.lastName}</span>
                    <span className={styles.hiredCar}>{getCarDisplay(crewChiefCarById.get(cc.id) ?? '-')}</span>
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
              const noOpenCars = openCrewChiefCars.length === 0
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
                  ) : noOpenCars ? (
                    <span className={styles.hiredTag}>All Cars Staffed</span>
                  ) : (
                    <button className={styles.hireSmBtn} onClick={(e) => { e.stopPropagation(); setPendingCC(cc); setPendingCCCar(openCrewChiefCars[0] ?? '') }}>Hire</button>
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
              <span className={styles.hiredLabel}>Signed Spotters ({hiredSpotters.length}/{carNumbers.length})</span>
              {hiredSpotters.map(sp => (
                <div key={sp.id} className={styles.hiredRow}>
                  <div className={styles.hiredInfo}>
                    <span className={styles.hiredName}>{sp.firstName} {sp.lastName}</span>
                    <span className={styles.hiredCar}>{getCarDisplay(spotterCarById.get(sp.id) ?? '-')}</span>
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
              const noOpenCars = openSpotterCars.length === 0
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
                  ) : noOpenCars ? (
                    <span className={styles.hiredTag}>All Cars Staffed</span>
                  ) : (
                    <button className={styles.hireSmBtn} onClick={(e) => { e.stopPropagation(); setPendingSpotter(sp); setPendingSpotterCar(openSpotterCars[0] ?? '') }}>Hire</button>
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
            <div className={styles.carRosterGrid}>
              {carNumbers.map((carNumber) => {
                const entry = (saveData.carEntries ?? []).find((carEntry) => carEntry.carNumber === carNumber)
                return (
                  <div key={`pit-car-${carNumber}`} className={styles.pitCarBlock}>
                    <h4 className={styles.pitCarHeader}>{getCarDisplay(carNumber)}</h4>
                    <div className={styles.pitSlots}>
                      {PIT_ROLES_NEEDED.map(role => {
                        const member = (entry?.pitCrew ?? []).find(m => m.role === role)
                        return (
                          <div key={`${carNumber}-${role}`} className={`${styles.pitSlot} ${member ? styles.pitFilled : ''}`}>
                            <span className={styles.pitRoleLabel}>{PIT_CREW_ROLE_LABELS[role]}</span>
                            {member ? (
                              <>
                                <span className={styles.pitMemberName}>{member.firstName} {member.lastName}</span>
                                <span className={styles.pitMemberStats}>
                                  SPD {member.speed} &middot; ACC {member.accuracy} &middot; CON {member.consistency}
                                </span>
                                <button className={styles.releasePitBtn} onClick={() => handleReleasePit(carNumber, role)}>×</button>
                              </>
                            ) : (
                              <span className={styles.pitEmpty}>Empty</span>
                            )}
                          </div>
                        )
                      })}
                    </div>
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
              const openCarsForRole = openPitCarsForRole(m.role)
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
                  {isHired && <span className={styles.hiredCar}>{getCarDisplay(pitCarByMemberId.get(m.id) ?? '-')}</span>}
                  {!isHired && openCarsForRole.length > 0 ? (
                    <button className={styles.hireSmBtn} onClick={() => { setPendingPit(m); setPendingPitCar(openCarsForRole[0] ?? '') }}>
                      Hire
                    </button>
                  ) : !isHired ? (
                    <span className={styles.hiredTag}>Role Filled On All Cars</span>
                  ) : (
                    <span className={styles.hiredTag}>Hired ✓</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {pendingCC && (
        <div className={styles.modalOverlay} onClick={() => setPendingCC(null)}>
          <div className={styles.hireModal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Assign Crew Chief</h3>
            <p className={styles.modalText}>Choose which car this crew chief will manage.</p>
            <div className={styles.modalRow}>
              <label className={styles.modalLabel} htmlFor="assign-cc-car">Car Number</label>
              <select id="assign-cc-car" className={styles.modalSelect} value={pendingCCCar} onChange={(e) => setPendingCCCar(e.target.value)}>
                {openCrewChiefCars.map((carNumber) => (
                  <option key={`assign-cc-${carNumber}`} value={carNumber}>{getCarDisplay(carNumber)}</option>
                ))}
              </select>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.releaseBtn} onClick={() => setPendingCC(null)}>Cancel</button>
              <button className={styles.hireSmBtn} onClick={() => handleHireCC(pendingCC, pendingCCCar)} disabled={!pendingCCCar}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {pendingSpotter && (
        <div className={styles.modalOverlay} onClick={() => setPendingSpotter(null)}>
          <div className={styles.hireModal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Assign Spotter</h3>
            <p className={styles.modalText}>Choose which car this spotter will support.</p>
            <div className={styles.modalRow}>
              <label className={styles.modalLabel} htmlFor="assign-spotter-car">Car Number</label>
              <select id="assign-spotter-car" className={styles.modalSelect} value={pendingSpotterCar} onChange={(e) => setPendingSpotterCar(e.target.value)}>
                {openSpotterCars.map((carNumber) => (
                  <option key={`assign-spotter-${carNumber}`} value={carNumber}>{getCarDisplay(carNumber)}</option>
                ))}
              </select>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.releaseBtn} onClick={() => setPendingSpotter(null)}>Cancel</button>
              <button className={styles.hireSmBtn} onClick={() => handleHireSpotter(pendingSpotter, pendingSpotterCar)} disabled={!pendingSpotterCar}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {pendingPit && (
        <div className={styles.modalOverlay} onClick={() => setPendingPit(null)}>
          <div className={styles.hireModal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Assign Pit Crew Member</h3>
            <p className={styles.modalText}>Choose which car this {PIT_CREW_ROLE_LABELS[pendingPit.role]} will join.</p>
            <div className={styles.modalRow}>
              <label className={styles.modalLabel} htmlFor="assign-pit-car">Car Number</label>
              <select id="assign-pit-car" className={styles.modalSelect} value={pendingPitCar} onChange={(e) => setPendingPitCar(e.target.value)}>
                {openPitCarsForRole(pendingPit.role).map((carNumber) => (
                  <option key={`assign-pit-${carNumber}`} value={carNumber}>{getCarDisplay(carNumber)}</option>
                ))}
              </select>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.releaseBtn} onClick={() => setPendingPit(null)}>Cancel</button>
              <button className={styles.hireSmBtn} onClick={() => handleHirePit(pendingPit, pendingPitCar)} disabled={!pendingPitCar}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Staff
