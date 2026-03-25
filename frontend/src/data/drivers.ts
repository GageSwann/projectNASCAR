import { MarketDriver } from '../types'

// Seeded random for deterministic generation
function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

function clamp(v: number, min: number, max: number) { return Math.max(min, Math.min(max, v)) }

interface DriverTemplate {
  firstName: string
  lastName: string
  age: number
  tier: 'elite' | 'veteran' | 'mid' | 'prospect' | 'rookie'
}

const DRIVER_POOL: DriverTemplate[] = [
  // Elite — expensive, high stats
  { firstName: 'Victor', lastName: 'Kane', age: 30, tier: 'elite' },
  { firstName: 'Marcus', lastName: 'Steele', age: 28, tier: 'elite' },
  { firstName: 'Damon', lastName: 'Cross', age: 32, tier: 'elite' },
  { firstName: 'Xavier', lastName: 'Blake', age: 29, tier: 'elite' },
  { firstName: 'Preston', lastName: 'Hale', age: 31, tier: 'elite' },
  // Veteran — good all-around
  { firstName: 'Nick', lastName: 'Grayson', age: 34, tier: 'veteran' },
  { firstName: 'Travis', lastName: 'Harding', age: 36, tier: 'veteran' },
  { firstName: 'Kyle', lastName: 'Dawson', age: 33, tier: 'veteran' },
  { firstName: 'Cooper', lastName: 'Reid', age: 35, tier: 'veteran' },
  { firstName: 'Brent', lastName: 'Morrison', age: 37, tier: 'veteran' },
  { firstName: 'Derek', lastName: 'Flynn', age: 34, tier: 'veteran' },
  { firstName: 'Shane', lastName: 'Lawson', age: 32, tier: 'veteran' },
  // Mid-tier — decent, affordable
  { firstName: 'Cody', lastName: 'Barrett', age: 27, tier: 'mid' },
  { firstName: 'Levi', lastName: 'Marsh', age: 26, tier: 'mid' },
  { firstName: 'Griffin', lastName: 'Tate', age: 28, tier: 'mid' },
  { firstName: 'Rory', lastName: 'Kelley', age: 25, tier: 'mid' },
  { firstName: 'Trent', lastName: 'Valdez', age: 29, tier: 'mid' },
  { firstName: 'Spencer', lastName: 'Doyle', age: 27, tier: 'mid' },
  { firstName: 'Wesley', lastName: 'Crane', age: 26, tier: 'mid' },
  { firstName: 'Morgan', lastName: 'Pruitt', age: 28, tier: 'mid' },
  // Prospects — young, high upside, inconsistent
  { firstName: 'Jace', lastName: 'Ellison', age: 21, tier: 'prospect' },
  { firstName: 'Kai', lastName: 'Winters', age: 20, tier: 'prospect' },
  { firstName: 'Brody', lastName: 'Nash', age: 22, tier: 'prospect' },
  { firstName: 'Zane', lastName: 'Harmon', age: 21, tier: 'prospect' },
  { firstName: 'Miles', lastName: 'Reeves', age: 23, tier: 'prospect' },
  { firstName: 'Easton', lastName: 'Voss', age: 20, tier: 'prospect' },
  // Rookies — cheap, low stats, room to grow
  { firstName: 'Theo', lastName: 'Langford', age: 19, tier: 'rookie' },
  { firstName: 'Beckett', lastName: 'Shore', age: 18, tier: 'rookie' },
  { firstName: 'Quinn', lastName: 'Mercer', age: 19, tier: 'rookie' },
  { firstName: 'Reid', lastName: 'Ashby', age: 20, tier: 'rookie' },
  { firstName: 'Cash', lastName: 'Finley', age: 18, tier: 'rookie' },
  { firstName: 'Camden', lastName: 'Roark', age: 19, tier: 'rookie' },
  { firstName: 'Holden', lastName: 'Briggs', age: 20, tier: 'rookie' },
  { firstName: 'Ellis', lastName: 'Davenport', age: 18, tier: 'rookie' },
]

const TIER_RANGES: Record<string, { base: [number, number]; salary: [number, number]; exp: [number, number] }> = {
  elite:    { base: [80, 98], salary: [35000, 60000], exp: [8, 16] },
  veteran:  { base: [65, 85], salary: [18000, 35000], exp: [6, 14] },
  mid:      { base: [50, 72], salary: [8000, 18000], exp: [3, 8] },
  prospect: { base: [40, 68], salary: [4000, 10000], exp: [1, 3] },
  rookie:   { base: [25, 50], salary: [2000, 5000],  exp: [0, 1] },
}

export function generateDriverMarket(seriesId: number): MarketDriver[] {
  const rand = seededRandom(seriesId * 7919 + 42)

  return DRIVER_POOL.map((tpl, idx) => {
    const range = TIER_RANGES[tpl.tier]
    const [bLo, bHi] = range.base
    const [sLo, sHi] = range.salary
    const [eLo, eHi] = range.exp

    const r = () => rand()
    const attr = () => clamp(Math.round(bLo + r() * (bHi - bLo)), 1, 99)

    return {
      id: seriesId * 1000 + idx + 1,
      firstName: tpl.firstName,
      lastName: tpl.lastName,
      age: tpl.age,
      experience: Math.round(eLo + r() * (eHi - eLo)),
      pace: attr(),
      racecraft: attr(),
      consistency: attr(),
      aggression: clamp(Math.round(20 + r() * 60), 1, 99),
      superspeedway: attr(),
      short_track: attr(),
      intermediate: attr(),
      road_course: attr(),
      salary: Math.round((sLo + r() * (sHi - sLo)) / 500) * 500,
      contractRaces: tpl.tier === 'rookie' ? 5 : tpl.tier === 'prospect' ? 8 : 0, // 0 = full season
    } satisfies MarketDriver
  })
}
