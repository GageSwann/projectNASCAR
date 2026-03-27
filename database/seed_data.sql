-- NASCAR Manager 2026 Multi-Series Seed Data
-- Fictional team and driver names (copyright-friendly)

-- Insert 2026 Season
INSERT INTO seasons (year, start_date, end_date, num_races) VALUES
(2026, '2026-02-07', '2026-11-21', 36);

-- Insert Series
INSERT INTO series (name, short_name, tier, num_races, description) VALUES
('NASCAR Craftsman Truck Series', 'Trucks', 1, 23, 'The entry-level series of NASCAR national touring competition. Teams race modified pickup trucks on a variety of tracks.'),
('O''Reilly Series', 'OReilly', 2, 33, 'The stepping stone series between Trucks and Cup. Features a mix of veteran drivers and rising stars.'),
('NASCAR Cup Series', 'Cup', 3, 36, 'The premier division of NASCAR. The pinnacle of stock car racing with the biggest teams and the most prestigious events.');

-- Insert Tracks
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
('Homestead-Miami Speedway', 'Homestead, FL', 1.50, 4, 18, 'Intermediate'),
('Dover Motor Speedway', 'Dover, DE', 1.00, 2, 24, 'Intermediate'),
('Auto Club Speedway', 'Fontana, CA', 2.00, 2, 14, 'Intermediate'),
('Iowa Speedway', 'Newton, IA', 0.88, 2, 12, 'Short Track'),
('Portland International Raceway', 'Portland, OR', 1.97, 12, 0, 'Road Course'),
('World Wide Technology Raceway', 'Madison, IL', 1.25, 2, 11, 'Intermediate'),
('Circuit of the Americas', 'Austin, TX', 3.43, 20, 0, 'Road Course'),
('North Wilkesboro Speedway', 'N. Wilkesboro, NC', 0.63, 2, 16, 'Short Track'),
('Rockingham Speedway', 'Rockingham, NC', 1.02, 2, 22, 'Intermediate');

-- ============================================================
-- TRUCK SERIES TEAMS (series_id = 1)
-- ============================================================
INSERT INTO teams (series_id, name, founded_year, base_city, budget, reputation, garage_rating, headquarters) VALUES
(1, 'Ironhide Motorsports', 2005, 'Mooresville, NC', 8000000, 90, 88, 'Mooresville, NC'),
(1, 'Prairie Fire Racing', 2008, 'Charlotte, NC', 7500000, 87, 85, 'Charlotte, NC'),
(1, 'Gravel Road Motorsports', 2003, 'Concord, NC', 7200000, 85, 84, 'Concord, NC'),
(1, 'Longhorn Racing', 2010, 'Fort Worth, TX', 7000000, 83, 82, 'Fort Worth, TX'),
(1, 'Bison Motorsports', 2012, 'Charlotte, NC', 5500000, 70, 68, 'Charlotte, NC'),
(1, 'Ridgeline Racing', 2011, 'Mooresville, NC', 5200000, 68, 66, 'Mooresville, NC'),
(1, 'Stampede Motors', 2014, 'Concord, NC', 5000000, 66, 64, 'Concord, NC'),
(1, 'Bedrock Racing', 2013, 'Charlotte, NC', 4800000, 64, 62, 'Charlotte, NC'),
(1, 'Canyon Run Racing', 2016, 'Mooresville, NC', 3800000, 50, 50, 'Mooresville, NC'),
(1, 'Timberline Motorsports', 2015, 'Charlotte, NC', 3600000, 48, 48, 'Charlotte, NC'),
(1, 'Stone Bridge Racing', 2017, 'Concord, NC', 3400000, 46, 46, 'Concord, NC'),
(1, 'Trailhead Motors', 2018, 'Charlotte, NC', 3200000, 44, 44, 'Charlotte, NC'),
(1, 'Backwoods Racing', 2019, 'Mooresville, NC', 2500000, 30, 30, 'Mooresville, NC'),
(1, 'Gravel Pit Motorsports', 2020, 'Charlotte, NC', 2200000, 25, 25, 'Charlotte, NC'),
(1, 'Mudline Racing', 2021, 'Concord, NC', 2000000, 20, 20, 'Concord, NC'),
(1, 'Sawmill Racing', 2022, 'Charlotte, NC', 1800000, 15, 15, 'Charlotte, NC'),
(1, 'Dusty Trail Motors', 2023, 'Mooresville, NC', 1500000, 10, 10, 'Mooresville, NC'),
(1, 'Pothole Racing', 2024, 'Concord, NC', 1200000, 8, 8, 'Concord, NC'),
(1, 'Flatbed Motorsports', 2024, 'Charlotte, NC', 1000000, 5, 5, 'Charlotte, NC'),
(1, 'Rust Bucket Racing', 2025, 'Mooresville, NC', 800000, 3, 3, 'Mooresville, NC');

-- ============================================================
-- O'REILLY SERIES TEAMS (series_id = 2)
-- ============================================================
INSERT INTO teams (series_id, name, founded_year, base_city, budget, reputation, garage_rating, headquarters) VALUES
(2, 'Catalyst Motorsports', 2005, 'Charlotte, NC', 15000000, 92, 90, 'Charlotte, NC'),
(2, 'Pinnacle Racing', 2001, 'Mooresville, NC', 14500000, 90, 88, 'Mooresville, NC'),
(2, 'Summit Racing Corp', 2002, 'Concord, NC', 14000000, 88, 87, 'Concord, NC'),
(2, 'Momentum Racing', 2008, 'Charlotte, NC', 13500000, 86, 85, 'Charlotte, NC'),
(2, 'Frontier Motorsports', 2007, 'Concord, NC', 13000000, 84, 83, 'Concord, NC'),
(2, 'Aurora Motorsports', 2009, 'Mooresville, NC', 10000000, 72, 70, 'Mooresville, NC'),
(2, 'Nexus Racing', 2011, 'Charlotte, NC', 9500000, 70, 68, 'Charlotte, NC'),
(2, 'Paradigm Racing', 2012, 'Concord, NC', 9000000, 68, 66, 'Concord, NC'),
(2, 'Zenith Motorsports', 2013, 'Charlotte, NC', 8500000, 66, 64, 'Charlotte, NC'),
(2, 'Benchmark Racing', 2010, 'Charlotte, NC', 8000000, 64, 62, 'Charlotte, NC'),
(2, 'Ascent Racing', 2015, 'Mooresville, NC', 6500000, 50, 50, 'Mooresville, NC'),
(2, 'Forge Motorsports', 2014, 'Charlotte, NC', 6000000, 48, 48, 'Charlotte, NC'),
(2, 'Horizon Racing', 2016, 'Concord, NC', 5500000, 46, 46, 'Concord, NC'),
(2, 'Steel City Racing', 2017, 'Charlotte, NC', 5000000, 44, 44, 'Charlotte, NC'),
(2, 'Eclipse Motorsports', 2018, 'Mooresville, NC', 4800000, 42, 42, 'Mooresville, NC'),
(2, 'Crossroads Racing', 2019, 'Charlotte, NC', 4000000, 30, 30, 'Charlotte, NC'),
(2, 'Flint Motorsports', 2020, 'Concord, NC', 3500000, 25, 25, 'Concord, NC'),
(2, 'Cobalt Racing', 2021, 'Charlotte, NC', 3000000, 20, 20, 'Charlotte, NC'),
(2, 'Shale Motorsports', 2022, 'Mooresville, NC', 2500000, 15, 15, 'Mooresville, NC'),
(2, 'Ember Racing', 2023, 'Charlotte, NC', 2200000, 12, 12, 'Charlotte, NC'),
(2, 'Driftwood Motors', 2023, 'Concord, NC', 2000000, 10, 10, 'Concord, NC'),
(2, 'Tumble Run Racing', 2024, 'Charlotte, NC', 1800000, 8, 8, 'Charlotte, NC'),
(2, 'Matchstick Motorsports', 2024, 'Mooresville, NC', 1500000, 5, 5, 'Mooresville, NC'),
(2, 'Patchwork Racing', 2025, 'Charlotte, NC', 1200000, 3, 3, 'Charlotte, NC'),
(2, 'Burnout Racing', 2025, 'Concord, NC', 1000000, 1, 1, 'Concord, NC');

-- ============================================================
-- CUP SERIES TEAMS (series_id = 3)
-- ============================================================
INSERT INTO teams (series_id, name, founded_year, base_city, budget, reputation, garage_rating, headquarters) VALUES
(3, 'Velocity Racing', 1995, 'Charlotte, NC', 25000000, 95, 95, 'Charlotte, NC'),
(3, 'Legacy Motorsports', 1988, 'Concord, NC', 24000000, 93, 94, 'Concord, NC'),
(3, 'Elite Performance', 2000, 'Charlotte, NC', 23500000, 92, 93, 'Charlotte, NC'),
(3, 'Thunder Motors', 1992, 'Mooresville, NC', 23000000, 91, 91, 'Mooresville, NC'),
(3, 'Apex Racing', 1998, 'Charlotte, NC', 22500000, 90, 90, 'Charlotte, NC'),
(3, 'Overdrive Motorsports', 2005, 'Charlotte, NC', 18000000, 75, 78, 'Charlotte, NC'),
(3, 'Apex Grand Racing', 2002, 'Concord, NC', 17500000, 74, 76, 'Concord, NC'),
(3, 'Ironclad Motorsports', 2001, 'Mooresville, NC', 17000000, 73, 75, 'Mooresville, NC'),
(3, 'Titanium Racing', 2008, 'Charlotte, NC', 16500000, 72, 74, 'Charlotte, NC'),
(3, 'Vanguard Racing', 2007, 'Concord, NC', 16000000, 71, 72, 'Concord, NC'),
(3, 'Spectra Racing', 2010, 'Charlotte, NC', 12000000, 55, 58, 'Charlotte, NC'),
(3, 'Radiant Motorsports', 2009, 'Mooresville, NC', 11500000, 54, 57, 'Mooresville, NC'),
(3, 'Prism Racing', 2011, 'Charlotte, NC', 11000000, 53, 56, 'Charlotte, NC'),
(3, 'Meridian Racing', 2012, 'Concord, NC', 10500000, 52, 55, 'Concord, NC'),
(3, 'Equinox Motorsports', 2013, 'Charlotte, NC', 10000000, 51, 54, 'Charlotte, NC'),
(3, 'Wolfpack Racing', 2015, 'Mooresville, NC', 8500000, 40, 42, 'Mooresville, NC'),
(3, 'Torque Motorsports', 2014, 'Charlotte, NC', 8000000, 39, 41, 'Charlotte, NC'),
(3, 'Redline Racing', 2016, 'Concord, NC', 7500000, 38, 40, 'Concord, NC'),
(3, 'Carbon Fiber Racing', 2017, 'Charlotte, NC', 7000000, 37, 39, 'Charlotte, NC'),
(3, 'Titan Racing', 2018, 'Mooresville, NC', 6500000, 36, 38, 'Mooresville, NC'),
(3, 'Genesis Racing', 2019, 'Charlotte, NC', 5500000, 25, 28, 'Charlotte, NC'),
(3, 'Pioneer Motorsports', 2020, 'Concord, NC', 5000000, 20, 25, 'Concord, NC'),
(3, 'Bootstrap Racing', 2021, 'Charlotte, NC', 4500000, 15, 20, 'Charlotte, NC'),
(3, 'Rising Star Motors', 2022, 'Mooresville, NC', 4000000, 12, 18, 'Mooresville, NC'),
(3, 'Underdog Racing', 2023, 'Charlotte, NC', 3500000, 10, 15, 'Charlotte, NC'),
(3, 'Scrappy Racing', 2024, 'Concord, NC', 3000000, 8, 12, 'Concord, NC'),
(3, 'Grind House Racing', 2025, 'Charlotte, NC', 2500000, 5, 10, 'Charlotte, NC'),
(3, 'Raw Speed Motorsports', 2024, 'Mooresville, NC', 2000000, 3, 8, 'Mooresville, NC'),
(3, 'Last Chance Motors', 2025, 'Charlotte, NC', 1500000, 2, 5, 'Charlotte, NC'),
(3, 'Dream Chasers Racing', 2025, 'Concord, NC', 1000000, 1, 3, 'Concord, NC');

-- Insert Cars (one per team)
INSERT INTO cars (team_id, number, name, year, condition, speed_rating, handling_rating, reliability_rating, aerodynamics_rating)
SELECT id, ROW_NUMBER() OVER ()::VARCHAR, name || ' #' || ROW_NUMBER() OVER (), 2026, 'good',
  50 + (reputation - 50) / 2,
  50 + (reputation - 50) / 2,
  50 + (garage_rating - 50) / 2,
  50 + (reputation - 50) / 2
FROM teams;

-- Insert primary drivers (1 per team)
INSERT INTO drivers (first_name, last_name, number, team_id, car_id, status, age, experience, skill_rating, consistency_rating, racecraft_rating)
SELECT
  (ARRAY['Marcus', 'Tyler', 'Jason', 'Kyle', 'Brad', 'Chase', 'Joey', 'Austin', 'Chris', 'Denny',
         'Martin', 'Ryan', 'Erik', 'Cole', 'Alex', 'Jordan', 'Matt', 'Ty', 'Noah', 'Logan',
         'Parker', 'Jenson', 'Sebastian', 'Max', 'Fernando', 'Lewis', 'George', 'Lando', 'Oscar', 'Nicholas',
         'Sergio', 'Yuki', 'Valtteri', 'Pierre', 'Daniel', 'Kevin', 'Mick', 'Nico', 'Antonio', 'Zhou',
         'Nyck', 'Colton', 'Pato', 'Rinus', 'Scott', 'Josef', 'Will', 'Conor', 'Romain', 'Felix',
         'Jack', 'Theo', 'Isack', 'Jesse', 'Corey', 'AJ', 'Chandler', 'Harrison', 'Sam', 'Zane',
         'Derek', 'Sheldon', 'Christian', 'Connor', 'Brennan', 'Grant', 'Taylor', 'Layne', 'Nick', 'Carson',
         'Kaz', 'Blaine', 'Tanner', 'Wade', 'Reed'])[((ROW_NUMBER() OVER () - 1) % 75) + 1],
  (ARRAY['Griffin', 'Edwards', 'Thompson', 'Rogers', 'Chen', 'Wilson', 'Martinez', 'Anderson', 'Johnson', 'Williams',
         'Brown', 'Miller', 'Davis', 'Jones', 'Taylor', 'Garcia', 'Moore', 'Jackson', 'Martin', 'Lee',
         'Rodriguez', 'Harris', 'Young', 'King', 'Scott', 'Green', 'Adams', 'Nelson', 'Carter', 'Mitchell',
         'Perez', 'Roberts', 'Turner', 'Phillips', 'Campbell', 'Parker', 'Evans', 'Diaz', 'Cruz', 'Reyes',
         'Long', 'Foster', 'Ward', 'Torres', 'Brooks', 'Bennett', 'Gray', 'Ramirez', 'James', 'Watson',
         'Price', 'Sanders', 'Patel', 'Moreno', 'Beck', 'Sullivan', 'Reed', 'Cook', 'Bailey', 'Bell',
         'Hart', 'Frost', 'Sharp', 'Wells', 'Cole', 'Stone', 'Poole', 'Powers', 'Ingram', 'Koch',
         'Blackwell', 'Howard', 'Greer', 'Perkins', 'Moran'])[((ROW_NUMBER() OVER () - 1) % 75) + 1],
  ROW_NUMBER() OVER ()::VARCHAR,
  t.id,
  c.id,
  'active',
  22 + (random() * 20)::INT,
  5 + (random() * 25)::INT,
  GREATEST(35, LEAST(95, t.reputation - 10 + (random() * 20)::INT)),
  GREATEST(35, LEAST(95, t.reputation - 10 + (random() * 20)::INT)),
  GREATEST(35, LEAST(95, t.reputation - 10 + (random() * 20)::INT))
FROM teams t
JOIN cars c ON c.team_id = t.id;

-- Insert secondary drivers (1 per team)
INSERT INTO drivers (first_name, last_name, number, team_id, car_id, status, age, experience, skill_rating, consistency_rating, racecraft_rating)
SELECT
  (ARRAY['Anthony', 'Carson', 'Landon', 'Aric', 'Daniel', 'Michael', 'David', 'John', 'Kevin', 'Elliott',
         'Scott', 'Justin', 'Kasey', 'Greg', 'Regan', 'Bobby', 'Ray', 'Trevor', 'Clint', 'Robert',
         'James', 'Paul', 'Joe', 'Rodney', 'Geoff', 'Bill', 'Todd', 'Wally', 'Sterling', 'Jack',
         'Ben', 'Cody', 'Dylan', 'Luke', 'Gavin', 'Ian', 'Troy', 'Seth', 'Caleb', 'Wyatt',
         'Miles', 'Blake', 'Drew', 'Reed', 'Wade', 'Kent', 'Heath', 'Dean', 'Ross', 'Clay',
         'Dane', 'Lane', 'Cash', 'Brock', 'Nash', 'Bo', 'Gage', 'Finn', 'Knox', 'Rhett',
         'Quinn', 'Jett', 'Cruz', 'Brooks', 'Ellis', 'Hayes', 'Rowan', 'Nolan', 'Tate', 'Reid',
         'Burke', 'Paxton', 'Lawson', 'Keegan', 'Colby'])[((ROW_NUMBER() OVER () - 1) % 75) + 1],
  (ARRAY['Alfredo', 'Briscoe', 'Dillon', 'Cassill', 'Hemric', 'McDowell', 'Ragan', 'Hunter', 'Ives', 'Ganassi',
         'Gibbs', 'Haley', 'Kahne', 'Biffle', 'Smith', 'Labonte', 'Evernham', 'Bayne', 'Bowyer', 'Yates',
         'Finch', 'Menard', 'Jenkins', 'Orr', 'Combs', 'Webb', 'Marsh', 'Quinn', 'Lane', 'Cross',
         'Frost', 'Snyder', 'Pope', 'Dunn', 'Kerr', 'Vaughn', 'Rice', 'Hale', 'Powers', 'Swann',
         'Dalton', 'Vance', 'Benton', 'Mercer', 'Cash', 'Ford', 'Steele', 'Black', 'Knight', 'Wolf',
         'Sparks', 'Crane', 'Holt', 'Chase', 'Storm', 'Blaze', 'Hawk', 'Arrow', 'Slate', 'Ridge',
         'Valley', 'Brook', 'Canyon', 'Harbor', 'Rivers', 'Stone', 'Drake', 'Fox', 'Raven', 'Eagle',
         'Lyon', 'North', 'West', 'East', 'Atlas'])[((ROW_NUMBER() OVER () - 1) % 75) + 1],
  (75 + ROW_NUMBER() OVER ())::VARCHAR,
  t.id,
  c.id,
  'active',
  21 + (random() * 23)::INT,
  3 + (random() * 20)::INT,
  GREATEST(30, LEAST(90, t.reputation - 15 + (random() * 20)::INT)),
  GREATEST(30, LEAST(90, t.reputation - 15 + (random() * 20)::INT)),
  GREATEST(30, LEAST(90, t.reputation - 15 + (random() * 20)::INT))
FROM teams t
JOIN cars c ON c.team_id = t.id;

-- Insert Crew Chiefs (1 per team)
INSERT INTO crew_chiefs (first_name, last_name, team_id, experience, strategy_rating, setup_rating, communication_rating)
SELECT
  (ARRAY['Chad', 'Steve', 'Ray', 'Frank', 'Greg', 'Rodney', 'Dave', 'Paul', 'John', 'Kevin',
         'Cole', 'Jason', 'Casey', 'Darian', 'Robert', 'Jeremy', 'Pete', 'Brian', 'Mike', 'Adam',
         'Cliff', 'Travis', 'Andy', 'Brent', 'Keith', 'Neil', 'Oscar', 'Craig', 'Phil', 'Hank',
         'Warren', 'Earl', 'Vernon', 'Roy', 'Lyle', 'Glenn', 'Dale', 'Wayne', 'Kurt', 'Blake',
         'Gavin', 'Ivan', 'Leon', 'Otto', 'Rex', 'Stan', 'Wade', 'Herb', 'Carl', 'Dean',
         'Ed', 'Walt', 'Vince', 'Hugh', 'Gene', 'Sid', 'Ira', 'Abe', 'Gus', 'Nate',
         'Eli', 'Max', 'Art', 'Cal', 'Sam', 'Hal', 'Ted', 'Mel', 'Don', 'Vic',
         'Len', 'Roy', 'Ned', 'Pat', 'Ken'])[((ROW_NUMBER() OVER () - 1) % 75) + 1],
  (ARRAY['Knaus', 'Letarte', 'Evernham', 'Voelker', 'Orr', 'Gustafson', 'Rogers', 'Wolfe', 'Manion', 'Pearn',
         'Reynolds', 'Meyers', 'Moore', 'Yates', 'Gutierrez', 'Jacob', 'Walsh', 'Drake', 'Field', 'Burke',
         'Lane', 'Grant', 'Abbott', 'Roman', 'Prince', 'Barker', 'French', 'Goodwin', 'Dale', 'Owen',
         'Hyde', 'Gibbs', 'Bishop', 'Page', 'Chambers', 'Floyd', 'Mathis', 'Norton', 'Horn', 'Gentry',
         'Starks', 'Bowman', 'Fritz', 'Carr', 'Kemp', 'Branch', 'Mayo', 'Cowan', 'Hensley', 'Park',
         'Bloom', 'Sharp', 'Tate', 'Cash', 'Blaine', 'Knox', 'Rawls', 'Huff', 'Mack', 'Pike',
         'Bond', 'Hess', 'Lowe', 'Glass', 'Key', 'Law', 'Ott', 'Bunn', 'Ely', 'Roe',
         'Lay', 'Dow', 'Erb', 'Fay', 'Gil'])[((ROW_NUMBER() OVER () - 1) % 75) + 1],
  t.id,
  10 + (random() * 25)::INT,
  GREATEST(40, LEAST(95, t.reputation - 5 + (random() * 15)::INT)),
  GREATEST(40, LEAST(95, t.garage_rating - 5 + (random() * 15)::INT)),
  GREATEST(40, LEAST(95, t.reputation - 10 + (random() * 20)::INT))
FROM teams t;

-- Insert Spotters (1 per team)
INSERT INTO spotters (first_name, last_name, team_id, experience, awareness_rating, communication_rating, race_reading_rating)
SELECT
  (ARRAY['Jeff', 'Eric', 'Jim', 'Jimmy', 'Robbie', 'TJ', 'DJ', 'Tony', 'Brett', 'Darius',
         'Josh', 'Rudy', 'Andy', 'Mark', 'Darell', 'Kyle', 'Kenny', 'Buck', 'Chet', 'Dirk',
         'Floyd', 'Gabe', 'Homer', 'Irwin', 'Jake', 'Lloyd', 'Mitch', 'Norm', 'Otis', 'Pete',
         'Quinn', 'Ralph', 'Stan', 'Trent', 'Vern', 'Willis', 'Axel', 'Bo', 'Clay', 'Duke',
         'Ernie', 'Fritz', 'Gil', 'Hank', 'Ike', 'Jesse', 'Kirk', 'Lou', 'Mac', 'Ned',
         'Ollie', 'Price', 'Reese', 'Sal', 'Theo', 'Uri', 'Val', 'Wes', 'Yuri', 'Zeke',
         'Asa', 'Bud', 'Cal', 'Dev', 'Ewing', 'Finn', 'Gio', 'Hugo', 'Ivan', 'Jay',
         'Kai', 'Lance', 'Mo', 'Nash', 'Oz'])[((ROW_NUMBER() OVER () - 1) % 75) + 1],
  (ARRAY['Hammond', 'Sandgren', 'Long', 'Reutimann', 'Carmichael', 'Bell', 'Garrison', 'Mixon', 'Raines', 'Saterfield',
         'Wise', 'Bostic', 'Fearn', 'Marlar', 'Waltrip', 'Petty', 'Schrader', 'Jarrett', 'Purvis', 'Thorn',
         'Bland', 'Kern', 'Lund', 'Mohr', 'Odom', 'Roth', 'Self', 'Tuck', 'Veal', 'Wrenn',
         'York', 'Zink', 'Ash', 'Byrd', 'Cobb', 'Dunn', 'Edge', 'Fish', 'Gold', 'Hamm',
         'Ivy', 'Joy', 'Keel', 'Link', 'Moon', 'Nunn', 'Oak', 'Pyle', 'Rush', 'Snow',
         'Trim', 'Ulm', 'Vine', 'Ware', 'Yost', 'Zell', 'Bale', 'Cope', 'Dare', 'Erne',
         'Fisk', 'Geer', 'Harp', 'Inch', 'Jobe', 'Kite', 'Loom', 'Moss', 'Noel', 'Oaks',
         'Plum', 'Quay', 'Root', 'Sage', 'True'])[((ROW_NUMBER() OVER () - 1) % 75) + 1],
  t.id,
  8 + (random() * 20)::INT,
  GREATEST(40, LEAST(95, t.reputation - 5 + (random() * 20)::INT)),
  GREATEST(40, LEAST(95, t.reputation - 5 + (random() * 20)::INT)),
  GREATEST(40, LEAST(95, t.reputation - 5 + (random() * 20)::INT))
FROM teams t;

-- Insert Pit Crew Members (3 per team)
INSERT INTO pit_crew_members (first_name, last_name, team_id, role, experience, speed_rating, accuracy_rating, efficiency_rating)
SELECT
  (ARRAY['Bobby', 'Tyler', 'Chris', 'Corey', 'Trent', 'Luke', 'Brandon', 'Derek', 'Danny', 'Joey',
         'Jared', 'Zach', 'Dusty', 'Brad', 'Mike', 'Aaron', 'Cody', 'Travis', 'Taylor', 'Quinn',
         'Morgan', 'Alex', 'Billy', 'Chuck', 'Doug', 'Emmett', 'Fred', 'Gary', 'Homer', 'Ira',
         'Jake', 'Karl', 'Leo', 'Marco', 'Nolan', 'Omar', 'Pat', 'Ravi', 'Saul', 'Tom',
         'Ugo', 'Vic', 'Walt', 'Xavier', 'Yuri', 'Zach', 'Aaron', 'Blake', 'Cade', 'Dane',
         'Eli', 'Finn', 'Gage', 'Hugh', 'Ivan', 'Jace', 'Kane', 'Lane', 'Max', 'Nate',
         'Owen', 'Pete', 'Reed', 'Seth', 'Troy', 'Van', 'Webb', 'Xane', 'York', 'Zane',
         'Alec', 'Beau', 'Clay', 'Drew', 'Evan'])[((ROW_NUMBER() OVER () - 1) % 75) + 1],
  (ARRAY['Labelle', 'Cox', 'Hanson', 'Carmichael', 'Kennedy', 'Miller', 'Barnes', 'Robertson', 'Walker', 'Campbell',
         'Rhodes', 'Coleman', 'Watson', 'Brooks', 'Sanders', 'Bennett', 'Hill', 'Wood', 'Foster', 'Palmer',
         'Rose', 'Holt', 'Logan', 'Monk', 'Noble', 'Penn', 'Quick', 'Rand', 'Stout', 'Todd',
         'Urban', 'Vest', 'West', 'Yount', 'Zorn', 'Brick', 'Cline', 'Drews', 'Elms', 'Foss',
         'Gibbs', 'Huff', 'Ingle', 'Jett', 'Krug', 'Lapp', 'Muir', 'Neff', 'Ogle', 'Pugh',
         'Quinn', 'Rolf', 'Sims', 'Tuck', 'Ulm', 'Vick', 'Wynn', 'York', 'Zerr', 'Arch',
         'Bolt', 'Cork', 'Dean', 'Fern', 'Glen', 'Haze', 'Isom', 'Jade', 'Keen', 'Lark',
         'Mead', 'Nave', 'Orca', 'Pike', 'Quill'])[((ROW_NUMBER() OVER () - 1) % 75) + 1],
  t.id,
  (ARRAY['jackman', 'tire_changer', 'fuel_assistant'])[s.n],
  5 + (random() * 15)::INT,
  GREATEST(40, LEAST(95, t.reputation - 10 + (random() * 25)::INT)),
  GREATEST(40, LEAST(95, t.reputation - 10 + (random() * 25)::INT)),
  GREATEST(40, LEAST(95, t.reputation - 10 + (random() * 25)::INT))
FROM teams t
CROSS JOIN (SELECT generate_series(1, 3) AS n) s;

-- ============================================================
-- RACE SCHEDULES
-- ============================================================

-- Cup Series Schedule (36 races)
INSERT INTO races (season_id, series_id, round, name, track_id, date, laps, status) VALUES
(1, 3, 1, 'Daytona 500', 1, '2026-02-15', 200, 'scheduled'),
(1, 3, 2, 'Las Vegas 400', 2, '2026-02-22', 267, 'scheduled'),
(1, 3, 3, 'Phoenix 312', 3, '2026-03-01', 312, 'scheduled'),
(1, 3, 4, 'Atlanta 500', 4, '2026-03-08', 325, 'scheduled'),
(1, 3, 5, 'Bristol Night Race', 5, '2026-03-15', 500, 'scheduled'),
(1, 3, 6, 'Charlotte 600', 6, '2026-03-22', 400, 'scheduled'),
(1, 3, 7, 'Richmond 400', 7, '2026-03-29', 400, 'scheduled'),
(1, 3, 8, 'Martinsville 500', 8, '2026-04-05', 500, 'scheduled'),
(1, 3, 9, 'Kansas 400', 9, '2026-04-12', 267, 'scheduled'),
(1, 3, 10, 'Michigan 400', 10, '2026-04-19', 200, 'scheduled'),
(1, 3, 11, 'Talladega 500', 11, '2026-04-26', 188, 'scheduled'),
(1, 3, 12, 'Nashville 300', 12, '2026-05-03', 225, 'scheduled'),
(1, 3, 13, 'Chicago Street Race', 13, '2026-05-10', 100, 'scheduled'),
(1, 3, 14, 'Road America 250', 14, '2026-05-17', 62, 'scheduled'),
(1, 3, 15, 'New Hampshire 301', 15, '2026-05-24', 301, 'scheduled'),
(1, 3, 16, 'Indianapolis Brickyard', 16, '2026-05-31', 160, 'scheduled'),
(1, 3, 17, 'Pocono 400', 17, '2026-06-07', 160, 'scheduled'),
(1, 3, 18, 'Watkins Glen 355', 18, '2026-06-14', 90, 'scheduled'),
(1, 3, 19, 'Darlington 500', 19, '2026-06-21', 367, 'scheduled'),
(1, 3, 20, 'Texas 500', 20, '2026-06-28', 334, 'scheduled'),
(1, 3, 21, 'Sonoma 350', 21, '2026-07-05', 110, 'scheduled'),
(1, 3, 22, 'Homestead 400', 22, '2026-07-12', 267, 'scheduled'),
(1, 3, 23, 'Dover 400', 23, '2026-07-19', 400, 'scheduled'),
(1, 3, 24, 'Fontana 400', 24, '2026-07-26', 200, 'scheduled'),
(1, 3, 25, 'Iowa 300', 25, '2026-08-02', 300, 'scheduled'),
(1, 3, 26, 'Portland Grand Prix', 26, '2026-08-09', 110, 'scheduled'),
(1, 3, 27, 'WWT Raceway 300', 27, '2026-08-16', 240, 'scheduled'),
(1, 3, 28, 'COTA Challenge', 28, '2026-08-23', 68, 'scheduled'),
(1, 3, 29, 'Daytona Summer', 1, '2026-08-30', 160, 'scheduled'),
(1, 3, 30, 'Las Vegas Playoff', 2, '2026-09-06', 267, 'scheduled'),
(1, 3, 31, 'Bristol Playoff', 5, '2026-09-13', 500, 'scheduled'),
(1, 3, 32, 'Talladega Playoff', 11, '2026-09-20', 188, 'scheduled'),
(1, 3, 33, 'Charlotte Roval', 6, '2026-09-27', 109, 'scheduled'),
(1, 3, 34, 'Martinsville Playoff', 8, '2026-10-04', 500, 'scheduled'),
(1, 3, 35, 'North Wilkesboro 400', 29, '2026-10-11', 400, 'scheduled'),
(1, 3, 36, 'Phoenix Championship', 3, '2026-11-01', 312, 'scheduled');

-- O'Reilly Series Schedule (33 races)
INSERT INTO races (season_id, series_id, round, name, track_id, date, laps, status) VALUES
(1, 2, 1, 'Daytona O''Reilly 300', 1, '2026-02-14', 120, 'scheduled'),
(1, 2, 2, 'Las Vegas O''Reilly 300', 2, '2026-02-21', 200, 'scheduled'),
(1, 2, 3, 'Phoenix O''Reilly 200', 3, '2026-02-28', 200, 'scheduled'),
(1, 2, 4, 'Atlanta O''Reilly 300', 4, '2026-03-07', 195, 'scheduled'),
(1, 2, 5, 'Bristol O''Reilly 300', 5, '2026-03-14', 300, 'scheduled'),
(1, 2, 6, 'Charlotte O''Reilly 300', 6, '2026-03-21', 200, 'scheduled'),
(1, 2, 7, 'Richmond O''Reilly 250', 7, '2026-03-28', 250, 'scheduled'),
(1, 2, 8, 'Martinsville O''Reilly 250', 8, '2026-04-04', 250, 'scheduled'),
(1, 2, 9, 'Kansas O''Reilly 300', 9, '2026-04-11', 200, 'scheduled'),
(1, 2, 10, 'Michigan O''Reilly 250', 10, '2026-04-18', 125, 'scheduled'),
(1, 2, 11, 'Talladega O''Reilly 300', 11, '2026-04-25', 113, 'scheduled'),
(1, 2, 12, 'Nashville O''Reilly 300', 12, '2026-05-02', 200, 'scheduled'),
(1, 2, 13, 'Road America O''Reilly 250', 14, '2026-05-16', 45, 'scheduled'),
(1, 2, 14, 'New Hampshire O''Reilly 200', 15, '2026-05-23', 200, 'scheduled'),
(1, 2, 15, 'Pocono O''Reilly 225', 17, '2026-06-06', 90, 'scheduled'),
(1, 2, 16, 'Watkins Glen O''Reilly 200', 18, '2026-06-13', 82, 'scheduled'),
(1, 2, 17, 'Darlington O''Reilly 300', 19, '2026-06-20', 147, 'scheduled'),
(1, 2, 18, 'Texas O''Reilly 300', 20, '2026-06-27', 200, 'scheduled'),
(1, 2, 19, 'Homestead O''Reilly 300', 22, '2026-07-11', 200, 'scheduled'),
(1, 2, 20, 'Dover O''Reilly 200', 23, '2026-07-18', 200, 'scheduled'),
(1, 2, 21, 'Fontana O''Reilly 300', 24, '2026-07-25', 150, 'scheduled'),
(1, 2, 22, 'Iowa O''Reilly 250', 25, '2026-08-01', 250, 'scheduled'),
(1, 2, 23, 'Portland O''Reilly 200', 26, '2026-08-08', 75, 'scheduled'),
(1, 2, 24, 'WWT O''Reilly 250', 27, '2026-08-15', 200, 'scheduled'),
(1, 2, 25, 'COTA O''Reilly 200', 28, '2026-08-22', 46, 'scheduled'),
(1, 2, 26, 'Daytona O''Reilly Summer', 1, '2026-08-29', 100, 'scheduled'),
(1, 2, 27, 'Las Vegas O''Reilly Playoff', 2, '2026-09-05', 200, 'scheduled'),
(1, 2, 28, 'Bristol O''Reilly Playoff', 5, '2026-09-12', 300, 'scheduled'),
(1, 2, 29, 'Talladega O''Reilly Playoff', 11, '2026-09-19', 113, 'scheduled'),
(1, 2, 30, 'Charlotte O''Reilly Playoff', 6, '2026-09-26', 200, 'scheduled'),
(1, 2, 31, 'Martinsville O''Reilly Playoff', 8, '2026-10-03', 250, 'scheduled'),
(1, 2, 32, 'Rockingham O''Reilly 300', 30, '2026-10-10', 300, 'scheduled'),
(1, 2, 33, 'Phoenix O''Reilly Championship', 3, '2026-10-31', 200, 'scheduled');

-- Truck Series Schedule (23 races)
INSERT INTO races (season_id, series_id, round, name, track_id, date, laps, status) VALUES
(1, 1, 1, 'Daytona Truck 250', 1, '2026-02-13', 100, 'scheduled'),
(1, 1, 2, 'Las Vegas Truck 200', 2, '2026-02-20', 134, 'scheduled'),
(1, 1, 3, 'Atlanta Truck 200', 4, '2026-03-06', 130, 'scheduled'),
(1, 1, 4, 'Bristol Truck 200', 5, '2026-03-13', 200, 'scheduled'),
(1, 1, 5, 'Charlotte Truck 200', 6, '2026-03-20', 134, 'scheduled'),
(1, 1, 6, 'Richmond Truck 200', 7, '2026-03-27', 200, 'scheduled'),
(1, 1, 7, 'Martinsville Truck 200', 8, '2026-04-03', 200, 'scheduled'),
(1, 1, 8, 'Kansas Truck 200', 9, '2026-04-10', 134, 'scheduled'),
(1, 1, 9, 'Talladega Truck 200', 11, '2026-04-24', 94, 'scheduled'),
(1, 1, 10, 'Nashville Truck 200', 12, '2026-05-01', 150, 'scheduled'),
(1, 1, 11, 'Texas Truck 200', 20, '2026-06-26', 167, 'scheduled'),
(1, 1, 12, 'Homestead Truck 200', 22, '2026-07-10', 134, 'scheduled'),
(1, 1, 13, 'Iowa Truck 200', 25, '2026-07-31', 200, 'scheduled'),
(1, 1, 14, 'Portland Truck 150', 26, '2026-08-07', 60, 'scheduled'),
(1, 1, 15, 'WWT Truck 200', 27, '2026-08-14', 160, 'scheduled'),
(1, 1, 16, 'COTA Truck 150', 28, '2026-08-21', 35, 'scheduled'),
(1, 1, 17, 'Daytona Truck Summer', 1, '2026-08-28', 100, 'scheduled'),
(1, 1, 18, 'Las Vegas Truck Playoff', 2, '2026-09-04', 134, 'scheduled'),
(1, 1, 19, 'Bristol Truck Playoff', 5, '2026-09-11', 200, 'scheduled'),
(1, 1, 20, 'Talladega Truck Playoff', 11, '2026-09-18', 94, 'scheduled'),
(1, 1, 21, 'Martinsville Truck Playoff', 8, '2026-10-02', 200, 'scheduled'),
(1, 1, 22, 'North Wilkesboro Truck 200', 29, '2026-10-09', 200, 'scheduled'),
(1, 1, 23, 'Phoenix Truck Championship', 3, '2026-10-30', 150, 'scheduled');

-- ============================================================
-- STORE ITEMS (Parts Catalog)
-- ============================================================
INSERT INTO store_items (name, category, tier, price, speed_bonus, handling_bonus, reliability_bonus, aero_bonus, weight_reduction, description) VALUES
('Base Engine', 'engine', 1, 15000, 2, 0, 2, 0, 0, 'A reliable factory-spec engine.'),
('Sport Engine', 'engine', 2, 45000, 4, 0, 4, 0, 0, 'Professionally tuned for better power output.'),
('Competition Engine', 'engine', 3, 120000, 8, 1, 7, 0, 0, 'Built specifically for competition.'),
('Elite Engine', 'engine', 4, 300000, 11, 2, 11, 0, 0, 'Top-of-the-line racing engine.'),
('Base Suspension', 'suspension', 1, 8000, 0, 3, 2, 0, 0, 'Basic suspension for all-around handling.'),
('Sport Suspension', 'suspension', 2, 25000, 1, 6, 4, 0, 0, 'Upgraded dampers for better cornering.'),
('Competition Suspension', 'suspension', 3, 70000, 2, 11, 7, 1, 5, 'Full adjustable race suspension.'),
('Elite Suspension', 'suspension', 4, 180000, 3, 16, 11, 2, 10, 'The ultimate in handling tech.'),
('Base Tires', 'tires', 1, 5000, 1, 2, 1, 0, 0, 'General purpose racing tires.'),
('Sport Tires', 'tires', 2, 15000, 2, 5, 2, 0, 0, 'Soft compound for better grip.'),
('Competition Tires', 'tires', 3, 40000, 3, 7, 6, 0, 0, 'Long-lasting race-distance tires.'),
('Elite Tires', 'tires', 4, 100000, 5, 10, 8, 1, 0, 'Maximum grip. The best available.'),
('Base Aero', 'aerodynamics', 1, 10000, 1, 1, 1, 3, 0, 'Standard aero for downforce.'),
('Sport Aero', 'aerodynamics', 2, 30000, 2, 2, 2, 7, 0, 'Wind-tunnel tested improvements.'),
('Competition Aero', 'aerodynamics', 3, 80000, 4, 3, 3, 14, 5, 'Full race aero kit.'),
('Elite Aero', 'aerodynamics', 4, 200000, 6, 5, 5, 22, 10, 'CFD-optimized minimal drag setup.'),
('Base Brakes', 'brakes', 1, 6000, 0, 2, 2, 0, 0, 'Factory spec braking system.'),
('Sport Brakes', 'brakes', 2, 18000, 0, 4, 4, 0, 5, 'Upgraded rotors and pads.'),
('Competition Brakes', 'brakes', 3, 55000, 1, 8, 7, 0, 15, 'Lightweight carbon-ceramic brakes.'),
('Elite Brakes', 'brakes', 4, 140000, 2, 12, 11, 0, 25, 'Maximum fade resistance.'),
('Base Transmission', 'transmission', 1, 12000, 2, 1, 2, 0, 0, 'Factory standard transmission.'),
('Sport Transmission', 'transmission', 2, 35000, 4, 2, 4, 0, 0, 'Tighter ratios for acceleration.'),
('Competition Transmission', 'transmission', 3, 90000, 8, 4, 7, 0, 5, 'Purpose-built racing gearbox.'),
('Elite Transmission', 'transmission', 4, 220000, 11, 6, 11, 0, 10, 'Lightning-fast sequential shifting.'),
('Base Safety', 'safety', 1, 4000, 0, 0, 3, 0, 0, 'Minimum required safety equipment.'),
('Sport Safety', 'safety', 2, 12000, 0, 0, 6, 0, -5, 'Stronger cage with extra bars.'),
('Competition Safety', 'safety', 3, 35000, 0, 0, 10, 0, -10, 'Complete safety system.'),
('Elite Safety', 'safety', 4, 80000, 0, 1, 14, 0, -5, 'Top safety with composite materials.'),
('Base Electronics', 'electronics', 1, 8000, 1, 1, 1, 0, 0, 'Standard engine control unit.'),
('Sport Electronics', 'electronics', 2, 22000, 3, 2, 2, 1, 0, 'Remapped ECU for optimization.'),
('Competition Electronics', 'electronics', 3, 60000, 5, 4, 3, 2, 0, 'Full telemetry and management.'),
('Elite Electronics', 'electronics', 4, 150000, 8, 6, 5, 3, 0, 'Championship-level electronics.');

-- Verify
SELECT 'NASCAR Manager 2026 Multi-Series Database Initialized' as status;
SELECT s.short_name as series, COUNT(t.id) as teams FROM series s LEFT JOIN teams t ON t.series_id = s.id GROUP BY s.short_name, s.tier ORDER BY s.tier;
SELECT COUNT(*) as total_drivers FROM drivers;
SELECT COUNT(*) as total_races FROM races;
SELECT COUNT(*) as store_items FROM store_items;
