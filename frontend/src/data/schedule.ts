export interface RaceInfo {
  round: number
  name: string
  track: string
  date: string
  laps: number
  purse: number // Total purse for the race in dollars
  isExhibition?: boolean // exhibition races don't count for championship points
}

// Schedules per series (matches seed_data.sql)
export const SCHEDULES: Record<number, RaceInfo[]> = {
  1: [
    { round: 1, name: 'Daytona Truck 250', track: 'Daytona International Speedway', date: '2026-02-13', laps: 100, purse: 1400000 },
    { round: 2, name: 'Las Vegas Truck 200', track: 'Las Vegas Motor Speedway', date: '2026-02-20', laps: 134, purse: 900000 },
    { round: 3, name: 'Atlanta Truck 200', track: 'EchoPark Speedway', date: '2026-03-06', laps: 130, purse: 875000 },
    { round: 4, name: 'Bristol Truck 200', track: 'Bristol Motor Speedway', date: '2026-03-13', laps: 200, purse: 950000 },
    { round: 5, name: 'Charlotte Truck 200', track: 'Charlotte Motor Speedway', date: '2026-03-20', laps: 134, purse: 900000 },
    { round: 6, name: 'Richmond Truck 200', track: 'Richmond Raceway', date: '2026-03-27', laps: 200, purse: 800000 },
    { round: 7, name: 'Martinsville Truck 200', track: 'Martinsville Speedway', date: '2026-04-03', laps: 200, purse: 850000 },
    { round: 8, name: 'Kansas Truck 200', track: 'Kansas Speedway', date: '2026-04-10', laps: 134, purse: 825000 },
    { round: 9, name: 'Talladega Truck 200', track: 'Talladega Superspeedway', date: '2026-04-24', laps: 94, purse: 1000000 },
    { round: 10, name: 'Nashville Truck 200', track: 'Nashville Superspeedway', date: '2026-05-01', laps: 150, purse: 825000 },
    { round: 11, name: 'Texas Truck 200', track: 'Texas Motor Speedway', date: '2026-06-26', laps: 167, purse: 850000 },
    { round: 12, name: 'Homestead Truck 200', track: 'Homestead-Miami Speedway', date: '2026-07-10', laps: 134, purse: 825000 },
    { round: 13, name: 'Iowa Truck 200', track: 'Iowa Speedway', date: '2026-07-31', laps: 200, purse: 750000 },
    { round: 14, name: 'WWT Truck 200', track: 'World Wide Technology Raceway', date: '2026-08-14', laps: 160, purse: 750000 },
    { round: 15, name: 'COTA Truck 150', track: 'Circuit of the Americas', date: '2026-08-21', laps: 35, purse: 750000 },
    { round: 16, name: 'Daytona Truck Summer', track: 'Daytona International Speedway', date: '2026-08-28', laps: 100, purse: 1200000 },
    { round: 17, name: 'Las Vegas Truck Playoff', track: 'Las Vegas Motor Speedway', date: '2026-09-04', laps: 134, purse: 1000000 },
    { round: 18, name: 'Bristol Truck Playoff', track: 'Bristol Motor Speedway', date: '2026-09-11', laps: 200, purse: 1050000 },
    { round: 19, name: 'Talladega Truck Playoff', track: 'Talladega Superspeedway', date: '2026-09-18', laps: 94, purse: 1100000 },
    { round: 20, name: 'Martinsville Truck Playoff', track: 'Martinsville Speedway', date: '2026-10-02', laps: 200, purse: 1050000 },
    { round: 21, name: 'North Wilkesboro Truck 200', track: 'North Wilkesboro Speedway', date: '2026-10-09', laps: 200, purse: 950000 },
    { round: 22, name: 'Phoenix Truck Championship', track: 'Phoenix Raceway', date: '2026-10-30', laps: 150, purse: 1500000 },
  ],
  2: [
    { round: 1, name: "Daytona O'Reilly 300", track: 'Daytona International Speedway', date: '2026-02-14', laps: 120, purse: 3200000 },
    { round: 2, name: "Las Vegas O'Reilly 300", track: 'Las Vegas Motor Speedway', date: '2026-02-21', laps: 200, purse: 2000000 },
    { round: 3, name: "Phoenix O'Reilly 200", track: 'Phoenix Raceway', date: '2026-02-28', laps: 200, purse: 1800000 },
    { round: 4, name: "Atlanta O'Reilly 300", track: 'EchoPark Speedway', date: '2026-03-07', laps: 195, purse: 2000000 },
    { round: 5, name: "Bristol O'Reilly 300", track: 'Bristol Motor Speedway', date: '2026-03-14', laps: 300, purse: 2200000 },
    { round: 6, name: "Charlotte O'Reilly 300", track: 'Charlotte Motor Speedway', date: '2026-03-21', laps: 200, purse: 2100000 },
    { round: 7, name: "Richmond O'Reilly 250", track: 'Richmond Raceway', date: '2026-03-28', laps: 250, purse: 1700000 },
    { round: 8, name: "Martinsville O'Reilly 250", track: 'Martinsville Speedway', date: '2026-04-04', laps: 250, purse: 1800000 },
    { round: 9, name: "Kansas O'Reilly 300", track: 'Kansas Speedway', date: '2026-04-11', laps: 200, purse: 1750000 },
    { round: 10, name: "Michigan O'Reilly 250", track: 'Michigan International Speedway', date: '2026-04-18', laps: 125, purse: 1600000 },
    { round: 11, name: "Talladega O'Reilly 300", track: 'Talladega Superspeedway', date: '2026-04-25', laps: 113, purse: 2200000 },
    { round: 12, name: "Nashville O'Reilly 300", track: 'Nashville Superspeedway', date: '2026-05-02', laps: 200, purse: 1700000 },
    { round: 13, name: "New Hampshire O'Reilly 200", track: 'New Hampshire Motor Speedway', date: '2026-05-23', laps: 200, purse: 1550000 },
    { round: 14, name: "Pocono O'Reilly 225", track: 'Pocono Raceway', date: '2026-06-06', laps: 90, purse: 1550000 },
    { round: 15, name: "Watkins Glen O'Reilly 200", track: 'Watkins Glen International', date: '2026-06-13', laps: 82, purse: 1500000 },
    { round: 16, name: "Darlington O'Reilly 300", track: 'Darlington Raceway', date: '2026-06-20', laps: 147, purse: 2100000 },
    { round: 17, name: "Texas O'Reilly 300", track: 'Texas Motor Speedway', date: '2026-06-27', laps: 200, purse: 1800000 },
    { round: 18, name: "Homestead O'Reilly 300", track: 'Homestead-Miami Speedway', date: '2026-07-11', laps: 200, purse: 1800000 },
    { round: 19, name: "Dover O'Reilly 200", track: 'Dover Motor Speedway', date: '2026-07-18', laps: 200, purse: 1600000 },
    { round: 20, name: "Iowa O'Reilly 250", track: 'Iowa Speedway', date: '2026-08-01', laps: 250, purse: 1400000 },
    { round: 21, name: "WWT O'Reilly 250", track: 'World Wide Technology Raceway', date: '2026-08-15', laps: 200, purse: 1400000 },
    { round: 22, name: "COTA O'Reilly 200", track: 'Circuit of the Americas', date: '2026-08-22', laps: 46, purse: 1500000 },
    { round: 23, name: "Daytona O'Reilly Summer", track: 'Daytona International Speedway', date: '2026-08-29', laps: 100, purse: 2800000 },
    { round: 24, name: "Las Vegas O'Reilly Playoff", track: 'Las Vegas Motor Speedway', date: '2026-09-05', laps: 200, purse: 2200000 },
    { round: 25, name: "Bristol O'Reilly Playoff", track: 'Bristol Motor Speedway', date: '2026-09-12', laps: 300, purse: 2400000 },
    { round: 26, name: "Talladega O'Reilly Playoff", track: 'Talladega Superspeedway', date: '2026-09-19', laps: 113, purse: 2400000 },
    { round: 27, name: "Charlotte O'Reilly Playoff", track: 'Charlotte Motor Speedway', date: '2026-09-26', laps: 200, purse: 2200000 },
    { round: 28, name: "Martinsville O'Reilly Playoff", track: 'Martinsville Speedway', date: '2026-10-03', laps: 250, purse: 2200000 },
    { round: 29, name: "Rockingham O'Reilly 300", track: 'Rockingham Speedway', date: '2026-10-10', laps: 300, purse: 1800000 },
    { round: 30, name: "Phoenix O'Reilly Championship", track: 'Phoenix Raceway', date: '2026-10-31', laps: 200, purse: 3500000 },
  ],
  3: [
    // Speedweeks / exhibition events — don't count for championship points
    { round: 0, name: 'The Clash at Bowman Gray', track: 'Bowman Gray Stadium', date: '2026-02-04', laps: 200, purse: 2000000, isExhibition: true },
    { round: 0, name: 'Duel 1 at Daytona', track: 'Daytona International Speedway', date: '2026-02-12', laps: 60, purse: 1500000, isExhibition: true },
    { round: 0, name: 'Duel 2 at Daytona', track: 'Daytona International Speedway', date: '2026-02-12', laps: 60, purse: 1500000, isExhibition: true },
    { round: 0, name: 'NASCAR All-Star Race', track: 'Dover Motor Speedway', date: '2026-05-17', laps: 350, purse: 1000000, isExhibition: true },
    // Regular season
    { round: 1, name: 'Daytona 500', track: 'Daytona International Speedway', date: '2026-02-15', laps: 200, purse: 23600000 },
    { round: 2, name: 'NASCAR Cup Series Race at EchoPark', track: 'EchoPark Speedway', date: '2026-02-22', laps: 260, purse: 7500000 },
    { round: 3, name: 'NASCAR Cup Series Race at Circuit of the Americas', track: 'Circuit of the Americas', date: '2026-03-01', laps: 95, purse: 7000000 },
    { round: 4, name: 'NASCAR Cup Series Race at Phoenix', track: 'Phoenix Raceway', date: '2026-03-08', laps: 312, purse: 7000000 },
    { round: 5, name: 'NASCAR Cup Series Race at Las Vegas', track: 'Las Vegas Motor Speedway', date: '2026-03-15', laps: 267, purse: 7500000 },
    { round: 6, name: 'NASCAR Cup Series Race at Darlington', track: 'Darlington Raceway', date: '2026-03-22', laps: 293, purse: 8500000 },
    { round: 7, name: 'NASCAR Cup Series Race at Martinsville', track: 'Martinsville Speedway', date: '2026-03-29', laps: 400, purse: 7000000 },
    { round: 8, name: 'NASCAR Cup Series Race at Bristol', track: 'Bristol Motor Speedway', date: '2026-04-12', laps: 500, purse: 8500000 },
    { round: 9, name: 'NASCAR Cup Series Race at Kansas', track: 'Kansas Speedway', date: '2026-04-19', laps: 267, purse: 6500000 },
    { round: 10, name: 'NASCAR Cup Series Race at Talladega', track: 'Talladega Superspeedway', date: '2026-04-26', laps: 188, purse: 8200000 },
    { round: 11, name: 'NASCAR Cup Series Race at Texas', track: 'Texas Motor Speedway', date: '2026-05-03', laps: 267, purse: 7000000 },
    { round: 12, name: 'NASCAR Cup Series Race at The Glen', track: 'Watkins Glen International', date: '2026-05-10', laps: 100, purse: 6000000 },
    { round: 13, name: 'NASCAR Cup Series Race at Charlotte', track: 'Charlotte Motor Speedway', date: '2026-05-24', laps: 400, purse: 10500000 },
    { round: 14, name: 'NASCAR Cup Series Race at Nashville', track: 'Nashville Superspeedway', date: '2026-05-31', laps: 300, purse: 6500000 },
    { round: 15, name: 'NASCAR Cup Series Race at Michigan', track: 'Michigan International Speedway', date: '2026-06-07', laps: 200, purse: 6200000 },
    { round: 16, name: 'NASCAR Cup Series Race at Pocono', track: 'Pocono Raceway', date: '2026-06-14', laps: 160, purse: 6200000 },
    { round: 17, name: 'NASCAR Cup Series Race at Coronado', track: 'Naval Base Coronado', date: '2026-06-21', laps: 75, purse: 6000000 },
    { round: 18, name: 'NASCAR Cup Series Race at Sonoma', track: 'Sonoma Raceway', date: '2026-06-28', laps: 110, purse: 6000000 },
    { round: 19, name: 'NASCAR Cup Series Race at Chicagoland', track: 'Chicagoland Speedway', date: '2026-07-05', laps: 267, purse: 6500000 },
    { round: 20, name: 'NASCAR Cup Series Race #2 at EchoPark', track: 'EchoPark Speedway', date: '2026-07-12', laps: 260, purse: 7500000 },
    { round: 21, name: 'NASCAR Cup Series Race at North Wilkesboro', track: 'North Wilkesboro Speedway', date: '2026-07-19', laps: 450, purse: 7500000 },
    { round: 22, name: 'NASCAR Cup Series Race at Indianapolis', track: 'Indianapolis Motor Speedway', date: '2026-07-26', laps: 160, purse: 10000000 },
    { round: 23, name: 'NASCAR Cup Series Race at Iowa', track: 'Iowa Speedway', date: '2026-08-09', laps: 350, purse: 5800000 },
    { round: 24, name: 'NASCAR Cup Series Race at Richmond', track: 'Richmond Raceway', date: '2026-08-15', laps: 400, purse: 6500000 },
    { round: 25, name: 'NASCAR Cup Series Race at New Hampshire', track: 'New Hampshire Motor Speedway', date: '2026-08-23', laps: 301, purse: 6200000 },
    { round: 26, name: 'NASCAR Cup Series Race #2 at Daytona', track: 'Daytona International Speedway', date: '2026-08-29', laps: 160, purse: 9500000 },
    { round: 27, name: 'NASCAR Cup Series Race #2 at Darlington', track: 'Darlington Raceway', date: '2026-09-06', laps: 367, purse: 8500000 },
    { round: 28, name: 'NASCAR Cup Series Race at Gateway', track: 'World Wide Technology Raceway', date: '2026-09-13', laps: 240, purse: 5800000 },
    { round: 29, name: 'NASCAR Cup Series Race #2 at Bristol', track: 'Bristol Motor Speedway', date: '2026-09-19', laps: 500, purse: 8500000 },
    { round: 30, name: 'NASCAR Cup Series Race #2 at Kansas', track: 'Kansas Speedway', date: '2026-09-27', laps: 267, purse: 6500000 },
    { round: 31, name: 'NASCAR Cup Series Race #2 at Las Vegas', track: 'Las Vegas Motor Speedway', date: '2026-10-04', laps: 267, purse: 7500000 },
    { round: 32, name: 'NASCAR Cup Series Race #2 at Charlotte', track: 'Charlotte Motor Speedway', date: '2026-10-11', laps: 267, purse: 7500000 },
    { round: 33, name: 'NASCAR Cup Series Race #2 at Phoenix', track: 'Phoenix Raceway', date: '2026-10-18', laps: 312, purse: 7000000 },
    { round: 34, name: 'NASCAR Cup Series Race #2 at Talladega', track: 'Talladega Superspeedway', date: '2026-10-25', laps: 188, purse: 8200000 },
    { round: 35, name: 'NASCAR Cup Series Race #2 at Martinsville', track: 'Martinsville Speedway', date: '2026-11-01', laps: 500, purse: 8000000 },
    { round: 36, name: 'NASCAR Cup Series Championship Race', track: 'Homestead-Miami Speedway', date: '2026-11-08', laps: 267, purse: 12000000 },
  ],
}

/**
 * Returns the schedule for a given series shifted to the specified calendar year.
 * The default SCHEDULES use 2026 dates; this replaces the year portion.
 */
export function getScheduleForYear(seriesId: number, year: number): RaceInfo[] {
  const base = SCHEDULES[seriesId] ?? []
  return base.map(r => ({ ...r, date: `${year}${r.date.slice(4)}` }))
}

/**
 * Returns the date of the final championship race for a series in the given year.
 * This is the season end boundary — the day AFTER this date triggers the offseason.
 */
export function getChampionshipDate(seriesId: number, year: number): string {
  const sched = getScheduleForYear(seriesId, year)
  const pointsRaces = sched.filter(r => !r.isExhibition)
  return pointsRaces[pointsRaces.length - 1]?.date ?? `${year}-12-31`
}

/**
 * The mandatory exhibition events for each series.
 * These are always part of every season but the player can change the track/date.
 * Keys match the canonical event names used throughout the app.
 */
export interface ExhibitionSlot {
  key: string   // stable identifier
  name: string  // display name (editable in schedule builder)
  defaultTrack: string
  defaultDateMMDD: string // MM-DD portion, year is prepended at runtime
  laps: number
  purse: number
}

export const EXHIBITION_SLOTS: Record<number, ExhibitionSlot[]> = {
  // Cup Series
  3: [
    { key: 'clash',    name: 'The Clash at Bowman Gray', defaultTrack: 'Bowman Gray Stadium',            defaultDateMMDD: '02-04', laps: 200, purse: 2000000 },
    { key: 'duel1',    name: 'Duel 1 at Daytona',        defaultTrack: 'Daytona International Speedway', defaultDateMMDD: '02-12', laps: 60,  purse: 1500000 },
    { key: 'duel2',    name: 'Duel 2 at Daytona',        defaultTrack: 'Daytona International Speedway', defaultDateMMDD: '02-12', laps: 60,  purse: 1500000 },
    { key: 'allstar',  name: 'NASCAR All-Star Race',     defaultTrack: 'Dover Motor Speedway',           defaultDateMMDD: '05-17', laps: 350, purse: 1000000 },
  ],
  // O'Reilly Series — Clash + 2 Duels (no All-Star equivalent)
  2: [
    { key: 'clash',    name: "The Clash",  defaultTrack: 'Daytona International Speedway', defaultDateMMDD: '02-13', laps: 60,  purse: 800000 },
    { key: 'duel1',    name: 'Duel 1',     defaultTrack: 'Daytona International Speedway', defaultDateMMDD: '02-13', laps: 40,  purse: 600000 },
    { key: 'duel2',    name: 'Duel 2',     defaultTrack: 'Daytona International Speedway', defaultDateMMDD: '02-13', laps: 40,  purse: 600000 },
  ],
  // Truck Series — Clash + 2 Duels
  1: [
    { key: 'clash',    name: 'The Clash',  defaultTrack: 'Daytona International Speedway', defaultDateMMDD: '02-12', laps: 50,  purse: 500000 },
    { key: 'duel1',    name: 'Duel 1',     defaultTrack: 'Daytona International Speedway', defaultDateMMDD: '02-12', laps: 35,  purse: 400000 },
    { key: 'duel2',    name: 'Duel 2',     defaultTrack: 'Daytona International Speedway', defaultDateMMDD: '02-12', laps: 35,  purse: 400000 },
  ],
}

/** How many regular (championship) races per series */
export const SERIES_RACE_COUNT: Record<number, number> = { 1: 22, 2: 30, 3: 36 }
