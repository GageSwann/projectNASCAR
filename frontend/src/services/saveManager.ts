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
