import { MarketCrewChief, MarketSpotter, MarketPitCrewMember, PitCrewRole } from '../types'

function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

function clamp(v: number, min: number, max: number) { return Math.max(min, Math.min(max, v)) }

// ---- Crew Chiefs ----
const CC_TEMPLATES = [
  { firstName: 'Paul', lastName: 'Hendricks', tier: 'elite' as const },
  { firstName: 'Alan', lastName: 'Rutledge', tier: 'elite' as const },
  { firstName: 'Jim', lastName: 'Sawyer', tier: 'veteran' as const },
  { firstName: 'Dave', lastName: 'Newton', tier: 'veteran' as const },
  { firstName: 'Rick', lastName: 'Banner', tier: 'veteran' as const },
  { firstName: 'Matt', lastName: 'Caldwell', tier: 'mid' as const },
  { firstName: 'Steve', lastName: 'Brennan', tier: 'mid' as const },
  { firstName: 'Greg', lastName: 'Foley', tier: 'mid' as const },
  { firstName: 'Tom', lastName: 'York', tier: 'mid' as const },
  { firstName: 'Chris', lastName: 'Dalton', tier: 'budget' as const },
  { firstName: 'Jeff', lastName: 'Pratt', tier: 'budget' as const },
  { firstName: 'Ken', lastName: 'Oakes', tier: 'budget' as const },
]

const CC_TIERS: Record<string, { base: [number, number]; salary: [number, number]; age: [number, number] }> = {
  elite:   { base: [80, 98], salary: [25000, 50000], age: [40, 55] },
  veteran: { base: [65, 85], salary: [12000, 25000], age: [35, 50] },
  mid:     { base: [45, 70], salary: [6000, 15000],  age: [30, 45] },
  budget:  { base: [25, 50], salary: [2000, 7000],   age: [25, 40] },
}

export function generateCrewChiefs(seriesId: number): MarketCrewChief[] {
  const rand = seededRandom(seriesId * 3571 + 13)
  return CC_TEMPLATES.map((tpl, idx) => {
    const t = CC_TIERS[tpl.tier]
    const r = () => rand()
    const attr = () => clamp(Math.round(t.base[0] + r() * (t.base[1] - t.base[0])), 1, 99)
    return {
      id: seriesId * 100 + idx + 1,
      firstName: tpl.firstName,
      lastName: tpl.lastName,
      age: Math.round(t.age[0] + r() * (t.age[1] - t.age[0])),
      experience: Math.round(2 + r() * 20),
      strategy: attr(),
      setup: attr(),
      adaptability: attr(),
      salary: Math.round((t.salary[0] + r() * (t.salary[1] - t.salary[0])) / 500) * 500,
    }
  })
}

// ---- Spotters ----
const SP_TEMPLATES = [
  { firstName: 'Tim', lastName: 'Barker', tier: 'elite' as const },
  { firstName: 'Bill', lastName: 'Crowley', tier: 'elite' as const },
  { firstName: 'Dan', lastName: 'Drake', tier: 'veteran' as const },
  { firstName: 'Pete', lastName: 'Marsh', tier: 'veteran' as const },
  { firstName: 'Ron', lastName: 'Keating', tier: 'veteran' as const },
  { firstName: 'Carl', lastName: 'Yates', tier: 'mid' as const },
  { firstName: 'Joe', lastName: 'Sims', tier: 'mid' as const },
  { firstName: 'Frank', lastName: 'Hobbs', tier: 'mid' as const },
  { firstName: 'Hank', lastName: 'Ellis', tier: 'mid' as const },
  { firstName: 'Bobby', lastName: 'Nix', tier: 'budget' as const },
  { firstName: 'Gus', lastName: 'Phelps', tier: 'budget' as const },
  { firstName: 'Ray', lastName: 'Tully', tier: 'budget' as const },
]

const SP_TIERS: Record<string, { base: [number, number]; salary: [number, number]; age: [number, number] }> = {
  elite:   { base: [80, 98], salary: [15000, 30000], age: [35, 55] },
  veteran: { base: [65, 85], salary: [8000, 18000],  age: [30, 50] },
  mid:     { base: [45, 70], salary: [4000, 10000],  age: [28, 45] },
  budget:  { base: [25, 50], salary: [1500, 5000],   age: [22, 38] },
}

export function generateSpotters(seriesId: number): MarketSpotter[] {
  const rand = seededRandom(seriesId * 5431 + 7)
  return SP_TEMPLATES.map((tpl, idx) => {
    const t = SP_TIERS[tpl.tier]
    const r = () => rand()
    const attr = () => clamp(Math.round(t.base[0] + r() * (t.base[1] - t.base[0])), 1, 99)
    return {
      id: seriesId * 100 + idx + 1,
      firstName: tpl.firstName,
      lastName: tpl.lastName,
      age: Math.round(t.age[0] + r() * (t.age[1] - t.age[0])),
      experience: Math.round(1 + r() * 18),
      awareness: attr(),
      communication: attr(),
      positioning: attr(),
      salary: Math.round((t.salary[0] + r() * (t.salary[1] - t.salary[0])) / 500) * 500,
    }
  })
}

// ---- Pit Crew ----
const ROLES: PitCrewRole[] = ['tire_changer_front', 'tire_changer_rear', 'tire_carrier_front', 'tire_carrier_rear', 'jackman', 'gas_man']

const PIT_FIRST_NAMES = [
  'Marco', 'Ty', 'Dex', 'Bo', 'Lenny', 'Ray', 'Mick', 'Hector', 'Gil', 'Wes',
  'Troy', 'Nico', 'Sam', 'Clay', 'Vance', 'Eli', 'Bruno', 'Cal', 'Rex', 'Dale',
  'Seth', 'Jax', 'Kurt', 'Rudy', 'Ivan', 'Leo', 'Nate', 'Gabe', 'Hugh', 'Owen',
]
const PIT_LAST_NAMES = [
  'Torres', 'Hughes', 'Park', 'Bell', 'Dunn', 'Nash', 'Rivers', 'Long', 'Grant', 'Stone',
  'Floyd', 'Wolfe', 'Wade', 'Hart', 'Miles', 'Burns', 'Brock', 'Holt', 'Banks', 'Carr',
  'Knox', 'Vega', 'Gibbs', 'Lowe', 'Kern', 'Yost', 'Bain', 'Roth', 'Cobb', 'Dean',
]

const PIT_TIERS: { label: string; base: [number, number]; salary: [number, number]; count: number }[] = [
  { label: 'elite', base: [80, 98], salary: [8000, 15000], count: 10 },
  { label: 'solid', base: [60, 82], salary: [4000, 9000],  count: 15 },
  { label: 'budget', base: [30, 62], salary: [1500, 4500], count: 15 },
]

export function generatePitCrew(seriesId: number): MarketPitCrewMember[] {
  const rand = seededRandom(seriesId * 9311 + 23)
  const r = () => rand()
  const members: MarketPitCrewMember[] = []
  let id = seriesId * 1000

  for (const tier of PIT_TIERS) {
    for (let i = 0; i < tier.count; i++) {
      const role = ROLES[Math.floor(r() * ROLES.length)]
      const attr = () => clamp(Math.round(tier.base[0] + r() * (tier.base[1] - tier.base[0])), 1, 99)
      id++
      members.push({
        id,
        firstName: PIT_FIRST_NAMES[Math.floor(r() * PIT_FIRST_NAMES.length)],
        lastName: PIT_LAST_NAMES[Math.floor(r() * PIT_LAST_NAMES.length)],
        role,
        speed: attr(),
        accuracy: attr(),
        consistency: attr(),
        salary: Math.round((tier.salary[0] + r() * (tier.salary[1] - tier.salary[0])) / 250) * 250,
      })
    }
  }

  return members
}
