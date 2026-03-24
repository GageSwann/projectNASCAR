# NASCAR Manager - Team Owner Career Simulator

A web-based NASCAR Cup Series team management game where you build and manage your racing empire from the ground up.

## Overview

Start as team owner of a struggling lower-tier team and climb the ranks of NASCAR. Manage drivers, crew chiefs, spotters, pit crews, vehicle development, sponsorships, and strategy to compete for championships.

**Features:**
- Full 36-race Cup Series season
- Realistic race simulation engine
- Deep team management mechanics
- Career progression system
- Mod-friendly architecture with JSON data loading

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL
- **Future**: Electron for Steam release

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 15+

### Installation

1. **Setup Database**
   ```bash
   cd database
   psql -U postgres -f schema.sql
   psql -U postgres -f seed_data.sql
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the game**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:3000`

## Project Structure

```
projectNASCAR/
├── backend/               # Express server, API routes, business logic
│   ├── src/
│   │   ├── routes/       # API endpoints
│   │   ├── models/       # TypeORM entities
│   │   ├── services/     # Business logic
│   │   ├── controllers/  # Request handlers
│   │   └── middleware/   # Auth, validation, etc.
│   ├── package.json
│   └── tsconfig.json
├── frontend/             # React application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── services/    # API client services
│   │   ├── types/       # TypeScript types
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
└── database/             # Database schema and seed data
    ├── schema.sql       # PostgreSQL table definitions
    └── seed_data.sql    # Initial game data (2026 Cup Series)
```

## Game Architecture

### Core Systems

1. **Race Simulation** - Probabilistic simulation using driver skill, car reliability, pit crew performance
2. **Team Management** - Budget, staff hiring, car setups, strategy decisions
3. **Career Progression** - Improve team, unlock offers, climb to better teams
4. **Modding System** - JSON import for custom teams, drivers, sponsors

### Data Model

- **Teams**: Organization with budget, reputation, garage
- **Drivers**: Skill ratings, contract, performance stats
- **Crew Chiefs, Spotters, Pit Crews**: Specialized staff with performance modifiers
- **Cars**: Performance stats, reliability, setup options
- **Races**: Track info, qualifying results, race results
- **Seasons**: Campaign structure, progression tracking

## Development Roadmap

- [x] Project structure and database schema
- [x] 2026 Cup Series base data (fictional names)
- [ ] Backend API scaffolding
- [ ] Career mode starting system
- [ ] Team management UI
- [ ] Race simulation engine
- [ ] Race calendar and results UI
- [ ] JSON modding system
- [ ] Advanced management features (sponsor system, driver training, etc.)
- [ ] Electron/Steam integration

## Contributing

Details on modding and extending the game coming soon.

## License

TBD
