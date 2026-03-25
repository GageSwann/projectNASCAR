-- NASCAR Manager Database Schema
-- 2026 Multi-Series (Truck, O'Reilly, Cup)

-- Drop existing tables if they exist (for fresh starts)
DROP TABLE IF EXISTS player_inventory CASCADE;
DROP TABLE IF EXISTS store_items CASCADE;
DROP TABLE IF EXISTS chassis CASCADE;
DROP TABLE IF EXISTS race_results CASCADE;
DROP TABLE IF EXISTS qualifying_results CASCADE;
DROP TABLE IF EXISTS races CASCADE;
DROP TABLE IF EXISTS seasons CASCADE;
DROP TABLE IF EXISTS pit_crew_members CASCADE;
DROP TABLE IF EXISTS spotters CASCADE;
DROP TABLE IF EXISTS crew_chiefs CASCADE;
DROP TABLE IF EXISTS drivers CASCADE;
DROP TABLE IF EXISTS cars CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS tracks CASCADE;
DROP TABLE IF EXISTS series CASCADE;
DROP TABLE IF EXISTS career_saves CASCADE;

-- Drop old enum types safely
DROP TYPE IF EXISTS driver_status CASCADE;
DROP TYPE IF EXISTS staff_role CASCADE;
DROP TYPE IF EXISTS car_condition CASCADE;
DROP TYPE IF EXISTS chassis_status CASCADE;
DROP TYPE IF EXISTS item_category CASCADE;

-- Enum types
CREATE TYPE driver_status AS ENUM ('active', 'injured', 'suspended', 'retired');
CREATE TYPE staff_role AS ENUM ('crew_chief', 'spotter', 'pit_crew');
CREATE TYPE car_condition AS ENUM ('excellent', 'good', 'fair', 'poor', 'wrecked');
CREATE TYPE chassis_status AS ENUM ('building', 'ready', 'damaged', 'totaled');
CREATE TYPE item_category AS ENUM ('engine', 'suspension', 'tires', 'aerodynamics', 'brakes', 'transmission', 'safety', 'electronics');

-- Series (Truck, O'Reilly, Cup)
CREATE TABLE series (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  short_name VARCHAR(50) NOT NULL,
  tier INT NOT NULL,            -- 1=Truck, 2=O'Reilly, 3=Cup
  num_races INT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Career Saves (player progression)
CREATE TABLE career_saves (
  id SERIAL PRIMARY KEY,
  player_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  current_season INT DEFAULT 2026,
  current_week INT DEFAULT 1,
  current_team_id INT,
  current_series_id INT REFERENCES series(id),
  total_championships INT DEFAULT 0,
  total_wins INT DEFAULT 0,
  money DECIMAL(14,2) DEFAULT 0
);

-- Teams
CREATE TABLE teams (
  id SERIAL PRIMARY KEY,
  series_id INT NOT NULL REFERENCES series(id),
  name VARCHAR(255) NOT NULL,
  founded_year INT,
  base_city VARCHAR(255),
  budget DECIMAL(12, 2) DEFAULT 5000000,
  reputation INT DEFAULT 50,
  garage_rating INT DEFAULT 50,
  headquarters VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(name, series_id)
);

-- Cars
CREATE TABLE cars (
  id SERIAL PRIMARY KEY,
  team_id INT NOT NULL REFERENCES teams(id),
  number VARCHAR(10) NOT NULL,
  name VARCHAR(255),
  year INT DEFAULT 2026,
  condition car_condition DEFAULT 'good',
  speed_rating INT DEFAULT 50,
  handling_rating INT DEFAULT 50,
  reliability_rating INT DEFAULT 50,
  aerodynamics_rating INT DEFAULT 50,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(team_id, number)
);

-- Drivers
CREATE TABLE drivers (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  number VARCHAR(10) NOT NULL UNIQUE,
  team_id INT REFERENCES teams(id),
  car_id INT REFERENCES cars(id),
  status driver_status DEFAULT 'active',
  age INT,
  experience INT DEFAULT 0,
  skill_rating INT DEFAULT 50,
  consistency_rating INT DEFAULT 50,
  racecraft_rating INT DEFAULT 50,
  contract_end_year INT DEFAULT 2026,
  wins INT DEFAULT 0,
  poles INT DEFAULT 0,
  top_10_finishes INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crew Chiefs
CREATE TABLE crew_chiefs (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  team_id INT NOT NULL REFERENCES teams(id),
  driver_id INT REFERENCES drivers(id),
  experience INT DEFAULT 0,
  strategy_rating INT DEFAULT 50,
  setup_rating INT DEFAULT 50,
  communication_rating INT DEFAULT 50,
  contract_end_year INT DEFAULT 2026,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Spotters
CREATE TABLE spotters (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  team_id INT NOT NULL REFERENCES teams(id),
  driver_id INT REFERENCES drivers(id),
  experience INT DEFAULT 0,
  awareness_rating INT DEFAULT 50,
  communication_rating INT DEFAULT 50,
  race_reading_rating INT DEFAULT 50,
  contract_end_year INT DEFAULT 2026,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pit Crew Members
CREATE TABLE pit_crew_members (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  team_id INT NOT NULL REFERENCES teams(id),
  driver_id INT REFERENCES drivers(id),
  role VARCHAR(50),
  experience INT DEFAULT 0,
  speed_rating INT DEFAULT 50,
  accuracy_rating INT DEFAULT 50,
  efficiency_rating INT DEFAULT 50,
  contract_end_year INT DEFAULT 2026,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tracks
CREATE TABLE tracks (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  location VARCHAR(255),
  country VARCHAR(255) DEFAULT 'USA',
  length_miles DECIMAL(5, 2),
  turns INT,
  banking INT,
  track_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seasons
CREATE TABLE seasons (
  id SERIAL PRIMARY KEY,
  year INT NOT NULL UNIQUE,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  num_races INT DEFAULT 36,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Races
CREATE TABLE races (
  id SERIAL PRIMARY KEY,
  season_id INT NOT NULL REFERENCES seasons(id),
  series_id INT NOT NULL REFERENCES series(id),
  round INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  track_id INT NOT NULL REFERENCES tracks(id),
  date TIMESTAMP,
  distance_miles DECIMAL(8, 2),
  laps INT,
  pole_winner_id INT REFERENCES drivers(id),
  race_winner_id INT REFERENCES drivers(id),
  winning_team_id INT REFERENCES teams(id),
  status VARCHAR(50) DEFAULT 'scheduled',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Qualifying Results
CREATE TABLE qualifying_results (
  id SERIAL PRIMARY KEY,
  race_id INT NOT NULL REFERENCES races(id),
  driver_id INT NOT NULL REFERENCES drivers(id),
  team_id INT NOT NULL REFERENCES teams(id),
  position INT,
  speed_mph DECIMAL(7, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Race Results
CREATE TABLE race_results (
  id SERIAL PRIMARY KEY,
  race_id INT NOT NULL REFERENCES races(id),
  driver_id INT NOT NULL REFERENCES drivers(id),
  team_id INT NOT NULL REFERENCES teams(id),
  car_id INT NOT NULL REFERENCES cars(id),
  starting_position INT,
  finishing_position INT,
  laps_completed INT,
  laps_led INT,
  pit_stops INT,
  status VARCHAR(50),
  dnf_reason VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(race_id, driver_id)
);

-- Indexes for common queries
CREATE INDEX idx_teams_budget ON teams(budget);
CREATE INDEX idx_teams_reputation ON teams(reputation);
CREATE INDEX idx_teams_series ON teams(series_id);
CREATE INDEX idx_drivers_team_id ON drivers(team_id);
CREATE INDEX idx_drivers_status ON drivers(status);
CREATE INDEX idx_cars_team_id ON cars(team_id);
CREATE INDEX idx_races_season_id ON races(season_id);
CREATE INDEX idx_races_series_id ON races(series_id);
CREATE INDEX idx_races_track_id ON races(track_id);
CREATE INDEX idx_races_status ON races(status);
CREATE INDEX idx_race_results_race_id ON race_results(race_id);
CREATE INDEX idx_race_results_driver_id ON race_results(driver_id);
CREATE INDEX idx_career_saves_player ON career_saves(player_name);

-- Chassis (vehicles players build in the garage)
CREATE TABLE chassis (
  id SERIAL PRIMARY KEY,
  career_save_id INT NOT NULL REFERENCES career_saves(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  series_id INT NOT NULL REFERENCES series(id),
  status chassis_status DEFAULT 'building',
  base_speed INT DEFAULT 40,
  base_handling INT DEFAULT 40,
  base_reliability INT DEFAULT 40,
  base_aero INT DEFAULT 40,
  weight_lbs INT DEFAULT 3200,
  build_progress INT DEFAULT 0,  -- 0-100%
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Store Items (parts catalog available for purchase)
CREATE TABLE store_items (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category item_category NOT NULL,
  tier INT NOT NULL DEFAULT 1,   -- 1=basic, 2=mid, 3=premium, 4=elite
  price DECIMAL(10, 2) NOT NULL,
  speed_bonus INT DEFAULT 0,
  handling_bonus INT DEFAULT 0,
  reliability_bonus INT DEFAULT 0,
  aero_bonus INT DEFAULT 0,
  weight_reduction INT DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Player Inventory (parts the player owns, installed on a chassis or in storage)
CREATE TABLE player_inventory (
  id SERIAL PRIMARY KEY,
  career_save_id INT NOT NULL REFERENCES career_saves(id) ON DELETE CASCADE,
  item_id INT NOT NULL REFERENCES store_items(id),
  chassis_id INT REFERENCES chassis(id) ON DELETE SET NULL,  -- NULL = in storage
  purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chassis_career ON chassis(career_save_id);
CREATE INDEX idx_chassis_series ON chassis(series_id);
CREATE INDEX idx_store_items_category ON store_items(category);
CREATE INDEX idx_store_items_tier ON store_items(tier);
CREATE INDEX idx_player_inventory_career ON player_inventory(career_save_id);
CREATE INDEX idx_player_inventory_chassis ON player_inventory(chassis_id);
