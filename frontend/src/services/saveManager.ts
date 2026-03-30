import { SaveSlotData } from '../types'

const SLOT_COUNT = 5
const SLOT_KEY_PREFIX = 'saveSlot_'

export function getSlotKey(slotId: number): string {
  return `${SLOT_KEY_PREFIX}${slotId}`
}

export function loadSlot(slotId: number): SaveSlotData | null {
  const raw = localStorage.getItem(getSlotKey(slotId))
  if (!raw) return null
  try {
    const data = JSON.parse(raw) as SaveSlotData
    // Migrate older saves missing new fields
    if (!data.hiredPitCrew) data.hiredPitCrew = []
    if (!data.seasonResults) data.seasonResults = []
    if (!data.standings) data.standings = []
    // Migrate inventory items missing health
    for (const inv of data.inventory ?? []) {
      if (inv.health === undefined || inv.health === null) inv.health = 100
    }
    // Migrate chassis items' installed parts missing health
    for (const ch of data.chassis ?? []) {
      if (!ch.trackType) ch.trackType = 'intermediate'
      for (const p of ch.installedParts ?? []) {
        if (p.health === undefined || p.health === null) p.health = 100
      }
    }
    // Day-based calendar migration
    if (!data.currentDate) {
      const year = data.currentSeason || 2026
      data.currentDate = `${year}-01-01`
    }
    if (!data.carNumber) data.carNumber = '1'
    if (!data.maxAge) data.maxAge = 65
    if (!data.ownerStandings) data.ownerStandings = []
    if (!data.seasonPhase) data.seasonPhase = 'regular'
    if (data.driverChampionshipEarnings === undefined) data.driverChampionshipEarnings = 0
    if (data.ownerChampionshipEarnings === undefined) data.ownerChampionshipEarnings = 0
    // Multi-car / multi-staff migration
    if (!data.carEntries) data.carEntries = []
    if (data.carEntries.length === 0 && data.carNumber) {
      data.carEntries = [{ carNumber: data.carNumber, pitCrew: [] }]
    }
    const availableCarNumbers = new Set((data.carEntries ?? []).map((entry) => entry.carNumber))
    if (availableCarNumbers.size > 0 && !availableCarNumbers.has(data.carNumber)) {
      data.carNumber = data.carEntries[0].carNumber
    }
    for (const ch of data.chassis ?? []) {
      const hasInstalledParts = (ch.installedParts?.length ?? 0) > 0
      const hasValidAssignedCar = !!ch.carNumber && (availableCarNumbers.size === 0 || availableCarNumbers.has(ch.carNumber))
      if (hasValidAssignedCar) continue

      // Legacy saves: keep empty chassis shared across all car garages until first install.
      if (!hasInstalledParts) {
        ch.carNumber = undefined
      } else {
        ch.carNumber = data.carNumber
      }
    }
    if (!data.hiredDrivers) {
      data.hiredDrivers = data.hiredDriver ? [data.hiredDriver] : []
    }
    if (!data.hiredCrewChiefs) {
      data.hiredCrewChiefs = data.hiredCrewChief ? [data.hiredCrewChief] : []
    }
    if (!data.hiredSpotters) {
      data.hiredSpotters = data.hiredSpotter ? [data.hiredSpotter] : []
    }
    if (!data.hiredPitCrews) {
      data.hiredPitCrews = data.hiredPitCrew.length > 0 ? [data.hiredPitCrew] : []
    }
    if (!data.orgStats) {
      data.orgStats = { championshipWins: 0, raceWins: 0, top5s: 0, top10s: 0, poles: 0, races: 0, dnfs: 0 }
    }

    // Keep driver assignments normalized across multi-car entries.
    const hiredDriversById = new Map((data.hiredDrivers ?? []).map((driver) => [driver.id, driver]))
    const assignedDriverIds = new Set<number>()
    data.carEntries = (data.carEntries ?? []).map((entry) => {
      if (entry.driverId === undefined) return { ...entry, driver: undefined }
      const driver = hiredDriversById.get(entry.driverId)
      if (!driver) return { ...entry, driverId: undefined, driver: undefined }
      assignedDriverIds.add(driver.id)
      return { ...entry, driver }
    })

    const unassignedDrivers = (data.hiredDrivers ?? []).filter((driver) => !assignedDriverIds.has(driver.id))
    if (unassignedDrivers.length > 0) {
      data.carEntries = data.carEntries.map((entry) => {
        if (entry.driverId !== undefined) return entry
        const nextDriver = unassignedDrivers.shift()
        if (!nextDriver) return entry
        assignedDriverIds.add(nextDriver.id)
        return { ...entry, driverId: nextDriver.id, driver: nextDriver }
      })
    }

    const hiredCrewChiefById = new Map((data.hiredCrewChiefs ?? []).map((crewChief) => [crewChief.id, crewChief]))
    const assignedCrewChiefIds = new Set<number>()
    data.carEntries = data.carEntries.map((entry) => {
      if (!entry.crewChief) return { ...entry, crewChief: undefined }
      const crewChief = hiredCrewChiefById.get(entry.crewChief.id)
      if (!crewChief) return { ...entry, crewChief: undefined }
      assignedCrewChiefIds.add(crewChief.id)
      return { ...entry, crewChief }
    })

    const unassignedCrewChiefs = (data.hiredCrewChiefs ?? []).filter((crewChief) => !assignedCrewChiefIds.has(crewChief.id))
    if (unassignedCrewChiefs.length > 0) {
      data.carEntries = data.carEntries.map((entry) => {
        if (entry.crewChief) return entry
        const nextCrewChief = unassignedCrewChiefs.shift()
        if (!nextCrewChief) return entry
        assignedCrewChiefIds.add(nextCrewChief.id)
        return { ...entry, crewChief: nextCrewChief }
      })
    }

    const hiredSpotterById = new Map((data.hiredSpotters ?? []).map((spotter) => [spotter.id, spotter]))
    const assignedSpotterIds = new Set<number>()
    data.carEntries = data.carEntries.map((entry) => {
      if (!entry.spotter) return { ...entry, spotter: undefined }
      const spotter = hiredSpotterById.get(entry.spotter.id)
      if (!spotter) return { ...entry, spotter: undefined }
      assignedSpotterIds.add(spotter.id)
      return { ...entry, spotter }
    })

    const unassignedSpotters = (data.hiredSpotters ?? []).filter((spotter) => !assignedSpotterIds.has(spotter.id))
    if (unassignedSpotters.length > 0) {
      data.carEntries = data.carEntries.map((entry) => {
        if (entry.spotter) return entry
        const nextSpotter = unassignedSpotters.shift()
        if (!nextSpotter) return entry
        assignedSpotterIds.add(nextSpotter.id)
        return { ...entry, spotter: nextSpotter }
      })
    }

    const pitPoolById = new Map<number, SaveSlotData['hiredPitCrew'][number]>()
    for (const member of data.hiredPitCrew ?? []) {
      if (!pitPoolById.has(member.id)) pitPoolById.set(member.id, member)
    }
    for (const crew of data.hiredPitCrews ?? []) {
      for (const member of crew ?? []) {
        if (!pitPoolById.has(member.id)) pitPoolById.set(member.id, member)
      }
    }
    for (const entry of data.carEntries ?? []) {
      for (const member of entry.pitCrew ?? []) {
        if (!pitPoolById.has(member.id)) pitPoolById.set(member.id, member)
      }
    }

    const assignedPitIds = new Set<number>()
    data.carEntries = data.carEntries.map((entry) => {
      const seenRoles = new Set<string>()
      const cleaned = (entry.pitCrew ?? []).filter((member) => {
        if (assignedPitIds.has(member.id)) return false
        if (seenRoles.has(member.role)) return false
        const canonical = pitPoolById.get(member.id)
        if (!canonical) return false
        seenRoles.add(member.role)
        assignedPitIds.add(canonical.id)
        return true
      })
      return { ...entry, pitCrew: cleaned }
    })

    const unassignedPit = Array.from(pitPoolById.values()).filter((member) => !assignedPitIds.has(member.id))
    if (unassignedPit.length > 0) {
      data.carEntries = data.carEntries.map((entry) => {
        let updatedPit = [...(entry.pitCrew ?? [])]
        for (const roleMember of [...unassignedPit]) {
          const hasRole = updatedPit.some((member) => member.role === roleMember.role)
          if (hasRole) continue
          updatedPit.push(roleMember)
          assignedPitIds.add(roleMember.id)
          const idx = unassignedPit.findIndex((member) => member.id === roleMember.id)
          if (idx >= 0) unassignedPit.splice(idx, 1)
          if (updatedPit.length >= 6) break
        }
        return { ...entry, pitCrew: updatedPit }
      })
    }

    data.hiredPitCrews = data.carEntries.map((entry) => entry.pitCrew ?? [])
    data.hiredPitCrew = data.carEntries.find((entry) => entry.carNumber === data.carNumber)?.pitCrew ?? []
    data.hiredCrewChief = data.carEntries.find((entry) => entry.carNumber === data.carNumber)?.crewChief ?? data.hiredCrewChiefs[0] ?? undefined
    data.hiredSpotter = data.carEntries.find((entry) => entry.carNumber === data.carNumber)?.spotter ?? data.hiredSpotters[0] ?? undefined
    data.hiredDriver = data.carEntries.find((entry) => entry.carNumber === data.carNumber)?.driver ?? data.hiredDrivers[0] ?? undefined
    return data
  } catch {
    return null
  }
}

export function saveSlot(data: SaveSlotData): void {
  localStorage.setItem(getSlotKey(data.slotId), JSON.stringify(data))
}

export function deleteSlot(slotId: number): void {
  localStorage.removeItem(getSlotKey(slotId))
}

export function getAllSlots(): (SaveSlotData | null)[] {
  return Array.from({ length: SLOT_COUNT }, (_, i) => loadSlot(i + 1))
}

export function getFirstEmptySlotId(): number | null {
  for (let i = 1; i <= SLOT_COUNT; i++) {
    if (!loadSlot(i)) return i
  }
  return null
}

export function getActiveSlotId(): number | null {
  const raw = localStorage.getItem('activeSlot')
  return raw ? Number(raw) : null
}

export function setActiveSlotId(slotId: number): void {
  localStorage.setItem('activeSlot', String(slotId))
}
