import "reflect-metadata";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());

// Routes
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Teams endpoint
app.get("/api/teams", async (req: Request, res: Response) => {
  try {
    // TODO: Replace with actual database query
    // For now, return mock data
    const teams = [
      {
        id: 1,
        name: 'Dream Chasers Racing',
        founded_year: 2025,
        base_city: 'Concord, NC',
        budget: 1000000,
        reputation: 1,
        garage_rating: 3,
        headquarters: 'Concord, NC'
      },
      {
        id: 2,
        name: 'Last Chance Motors',
        founded_year: 2025,
        base_city: 'Charlotte, NC',
        budget: 1500000,
        reputation: 2,
        garage_rating: 5,
        headquarters: 'Charlotte, NC'
      },
      {
        id: 3,
        name: 'Velocity Racing',
        founded_year: 1995,
        base_city: 'Charlotte, NC',
        budget: 25000000,
        reputation: 95,
        garage_rating: 95,
        headquarters: 'Charlotte, NC'
      }
    ];
    res.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

app.listen(PORT, () => {
  console.log(`🏁 NASCAR Manager Server running on port ${PORT}`);
  console.log(`📍 API URL: http://localhost:${PORT}`);
});
