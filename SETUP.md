# Project Setup

This project has been scaffolded with the following structure:

- **Backend**: Node.js + Express + TypeScript
- **Frontend**: React + TypeScript + Vite
- **Database**: PostgreSQL

## Completed Setup Steps

✅ Project structure created
✅ Database schema with all NASCAR game entities
✅ Seed data for 2026 Cup Series (34 teams, fictional names)
✅ Backend scaffold with Express server
✅ Frontend scaffold with React app
✅ Type definitions for game entities
✅ API client setup

## Next Steps

### 1. Install PostgreSQL
```bash
# Windows: Download from https://www.postgresql.org/download/windows/
# Or use: choco install postgresql
```

### 2. Initialize Database
```bash
cd database
# On Windows in PowerShell:
psql -U postgres -f schema.sql
psql -U postgres -f seed_data.sql
```

### 3. Install Backend Dependencies
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### 4. Install Frontend Dependencies
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### 5. Access Your Game
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Health check: http://localhost:3000/api/health

## Project Structure Overview

**Backend** handles:
- REST API endpoints for all game entities
- Race simulation algorithms
- Career progression logic
- Data persistence with TypeORM

**Frontend** handles:
- UI for team management
- Race calendar and results
- Career progression display
- Real-time game state

**Database** contains:
- 34 teams with varying budgets/reputation
- 68 drivers (2 per team)
- 36 races for 2026 Cup Series
- Crew chiefs, spotters, pit crews
- All staff and vehicle performance data

## Game Data (Fictional Names)

The database is pre-populated with:
- **34 NASCAR Cup Series Teams** with different budgets (ranging from $1M to $25M)
- **68 Drivers** with varied skill ratings
- **36-Race Season** schedule
- **Supporting Staff** (crew chiefs, spotters, pit crews)

All teams and drivers use fictional names to avoid copyright issues, but maintain structure identical to real NASCAR.

## Architecture Overview

The game uses a modular system where:

1. **Career System** tracks player progression (which team, season, wins, championships)
2. **Team Management** handles budgets, staff, car development
3. **Race Simulation** uses algorithms to determine race outcomes
4. **Data Models** separate by entity type (teams, drivers, races, etc.)

Ready to start building career mode and race simulations!
