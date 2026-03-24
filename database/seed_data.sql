-- NASCAR Manager 2026 Cup Series Seed Data
-- Fictional team and driver names (copyright-friendly)

-- Insert 2026 Season
INSERT INTO seasons (year, start_date, end_date, num_races) VALUES
(2026, '2026-02-07', '2026-11-21', 36);

-- Insert Tracks (2026 Cup Series typical schedule)
INSERT INTO tracks (name, location, length_miles, turns, banking, track_type) VALUES
('Daytona International Speedway', 'Daytona, FL', 2.50, 4, 31, 'Superspeedway'),
('Las Vegas Motor Speedway', 'Las Vegas, NV', 1.50, 4, 20, 'Intermediate'),
('Phoenix Raceway', 'Phoenix, AZ', 1.00, 4, 11, 'Intermediate'),
('Atlanta Motor Speedway', 'Atlanta, GA', 1.54, 4, 28, 'Intermediate'),
('Bristol Motor Speedway', 'Bristol, TN', 0.53, 2, 16, 'Short Track'),
('Charlotte Motor Speedway', 'Charlotte, NC', 1.50, 4, 24, 'Intermediate'),
('Richmond Raceway', 'Richmond, VA', 0.75, 4, 14, 'Short Track'),
('Martinsville Speedway', 'Martinsville, VA', 0.53, 2, 12, 'Short Track'),
('Kansas Speedway', 'Kansas City, KS', 1.50, 4, 20, 'Intermediate'),
('Las Vegas Motor Speedway II', 'Las Vegas, NV', 1.50, 4, 20, 'Intermediate'),
('Michigan International Speedway', 'Brooklyn, MI', 2.00, 2, 18, 'Intermediate'),
('Talladega Superspeedway', 'Talladega, AL', 2.66, 2, 33, 'Superspeedway'),
('Nashville Superspeedway', 'Nashville, TN', 1.33, 4, 14, 'D-Shaped'),
('Chicago Street Circuit', 'Chicago, IL', 2.00, 15, 0, 'Road Course'),
('Road America', 'Elkhart Lake, WI', 4.05, 14, 0, 'Road Course'),
('New Hampshire Motor Speedway', 'Loudon, NH', 1.03, 2, 12, 'Intermediate'),
('Indianapolis Motor Speedway', 'Indianapolis, IN', 2.50, 4, 9, 'Oval/Road Course'),
('Pocono Raceway', 'Long Pond, PA', 2.50, 3, 6, 'Intermediate'),
('Watkins Glen International', 'Watkins Glen, NY', 2.45, 11, 0, 'Road Course'),
('Darlington Raceway', 'Darlington, SC', 1.37, 2, 25, 'Intermediate'),
('Texas Motor Speedway', 'Fort Worth, TX', 1.50, 4, 20, 'Intermediate'),
('Sonoma Raceway', 'Sonoma, CA', 1.99, 12, 0, 'Road Course'),
('Las Vegas Motor Speedway III', 'Las Vegas, NV', 1.50, 4, 20, 'Intermediate'),
('Homestead-Miami Speedway', 'Homestead, FL', 1.50, 4, 18, 'Intermediate'),
('Talladega Superspeedway II', 'Talladega, AL', 2.66, 2, 33, 'Superspeedway'),
('Dover Motor Speedway', 'Dover, DE', 1.00, 2, 24, 'Intermediate'),
('Fontana (Auto Club Speedway)', 'Fontana, CA', 2.00, 2, 14, 'Intermediate'),
('Brickyard 400', 'Indianapolis, IN', 2.50, 2, 9, 'Oval'),
('Daytona International Speedway II', 'Daytona, FL', 2.50, 4, 31, 'Superspeedway'),
('Las Vegas Motor Speedway Final', 'Las Vegas, NV', 1.50, 4, 20, 'Intermediate'),
('Phoenix Raceway Fall', 'Phoenix, AZ', 1.00, 4, 11, 'Intermediate'),
('Richmond Raceway Fall', 'Richmond, VA', 0.75, 4, 14, 'Short Track'),
('Bristol Motor Speedway Fall', 'Bristol, TN', 0.53, 2, 16, 'Short Track'),
('Charlotte Motor Speedway Fall', 'Charlotte, NC', 1.50, 4, 24, 'Intermediate'),
('Martinsville Speedway Fall', 'Martinsville, VA', 0.53, 2, 12, 'Short Track'),
('Phoenix Raceway Championship', 'Phoenix, AZ', 1.00, 4, 11, 'Intermediate');

-- Insert 34 Teams (fictional names, various rating levels)
INSERT INTO teams (name, founded_year, base_city, budget, reputation, garage_rating, headquarters) VALUES
-- Top Tier Teams (high budget)
('Velocity Racing', 1995, 'Charlotte, NC', 25000000, 95, 95, 'Charlotte, NC'),
('Legacy Motorsports', 1988, 'Concord, NC', 24000000, 93, 94, 'Concord, NC'),
('Elite Performance', 2000, 'Charlotte, NC', 23500000, 92, 93, 'Charlotte, NC'),
('Thunder Motors', 1992, 'Mooresville, NC', 23000000, 91, 91, 'Mooresville, NC'),
('Apex Racing', 1998, 'Charlotte, NC', 22500000, 90, 90, 'Charlotte, NC'),
-- Mid-High Tier Teams
('Catalyst Motorsports', 2005, 'Charlotte, NC', 18000000, 75, 78, 'Charlotte, NC'),
('Summit Racing Corp', 2002, 'Concord, NC', 17500000, 74, 76, 'Concord, NC'),
('Pinnacle Motorsports', 2001, 'Mooresville, NC', 17000000, 73, 75, 'Mooresville, NC'),
('Momentum Racing', 2008, 'Charlotte, NC', 16500000, 72, 74, 'Charlotte, NC'),
('Frontier Racing', 2007, 'Concord, NC', 16000000, 71, 72, 'Concord, NC'),
-- Mid Tier Teams
('Benchmark Racing', 2010, 'Charlotte, NC', 12000000, 55, 58, 'Charlotte, NC'),
('Aurora Motorsports', 2009, 'Mooresville, NC', 11500000, 54, 57, 'Mooresville, NC'),
('Nexus Racing', 2011, 'Charlotte, NC', 11000000, 53, 56, 'Charlotte, NC'),
('Paradigm Racing', 2012, 'Concord, NC', 10500000, 52, 55, 'Concord, NC'),
('Zenith Motorsports', 2013, 'Charlotte, NC', 10000000, 51, 54, 'Charlotte, NC'),
-- Mid-Low Tier Teams (good starting points)
('Ascent Racing', 2015, 'Mooresville, NC', 8500000, 40, 42, 'Mooresville, NC'),
('Forge Motorsports', 2014, 'Charlotte, NC', 8000000, 39, 41, 'Charlotte, NC'),
('Horizon Racing', 2016, 'Concord, NC', 7500000, 38, 40, 'Concord, NC'),
('Steel City Racing', 2017, 'Charlotte, NC', 7000000, 37, 39, 'Charlotte, NC'),
('Titan Racing', 2018, 'Mooresville, NC', 6500000, 36, 38, 'Mooresville, NC'),
-- Lower Tier Teams (challenging start)
('Genesis Racing', 2019, 'Charlotte, NC', 5500000, 25, 28, 'Charlotte, NC'),
('Pioneer Motorsports', 2020, 'Concord, NC', 5000000, 20, 25, 'Concord, NC'),
('Bootstrap Racing', 2021, 'Charlotte, NC', 4500000, 15, 20, 'Charlotte, NC'),
('Rising Star Motors', 2022, 'Mooresville, NC', 4000000, 12, 18, 'Mooresville, NC'),
('Underdog Racing', 2023, 'Charlotte, NC', 3500000, 10, 15, 'Charlotte, NC'),
-- Very Low Tier Teams (extreme challenge)
('Scrappy Racing', 2024, 'Concord, NC', 3000000, 8, 12, 'Concord, NC'),
('Grind House Racing', 2025, 'Charlotte, NC', 2500000, 5, 10, 'Charlotte, NC'),
('Raw Speed Motorsports', 2024, 'Mooresville, NC', 2000000, 3, 8, 'Mooresville, NC'),
('Last Chance Motors', 2025, 'Charlotte, NC', 1500000, 2, 5, 'Charlotte, NC'),
('Dream Chasers Racing', 2025, 'Concord, NC', 1000000, 1, 3, 'Concord, NC');

-- Insert Cars (one per team - they'll get more as they progress)
INSERT INTO cars (team_id, number, name, year, condition, speed_rating, handling_rating, reliability_rating, aerodynamics_rating) 
SELECT id, ROW_NUMBER()::VARCHAR, name || ' #' || ROW_NUMBER(), 2026, 'good', 
  50 + (reputation - 50) / 2,
  50 + (reputation - 50) / 2,
  50 + (garage_rating - 50) / 2,
  50 + (reputation - 50) / 2
FROM teams;

-- Insert Drivers (2 per team - primary and secondary drivers)
INSERT INTO drivers (first_name, last_name, number, team_id, car_id, status, age, experience, skill_rating, consistency_rating, racecraft_rating) 
SELECT 
  (ARRAY['Marcus', 'Tyler', 'Jason', 'Kyle', 'Brad', 'Chase', 'Joey', 'Austin', 'Chris', 'Denny', 'Martin', 'Ryan', 'Erik', 'Cole', 'Alex', 'Jordan', 'Chris', 'Matt', 'Ty', 'Noah', 'Logan', 'Parker', 'Jenson', 'Sebastian', 'Max', 'Fernando', 'Lewis', 'George', 'Lando', 'Oscar', 'Nicholas', 'Sergio', 'Yuki'])[((ROW_NUMBER()-1) % 33) + 1] as fname,
  (ARRAY['Griffin', 'Edwards', 'Thompson', 'Rogers', 'Chen', 'Wilson', 'Martinez', 'Anderson', 'Johnson', 'Williams', 'Brown', 'Miller', 'Davis', 'Jones', 'Taylor', 'Garcia', 'Moore', 'Jackson', 'Martin', 'Lee', 'Rodriguez', 'Harris', 'Young', 'King', 'Scott', 'Green', 'Adams', 'Nelson', 'Carter', 'Mitchell', 'Perez', 'Roberts', 'Turner'])[((ROW_NUMBER()-1) % 32) + 1] as lname,
  (ROW_NUMBER() * 2 - 1)::VARCHAR,
  ((ROW_NUMBER() - 1) / 2 + 1),
  ((ROW_NUMBER() - 1) / 2 + 1),
  'active',
  25 + (random() * 20)::INT,
  10 + (random() * 30)::INT,
  45 + (random() * 30)::INT,
  45 + (random() * 30)::INT,
  45 + (random() * 30)::INT
FROM teams;

-- Insert second drivers
INSERT INTO drivers (first_name, last_name, number, team_id, car_id, status, age, experience, skill_rating, consistency_rating, racecraft_rating) 
SELECT 
  (ARRAY['Anthony', 'Carson', 'Ty', 'Landon', 'Aric', 'Daniel', 'Michael', 'David', 'John', 'Kevin', 'Elliott', 'Lindsay', 'Scott', 'Justin', 'Chris', 'Kasey', 'Greg', 'Regan', 'Bobby', 'Ray', 'Trevor', 'Derrike', 'Clint', 'Robert', 'Kirk', 'James', 'Paul', 'Roush', 'Joe', 'Rodney', 'Geoff', 'Bill'])[((ROW_NUMBER()-1) % 31) + 1] as fname,
  (ARRAY['Alfredo', 'Briscoe', 'Dillon', 'Cassill', 'Almirola', 'Hemric', 'McDowell', 'Ragan', 'Hunter', 'Harvick', 'Ives', 'Ganassi', 'Gibbs', 'Haley', 'Bell', 'Kahne', 'Biffle', 'Smith', 'Labonte', 'Evernham', 'Bayne', 'Robinson', 'Bowyer', 'Yates', 'Busch', 'Finch', 'Menard', 'Jenkins', 'Gibbs', 'Orr', 'Davis', 'Ives'])[((ROW_NUMBER()-1) % 31) + 1] as lname,
  (ROW_NUMBER() * 2)::VARCHAR,
  ROW_NUMBER(),
  ROW_NUMBER(),
  'active',
  24 + (random() * 22)::INT,
  5 + (random() * 25)::INT,
  40 + (random() * 35)::INT,
  40 + (random() * 35)::INT,
  40 + (random() * 35)::INT
FROM teams;

-- Insert Crew Chiefs (best teams get better crew chiefs)
INSERT INTO crew_chiefs (first_name, last_name, team_id, driver_id, experience, strategy_rating, setup_rating, communication_rating)
SELECT
  (ARRAY['Chad', 'Steve', 'Ray', 'Frank', 'Greg', 'Rodney', 'Bootie', 'Dave', 'Paul', 'John', 'Kevin', 'Cole', 'Dirk', 'Dave', 'Marc', 'Jason', 'Casey', 'Newt', 'Darian', 'Robert', 'Gustavo', 'Jeremy', 'Pete', 'Brian', 'Mike', 'Ives', 'Adam'])[((ROW_NUMBER()-1) % 26) + 1],
  (ARRAY['Knaus', 'Letarte', 'Evernham', 'Voelker', 'Ives', 'Orr', 'Gustafson', 'Rogers', 'Wolfe', 'Ives', 'Manion', 'Pearn', 'Ives', 'Reynolds', 'Miller', 'Meyers', 'Ives', 'Moore', 'Ives', 'Yates', 'Gutierrez', 'Ives', 'Jacob', 'Ives', 'Ives', 'Ives', 'Adam'])[((ROW_NUMBER()-1) % 26) + 1],
  ((ROW_NUMBER() - 1) / 2 + 1),
  ROW_NUMBER(),
  15 + (random() * 25)::INT,
  55 + (random() * 35)::INT,
  55 + (random() * 35)::INT,
  55 + (random() * 35)::INT
FROM drivers
WHERE id % 2 = 1
LIMIT 34;

-- Insert Spotters
INSERT INTO spotters (first_name, last_name, team_id, driver_id, experience, awareness_rating, communication_rating, race_reading_rating)
SELECT
  (ARRAY['Jeff', 'Eric', 'Jim', 'Jimmy', 'Ryan', 'Robbie', 'TJ', 'Rodney', 'DJ', 'Gustavo', 'Tony', 'Brett', 'Darius', 'Josh', 'Rudy', 'Marcus', 'Tony', 'Andy', 'Mark', 'Jimmy', 'Darell', 'Chris', 'Kyle', 'Brett', 'Kenny', 'John', 'Wayde'])[((ROW_NUMBER()-1) % 26) + 1],
  (ARRAY['Hammond', 'Sandgren', 'Long', 'Gustafson', 'Reutimann', 'Carmichael', 'Bell', 'Garrison', 'Mixon', 'Gutierrez', 'Raines', 'Griffin', 'Saterfield', 'Wise', 'Bostic', 'Martin', 'Fearn', 'Miller', 'Marlar', 'Hedgecock', 'Waltrip', 'Meyering', 'Petty', 'Griffin', 'Schrader', 'Andretti', 'Baker'])[((ROW_NUMBER()-1) % 26) + 1],
  ((ROW_NUMBER() - 1) / 2 + 1),
  ROW_NUMBER(),
  12 + (random() * 20)::INT,
  50 + (random() * 40)::INT,
  50 + (random() * 40)::INT,
  50 + (random() * 40)::INT
FROM drivers
WHERE id % 2 = 0
LIMIT 34;

-- Insert Pit Crew Members (3 per team: jackman, tire changer, fuel assistant)
INSERT INTO pit_crew_members (first_name, last_name, team_id, driver_id, role, experience, speed_rating, accuracy_rating, efficiency_rating)
SELECT
  (ARRAY['Bobby', 'Tyler', 'Chris', 'Corey', 'Trent', 'Luke', 'Brandon', 'Derek', 'Scott', 'Danny', 'Joey', 'Jared', 'Zach', 'Carson', 'Ryan', 'Dusty', 'Brad', 'Mike', 'Kevin', 'James', 'Aaron', 'Cody', 'Austin', 'Travis', 'Taylor', 'Quinn', 'Morgan', 'Alex'])[((ROW_NUMBER()-1) % 28) + 1],
  (ARRAY['Labelle', 'Cox', 'Hanson', 'Ives', 'Carmichael', 'Kennedy', 'Miller', 'Johnson', 'Barnes', 'Robertson', 'Boggs', 'Peterman', 'Walker', 'Campbell', 'Thomas', 'Rhodes', 'Coleman', 'Richards', 'Watson', 'Brooks', 'Kelly', 'Sanders', 'Bennett', 'Hill', 'Wood', 'Foster', 'Palmer', 'Rose'])[((ROW_NUMBER()-1) % 28) + 1],
  ((ROW_NUMBER() - 1) / 3 + 1),
  ((ROW_NUMBER() - 1) / 3 + 1),
  (ARRAY['jackman', 'tire_changer', 'fuel_assistant'])[((ROW_NUMBER()-1) % 3) + 1],
  8 + (random() * 15)::INT,
  55 + (random() * 35)::INT,
  55 + (random() * 35)::INT,
  55 + (random() * 35)::INT
FROM teams
CROSS JOIN LATERAL generate_series(1, 3);

-- Insert Race Schedule for 2026
INSERT INTO races (season_id, round, name, track_id, date, distance_miles, laps, status)
SELECT
  1,
  ROW_NUMBER(),
  t.name || ' (Round ' || ROW_NUMBER() || ')',
  t.id,
  '2026-02-07'::DATE + (ROW_NUMBER() - 1) * '7 days'::INTERVAL,
  t.length_miles * CASE WHEN ROW_NUMBER() <= 3 THEN 66 ELSE 66 END,
  CASE 
    WHEN t.track_type = 'Superspeedway' THEN 500
    WHEN t.track_type = 'Road Course' THEN (400 / ROUND(t.length_miles::numeric, 1))::INT
    WHEN t.track_type = 'Short Track' THEN 500
    ELSE 400
  END,
  'scheduled'
FROM (
  SELECT * FROM tracks 
  WHERE name NOT LIKE '%II%' AND name NOT LIKE '%III%' AND name NOT LIKE 'Final' AND name NOT LIKE 'Championship' AND name NOT LIKE 'Fall'
  ORDER BY RANDOM()
  LIMIT 36
) t;

-- Commit and verify
COMMIT;

-- Print summary
SELECT 'NASCAR Manager 2026 Cup Series Database Initialized' as status;
SELECT COUNT(*) as teams FROM teams;
SELECT COUNT(*) as drivers FROM drivers;
SELECT COUNT(*) as races FROM races;
SELECT COUNT(*) as tracks FROM tracks;
SELECT COUNT(*) as cars FROM cars;
