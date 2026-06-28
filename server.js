import express from "express";
import pg from "pg";
import { createClient } from "redis";
import "dotenv/config"; 

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());


const db = new pg.Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432, 
});

const redis = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379"
});

try {
  await redis.connect();
} catch (err) {
  console.error("Redis connection failed:", err);
}

app.get("/:id", async (req, res) => {
  const { id } = req.params;
  
  try {
    const pgStart = process.hrtime.bigint();
    const pgRes = await db.query("SELECT * FROM users WHERE id=$1", [id]);
    const pgEnd = process.hrtime.bigint();

    const redisStart = process.hrtime.bigint();
    const redisVal = await redis.get(`user:${id}`);
    const redisEnd = process.hrtime.bigint();

    const pgTime = Number(pgEnd - pgStart) / 1e6;
    const redisTime = Number(redisEnd - redisStart) / 1e6;

    res.json({
      pgData: pgRes.rows[0],
      redisData: redisVal ? JSON.parse(redisVal) : null, 
      pgTimeMs: pgTime.toFixed(3),
      redisTimeMs: redisTime.toFixed(3),
      diffMs: (pgTime - redisTime).toFixed(3)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});