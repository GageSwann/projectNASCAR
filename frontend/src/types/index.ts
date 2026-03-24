// Main game types

export interface Team {
  id: number;
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
