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
