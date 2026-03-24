# NASCAR Manager Game - Development Instructions

This is a web-based NASCAR Cup Series team management game built with React, Node.js/Express, and PostgreSQL.

## Project Overview

**Scope**: 2026 NASCAR Cup Series (36 races, 34 teams)
**Core Mechanic**: Team Owner Career Mode - start at low-tier team, build up, or jump to better offers
**Architecture**: Full-stack TypeScript (frontend + backend)
**Moddable**: JSON-based data loading for future customization

## Quick Start

1. **Setup Database**: Install PostgreSQL, then run `schema.sql` and `seed_data.sql`
2. **Backend**: `cd backend && npm install && npm run dev` 
3. **Frontend**: `cd frontend && npm install && npm run dev`
4. **Access**: http://localhost:5173

See the SETUP.md file in the project root for detailed installation.

## Key Systems to Build

### 1. Career Mode Foundation
- [ ] Career creation UI (select starting team from 34 available)
- [ ] Career save/load system
- [ ] Team roster display
- [ ] Budget tracking

### 2. Race Simulation Engine
- [ ] Algorithm: Driver skill + car performance + reliability + pit crew
- [ ] Qualifying simulation
- [ ] Race outcome determination
- [ ] Results display

### 3. Team Management UI
- [ ] Dashboard showing team stats/budget
- [ ] Driver/staff roster management
- [ ] Car setup options
- [ ] Race strategy decisions

### 4. Calendar & Results
- [ ] Race calendar display
- [ ] Pre-race decisions (car setup, pit strategy)
- [ ] Race simulation trigger
- [ ] Results and standings

### 5. Career Progression
- [ ] Improve team performance metrics
- [ ] Unlock better team offers
- [ ] Track championship progression
- [ ] Season progression to next year

## Database Schema Highlights

**34 Teams** with fictional names, ranging from:
- Tier 1 (Velocity Racing): $25M budget, 95 reputation
- Tier 3 (Bottom-tier): $1M budget, 1 reputation

**68 Drivers** with skill ratings for:
- Overall skill
- Consistency
- Racecraft

**Full Staff Structure**:
- Crew Chiefs (strategy, setup)
- Spotters (awareness, communication)
- Pit Crews (speed, accuracy)

**Race Infrastructure**:
- 36 races mapped to real tracks
- Qualifying & race result tracking

## Code Organization

```
backend/src/
  ├── models/        (TypeORM entities - teams, drivers, etc.)
  ├── services/      (Business logic - race sim, career progression)
  ├── controllers/   (API request handlers)
  ├── routes/        (API endpoints)
  └── middleware/    (Auth, validation, etc.)

frontend/src/
  ├── types/         (TypeScript interfaces)
  ├── pages/         (Main menu, career select, dashboard)
  ├── components/    (Reusable UI components)
  ├── services/      (API client calls)
  ├── hooks/         (Custom React hooks)
  └── App.tsx        (Main router)
```

## Development Notes

- **Fictional Names**: All team/driver names are fictional to avoid copyright
- **Modding Ready**: Design expects JSON import system (add when core features ready)
- **TypeScript**: Strict mode enabled for type safety
- **Database**: PostgreSQL with comprehensive schema, includes indexes for common queries

## Next Priority

Start with career creation UI + basic team selection. Then build race simulation core logic so we have something playable quickly.
