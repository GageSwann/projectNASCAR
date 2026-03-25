import { Manufacturer, MarketDriver } from '../types'

// Seeded random for deterministic generation
function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}
function clamp(v: number, min: number, max: number) { return Math.max(min, Math.min(max, v)) }

// ---- AI Team Definition ----
export interface AITeamDef {
  name: string
  manufacturer: Manufacturer
  tier: 'elite' | 'top' | 'mid' | 'low' | 'backmarker'
  /** How many cars this team fields (1-4) */
  carCount: number
}

export interface AICarEntry {
  carNumber: string
  teamName: string
  manufacturer: Manufacturer
  driver: MarketDriver
}

// ---- Tier stat ranges ----
const TIER_RANGES: Record<string, { base: [number, number]; salary: [number, number]; age: [number, number]; exp: [number, number] }> = {
  elite:      { base: [82, 98], salary: [30000, 55000], age: [26, 34], exp: [8, 16] },
  top:        { base: [70, 88], salary: [20000, 35000], age: [25, 36], exp: [5, 14] },
  mid:        { base: [55, 75], salary: [10000, 22000], age: [23, 38], exp: [3, 10] },
  low:        { base: [40, 62], salary: [5000, 14000],  age: [21, 40], exp: [1, 6] },
  backmarker: { base: [25, 50], salary: [2000, 8000],   age: [19, 42], exp: [0, 4] },
}

// ---- AI Driver name pool (enough for all series combined) ----
const AI_DRIVER_NAMES: [string, string][] = [
  // Elite/Top caliber names
  ['Maxwell', 'Sterling'], ['Dante', 'Vega'], ['Carter', 'Brooks'], ['Roman', 'Webb'],
  ['Jackson', 'Pierce'], ['Blake', 'Thornton'], ['Dominic', 'Hayes'], ['Asher', 'Cole'],
  ['Nolan', 'Shaw'], ['Reed', 'Dixon'], ['Elias', 'Mercer'], ['Adrian', 'Stone'],
  ['Nathan', 'Cross'], ['Ryan', 'Ashworth'], ['Caleb', 'Raines'], ['Jake', 'Colton'],
  ['Marcus', 'Dell'], ['Ricky', 'Tanner'], ['Liam', 'Sutherland'], ['Devon', 'Blake'],
  // Mid caliber
  ['Grant', 'Kelley'], ['Miles', 'Dunn'], ['Owen', 'Barrett'], ['Spencer', 'Mack'],
  ['Gage', 'Russell'], ['Everett', 'Flynn'], ['Kyle', 'Jensen'], ['Brock', 'Palmer'],
  ['Zane', 'Mitchell'], ['Finn', 'Barrett'], ['Luke', 'Hawkins'], ['Penn', 'Archer'],
  ['Ian', 'Walsh'], ['Victor', 'Kemp'], ['Leo', 'Yates'], ['Felix', 'Harper'],
  ['Cody', 'Harlan'], ['Brett', 'Whitaker'], ['Tyler', 'Hess'], ['Shane', 'Rivera'],
  // Low/Backmarker caliber
  ['Dean', 'Crawford'], ['Hugh', 'Kendall'], ['Liam', 'Roth'], ['Mason', 'Cole'],
  ['Noah', 'Grant'], ['Ethan', 'Wood'], ['Owen', 'Hunt'], ['Jared', 'Quinn'],
  ['Drew', 'Vaughn'], ['Kent', 'Abbott'], ['Dale', 'Norris'], ['Troy', 'Gibson'],
  ['Seth', 'Lambert'], ['Aiden', 'Cole'], ['Bryan', 'Wells'], ['Derek', 'Lane'],
  ['Noah', 'Craig'], ['Dylan', 'Fox'], ['Garrett', 'Price'], ['Chase', 'Morrow'],
  ['Bryce', 'Langston'], ['Austin', 'Crane'], ['Wyatt', 'Doyle'], ['Trent', 'Marsh'],
  ['Colby', 'Voss'], ['Jesse', 'Pruitt'], ['Reid', 'Holden'], ['Camden', 'Shore'],
  // Extra pool
  ['Porter', 'Slade'], ['Rowan', 'Fritz'], ['Beckett', 'Locke'], ['Harlan', 'Moss'],
  ['Sawyer', 'Kirk'], ['Barrett', 'Foxx'], ['Dalton', 'Wynn'], ['Emmett', 'Peak'],
  ['Tucker', 'Vail'], ['Sullivan', 'Holt'], ['Paxton', 'Reese'], ['Brennan', 'Sage'],
  ['Maddox', 'Cain'], ['Lawson', 'Grey'], ['Ryder', 'Nash'], ['Easton', 'Hale'],
  ['Phoenix', 'Ward'], ['Kade', 'Rowe'], ['Axel', 'Drake'], ['Lennox', 'Hart'],
  ['Magnus', 'Vale'], ['Declan', 'Frost'], ['Callum', 'Ridge'], ['Cruz', 'Stark'],
  ['Jett', 'Blaine'], ['Cash', 'Wolfe'], ['Hendrix', 'Moore'], ['Knox', 'Steel'],
  ['Wilder', 'Chase'], ['Anders', 'Page'], ['Sterling', 'Koch'], ['Brooks', 'Raye'],
]

// ---- Teams per series ----
// Truck Series: 10 teams, ~20 cars total
const TRUCK_TEAMS: AITeamDef[] = [
  { name: 'Ironhide Motorsports',     manufacturer: 'Chevrolet', tier: 'elite', carCount: 3 },
  { name: 'Prairie Fire Racing',       manufacturer: 'Toyota',    tier: 'elite', carCount: 2 },
  { name: 'Gravel Road Motorsports',   manufacturer: 'Ford',      tier: 'top',   carCount: 2 },
  { name: 'Longhorn Racing',           manufacturer: 'Ram',       tier: 'top',   carCount: 2 },
  { name: 'Bison Motorsports',         manufacturer: 'Chevrolet', tier: 'mid',   carCount: 2 },
  { name: 'Ridgeline Racing',          manufacturer: 'Toyota',    tier: 'mid',   carCount: 2 },
  { name: 'Stampede Motors',           manufacturer: 'Ford',      tier: 'low',   carCount: 2 },
  { name: 'Bedrock Racing',            manufacturer: 'Ram',       tier: 'low',   carCount: 2 },
  { name: 'Canyon Run Racing',         manufacturer: 'Chevrolet', tier: 'backmarker', carCount: 2 },
  { name: 'Timberline Motorsports',    manufacturer: 'Toyota',    tier: 'backmarker', carCount: 1 },
]

// O'Reilly (Xfinity) Series: 12 teams, ~24 cars
const XFINITY_TEAMS: AITeamDef[] = [
  { name: 'Catalyst Motorsports',      manufacturer: 'Chevrolet', tier: 'elite', carCount: 3 },
  { name: 'Pinnacle Racing',           manufacturer: 'Toyota',    tier: 'elite', carCount: 2 },
  { name: 'Summit Racing Corp',        manufacturer: 'Ford',      tier: 'top',   carCount: 2 },
  { name: 'Momentum Racing',           manufacturer: 'Chevrolet', tier: 'top',   carCount: 2 },
  { name: 'Frontier Motorsports',      manufacturer: 'Toyota',    tier: 'mid',   carCount: 2 },
  { name: 'Aurora Motorsports',        manufacturer: 'Ford',      tier: 'mid',   carCount: 2 },
  { name: 'Nexus Racing',              manufacturer: 'Chevrolet', tier: 'mid',   carCount: 2 },
  { name: 'Paradigm Racing',           manufacturer: 'Toyota',    tier: 'low',   carCount: 2 },
  { name: 'Zenith Motorsports',        manufacturer: 'Ford',      tier: 'low',   carCount: 2 },
  { name: 'Benchmark Racing',          manufacturer: 'Chevrolet', tier: 'backmarker', carCount: 2 },
  { name: 'Ascent Racing',             manufacturer: 'Toyota',    tier: 'backmarker', carCount: 1 },
  { name: 'Forge Motorsports',         manufacturer: 'Ford',      tier: 'backmarker', carCount: 1 },
]

// Cup Series: 14 teams, ~28 cars
const CUP_TEAMS: AITeamDef[] = [
  { name: 'Velocity Racing',           manufacturer: 'Chevrolet', tier: 'elite', carCount: 4 },
  { name: 'Legacy Motorsports',        manufacturer: 'Toyota',    tier: 'elite', carCount: 3 },
  { name: 'Elite Performance',         manufacturer: 'Ford',      tier: 'elite', carCount: 2 },
  { name: 'Thunder Motors',            manufacturer: 'Chevrolet', tier: 'top',   carCount: 2 },
  { name: 'Apex Racing',               manufacturer: 'Toyota',    tier: 'top',   carCount: 2 },
  { name: 'Overdrive Motorsports',     manufacturer: 'Ford',      tier: 'mid',   carCount: 2 },
  { name: 'Apex Grand Racing',         manufacturer: 'Chevrolet', tier: 'mid',   carCount: 2 },
  { name: 'Ironclad Motorsports',      manufacturer: 'Toyota',    tier: 'mid',   carCount: 2 },
  { name: 'Titanium Racing',           manufacturer: 'Ford',      tier: 'mid',   carCount: 2 },
  { name: 'Vanguard Racing',           manufacturer: 'Chevrolet', tier: 'low',   carCount: 2 },
  { name: 'Spectra Racing',            manufacturer: 'Toyota',    tier: 'low',   carCount: 1 },
  { name: 'Radiant Motorsports',       manufacturer: 'Ford',      tier: 'backmarker', carCount: 1 },
  { name: 'Prism Racing',              manufacturer: 'Chevrolet', tier: 'backmarker', carCount: 1 },
  { name: 'Meridian Racing',           manufacturer: 'Toyota',    tier: 'backmarker', carCount: 1 },
]

export const AI_TEAMS: Record<number, AITeamDef[]> = {
  1: TRUCK_TEAMS,
  2: XFINITY_TEAMS,
  3: CUP_TEAMS,
}

// ---- Number pools per series (no duplicates within a series) ----
const NUMBER_POOLS: Record<number, string[]> = {
  1: ['1','2','3','4','5','7','8','9','10','12','14','15','16','17','18','19','20','21','22','23','24','25','27','29','30','32','34','36','38','40','42','44','45','47','51','52','54','56','62','66','68','72','75','77','88','99'],
  2: ['1','2','3','4','5','7','8','9','10','11','16','18','19','20','21','22','23','26','27','31','33','36','38','39','44','45','48','51','54','55','68','77','81','88','98','99'],
  3: ['1','2','3','4','5','6','7','8','9','10','11','12','14','15','17','18','19','20','21','22','23','24','25','27','31','34','38','41','42','43','45','47','48','51','54','62','77','78','99'],
}

/**
 * Generate the full AI field for a given series, with unique car numbers,
 * manufacturer-consistent teams, and full MarketDriver attributes.
 *
 * @param seriesId 1=Truck, 2=Xfinity, 3=Cup
 * @param excludeNumbers Set of car numbers already taken (e.g. by the player)
 * @returns Array of AICarEntry
 */
export function generateAIField(seriesId: number, excludeNumbers: Set<string> = new Set()): AICarEntry[] {
  const teams = AI_TEAMS[seriesId] ?? AI_TEAMS[3]
  const pool = [...(NUMBER_POOLS[seriesId] ?? NUMBER_POOLS[3])]
  const rand = seededRandom(seriesId * 4219 + 77)
  const r = () => rand()

  // Shuffle number pool deterministically
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]]
  }

  // Filter out player-reserved numbers
  const available = pool.filter(n => !excludeNumbers.has(n))

  const entries: AICarEntry[] = []
  let nameIdx = 0
  let numIdx = 0

  for (const team of teams) {
    for (let c = 0; c < team.carCount; c++) {
      if (numIdx >= available.length) break
      const carNum = available[numIdx++]
      const [firstName, lastName] = AI_DRIVER_NAMES[nameIdx % AI_DRIVER_NAMES.length]
      nameIdx++

      const tier = TIER_RANGES[team.tier]
      const [bLo, bHi] = tier.base
      const [sLo, sHi] = tier.salary
      const [aLo, aHi] = tier.age
      const [eLo, eHi] = tier.exp

      const attr = () => clamp(Math.round(bLo + r() * (bHi - bLo)), 1, 99)

      const driver: MarketDriver = {
        id: seriesId * 10000 + entries.length + 1,
        firstName,
        lastName,
        age: Math.round(aLo + r() * (aHi - aLo)),
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
        contractRaces: 0, // full season
      }

      entries.push({
        carNumber: carNum,
        teamName: team.name,
        manufacturer: team.manufacturer,
        driver,
      })
    }
  }

  return entries
}

/**
 * Compute a "base strength" from a MarketDriver's attributes.
 * Used by raceSim when building the entrant list from AICarEntry data.
 */
export function driverBaseStrength(d: MarketDriver): number {
  return (d.pace * 0.30 + d.racecraft * 0.25 + d.consistency * 0.25 + d.intermediate * 0.10 + d.short_track * 0.05 + d.superspeedway * 0.05)
}
