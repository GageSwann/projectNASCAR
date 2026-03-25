// Main game types

export interface Series {
  id: number;
  name: string;
  short_name: string;
  tier: number;
  num_races: number;
  description: string;
}

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
  currentSeason: number;
  totalChampionships: number;
  totalWins: number;
  // Staff & Driver
  hiredDriver?: MarketDriver;
  hiredCrewChief?: MarketCrewChief;
  hiredSpotter?: MarketSpotter;
  hiredPitCrew: MarketPitCrewMember[];
  // Season tracking
  seasonResults: SeasonRaceResult[];
  standings: StandingsEntry[];
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
export type ItemCategory = 'engine' | 'suspension' | 'tires' | 'aerodynamics' | 'brakes' | 'transmission' | 'safety' | 'electronics';

export interface Chassis {
  id: string;
  name: string;
  series_id: number;
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
  purchased_at: string;
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
export type PitCrewRole = 'tire_changer_front' | 'tire_changer_rear' | 'tire_carrier_front' | 'tire_carrier_rear' | 'jackman';

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

// ---- Game context passed via Outlet ----
export interface GameContext {
  saveData: SaveSlotData;
  refreshSave: () => void;
}
