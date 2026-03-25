// Main game types

export interface Series {
  id: number;
  name: string;
  short_name: string;
  tier: number;
  num_races: number;
  description: string;
}

export type Manufacturer = 'Ford' | 'Toyota' | 'Chevrolet' | 'Ram';

export interface Team {
  id: number;
  series_id: number;
  name: string;
  founded_year: number;
  base_city: string;
  budget: number;
  reputation: number;
  garage_rating: number;
  headquarters: string;
  manufacturer?: Manufacturer;
}

export interface Driver {
  id: number;
  first_name: string;
  last_name: string;
  number: string;
  team_id: number;
  car_id: number;
  status: 'active' | 'injured' | 'suspended' | 'retired';
  age: number;
  experience: number;
  skill_rating: number;
  consistency_rating: number;
  racecraft_rating: number;
  contract_end_year: number;
  wins: number;
  poles: number;
  top_10_finishes: number;
}

export interface Car {
  id: number;
  team_id: number;
  number: string;
  name: string;
  year: number;
  condition: 'excellent' | 'good' | 'fair' | 'poor' | 'wrecked';
  speed_rating: number;
  handling_rating: number;
  reliability_rating: number;
  aerodynamics_rating: number;
}

export interface CrewChief {
  id: number;
  first_name: string;
  last_name: string;
  team_id: number;
  driver_id: number;
  experience: number;
  strategy_rating: number;
  setup_rating: number;
  communication_rating: number;
}

export interface Spotter {
  id: number;
  first_name: string;
  last_name: string;
  team_id: number;
  driver_id: number;
  experience: number;
  awareness_rating: number;
  communication_rating: number;
  race_reading_rating: number;
}

export interface PitCrewMember {
  id: number;
  first_name: string;
  last_name: string;
  team_id: number;
  driver_id: number;
  role: string;
  experience: number;
  speed_rating: number;
  accuracy_rating: number;
  efficiency_rating: number;
}

export interface Track {
  id: number;
  name: string;
  location: string;
  country: string;
  length_miles: number;
  turns: number;
  banking: number;
  track_type: string;
}

export interface Race {
  id: number;
  season_id: number;
  series_id: number;
  round: number;
  name: string;
  track_id: number;
  date: string;
  distance_miles: number;
  laps: number;
  pole_winner_id?: number;
  race_winner_id?: number;
  winning_team_id?: number;
  status: 'scheduled' | 'qualifying' | 'completed';
}

export interface RaceResult {
  id: number;
  race_id: number;
  driver_id: number;
  team_id: number;
  car_id: number;
  starting_position: number;
  finishing_position: number;
  laps_completed: number;
  laps_led: number;
  pit_stops: number;
  status: string;
  dnf_reason?: string;
}

export interface CareerSave {
  id: number;
  player_name: string;
  created_at: string;
  current_season: number;
  current_week: number;
  current_team_id: number;
  total_championships: number;
  total_wins: number;
}

export interface OwnerData {
  firstName: string;
  lastName: string;
  nationality: string;
  birthMonth: number;
  birthDay: number;
  birthYear: number;
}

export interface SaveSlotData {
  slotId: number;
  createdAt: string;
  lastPlayedAt: string;
  owner: OwnerData;
  selectedSeries?: Series;
  selectedTeam?: Team;
  money: number;
  chassis: Chassis[];
  inventory: InventoryItem[];
  currentWeek: number;
  currentDate: string; // ISO date string "YYYY-MM-DD" — the current in-game day
  currentSeason: number;
  totalChampionships: number;
  totalWins: number;
  carNumber: string; // player's car number for owner standings
  maxAge: number; // career ends when owner hits this age (default 65)
  // Multi-car entries (up to 4)
  carEntries: CarEntry[];
  // Multiple staff hires (up to 4 of each)
  hiredDrivers: MarketDriver[];
  hiredCrewChiefs: MarketCrewChief[];
  hiredSpotters: MarketSpotter[];
  hiredPitCrews: MarketPitCrewMember[][]; // array of pit crews, each is 6 members
  // Legacy single-car fields (kept for migration)
  hiredDriver?: MarketDriver;
  hiredCrewChief?: MarketCrewChief;
  hiredSpotter?: MarketSpotter;
  hiredPitCrew: MarketPitCrewMember[];
  // Organization lifetime stats
  orgStats: OrgStats;
  // Season tracking
  seasonResults: SeasonRaceResult[];
  standings: StandingsEntry[];
  ownerStandings: OwnerStandingsEntry[];
  // Custom schedule for next season (built during offseason)
  customSchedule?: RaceScheduleEntry[];
  // Active schedule (set at season start — either default or custom)
  activeSchedule?: RaceScheduleEntry[];
  // Season state
  seasonPhase: 'offseason' | 'preseason' | 'regular' | 'postseason';
  // Championship purse earnings
  driverChampionshipEarnings: number;
  ownerChampionshipEarnings: number;
}

export interface LocalCareerFile {
  playerName: string;
  selectedTeam: Team;
  owner?: OwnerData;
  currentWeek?: number;
  currentSeason?: number;
  totalChampionships?: number;
  totalWins?: number;
}

export type ChassisStatus = 'building' | 'ready' | 'damaged' | 'totaled';
export type ItemCategory = 'engine' | 'suspension' | 'aerodynamics' | 'brakes' | 'transmission';

export interface Chassis {
  id: string;
  name: string;
  series_id: number;
  trackType: TrackType; // which track type this chassis is built for
  status: ChassisStatus;
  base_speed: number;
  base_handling: number;
  base_reliability: number;
  base_aero: number;
  weight_lbs: number;
  build_progress: number;
  installedParts: InventoryItem[];
  created_at: string;
}

export interface StoreItem {
  id: number;
  name: string;
  category: ItemCategory;
  tier: number;
  price: number;
  speed_bonus: number;
  handling_bonus: number;
  reliability_bonus: number;
  aero_bonus: number;
  weight_reduction: number;
  description: string;
}

export interface InventoryItem {
  id: string;
  item: StoreItem;
  chassisId?: string;
  health: number; // 0-100, degrades with use
  purchased_at: string;
  installStartDate?: string; // ISO date when install began
  installDaysLeft?: number; // days remaining until install complete (0 = ready)
}

export interface PowerRankingEntry {
  rank: number;
  driver: Driver;
  team: Team;
  points: number;
  wins: number;
  top5: number;
  top10: number;
  avgFinish: number;
}

// ---- Track types ----
export type TrackType = 'superspeedway' | 'short_track' | 'intermediate' | 'road_course' | 'street';

export interface TrackInfo {
  id: number;
  name: string;
  type: TrackType;
  lengthMiles: number;
  banking: string;
}

// ---- Market Driver ----
export interface MarketDriver {
  id: number;
  firstName: string;
  lastName: string;
  age: number;
  experience: number;
  // General attributes (0-100)
  pace: number;
  racecraft: number;
  consistency: number;
  aggression: number;
  // Track-type attributes (0-100)
  superspeedway: number;
  short_track: number;
  intermediate: number;
  road_course: number;
  // Contract
  salary: number; // per-season cost
  contractRaces: number; // how many races they sign for
}

// ---- Crew Chief ----
export interface MarketCrewChief {
  id: number;
  firstName: string;
  lastName: string;
  age: number;
  experience: number;
  strategy: number;    // pit strategy (0-100)
  setup: number;       // car setup ability (0-100)
  adaptability: number; // mid-race adjustments (0-100)
  salary: number;
}

// ---- Spotter ----
export interface MarketSpotter {
  id: number;
  firstName: string;
  lastName: string;
  age: number;
  experience: number;
  awareness: number;      // track awareness (0-100)
  communication: number;  // communication clarity (0-100)
  positioning: number;    // helps driver with positioning (0-100)
  salary: number;
}

// ---- Pit Crew ----
export type PitCrewRole = 'tire_changer_front' | 'tire_changer_rear' | 'tire_carrier_front' | 'tire_carrier_rear' | 'jackman' | 'gas_man';

export interface MarketPitCrewMember {
  id: number;
  firstName: string;
  lastName: string;
  role: PitCrewRole;
  speed: number;       // how fast (0-100)
  accuracy: number;    // how error-free (0-100)
  consistency: number; // reliability under pressure (0-100)
  salary: number;
}

export const PIT_CREW_ROLE_LABELS: Record<PitCrewRole, string> = {
  tire_changer_front: 'Front Tire Changer',
  tire_changer_rear: 'Rear Tire Changer',
  tire_carrier_front: 'Front Tire Carrier',
  tire_carrier_rear: 'Rear Tire Carrier',
  jackman: 'Jackman',
  gas_man: 'Gas Man',
};

// ---- Race Results ----
export interface SeasonRaceResult {
  round: number;
  driverResults: DriverRaceResult[];
}

export interface DriverRaceResult {
  driverId: number;
  driverName: string;
  teamName: string;
  startPos: number;
  finishPos: number;
  lapsCompleted: number;
  lapsLed: number;
  status: 'running' | 'dnf_wreck' | 'dnf_mechanical' | 'dnf_pit_error';
  pointsEarned: number;
  stagePoints: number;
  purseEarned: number;
  isPlayer: boolean;
}

export interface StandingsEntry {
  driverId: number;
  driverName: string;
  teamName: string;
  points: number;
  wins: number;
  top5: number;
  top10: number;
  dnfs: number;
  isPlayer: boolean;
  stagePoints?: number;
}

// ---- Owner Standings (tracks car number, not specific driver) ----
export interface OwnerStandingsEntry {
  carNumber: string;
  teamName: string;
  points: number;
  wins: number;
  top5: number;
  top10: number;
  dnfs: number;
  isPlayer: boolean;
}

// ---- Custom schedule entry (for season builder) ----
export interface RaceScheduleEntry {
  round: number;
  name: string;
  track: string;
  date: string;
  laps: number;
  purse: number;
  isExhibition?: boolean; // exhibition races don't award championship points
}

// ---- Championship Purse Payouts ----
// Real-life approximate payouts by final championship position
export const DRIVER_CHAMPIONSHIP_PURSE: Record<number, Record<number, number>> = {
  // Truck Series
  1: {
    1: 500000, 2: 300000, 3: 225000, 4: 175000, 5: 150000,
    6: 125000, 7: 110000, 8: 100000, 9: 90000, 10: 80000,
  },
  // Xfinity Series
  2: {
    1: 1200000, 2: 750000, 3: 550000, 4: 400000, 5: 350000,
    6: 300000, 7: 275000, 8: 250000, 9: 225000, 10: 200000,
  },
  // Cup Series
  3: {
    1: 5000000, 2: 3000000, 3: 2250000, 4: 1750000, 5: 1500000,
    6: 1250000, 7: 1100000, 8: 1000000, 9: 900000, 10: 800000,
    11: 700000, 12: 650000, 13: 600000, 14: 575000, 15: 550000,
    16: 525000, 17: 500000, 18: 475000, 19: 450000, 20: 425000,
  },
}

export const OWNER_CHAMPIONSHIP_PURSE: Record<number, Record<number, number>> = {
  1: {
    1: 350000, 2: 200000, 3: 150000, 4: 120000, 5: 100000,
    6: 85000, 7: 75000, 8: 65000, 9: 55000, 10: 50000,
  },
  2: {
    1: 800000, 2: 500000, 3: 375000, 4: 275000, 5: 225000,
    6: 200000, 7: 175000, 8: 150000, 9: 135000, 10: 125000,
  },
  3: {
    1: 3000000, 2: 2000000, 3: 1500000, 4: 1200000, 5: 1000000,
    6: 850000, 7: 750000, 8: 650000, 9: 600000, 10: 550000,
    11: 500000, 12: 475000, 13: 450000, 14: 425000, 15: 400000,
    16: 375000, 17: 350000, 18: 325000, 19: 300000, 20: 275000,
  },
}

// Install time in days per part tier
export const INSTALL_DAYS_BY_TIER: Record<number, number> = {
  1: 1, 2: 2, 3: 3, 4: 4,
}

// ---- Car Entry (one per car fielded, up to 4) ----
export interface CarEntry {
  carNumber: string;
  chassisId?: string; // references a Chassis in saveData.chassis
  driverId?: number;  // references which hired driver by their id
  driver?: MarketDriver;
  crewChief?: MarketCrewChief;
  spotter?: MarketSpotter;
  pitCrew: MarketPitCrewMember[];
}

// ---- Organization Lifetime Stats ----
export interface OrgStats {
  championshipWins: number;
  raceWins: number;
  top5s: number;
  top10s: number;
  poles: number;
  races: number;
  dnfs: number;
}

// ---- Game context passed via Outlet ----
export interface GameContext {
  saveData: SaveSlotData;
  refreshSave: () => void;
}
