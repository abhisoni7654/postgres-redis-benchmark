import pg from "pg";
import { createClient } from "redis";
import "dotenv/config";

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

async function seedData() {
  try {
    await redis.connect();
    console.log("Connected to databases. Starting to seed 10,000 records...");

    for (let i = 1; i <= 10000; i++) {
      const uName = `TestUser_${i}`;
      
      // Insert in PostgreSQL
      await db.query(
        "INSERT INTO users (id, name) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING", 
        [i, uName]
      );

      // Insert in Redis
      await redis.set(`user:${i}`, JSON.stringify({ id: i, name: uName }));

      
      if (i % 2000 === 0) {
        console.log(`Successfully seeded ${i} records...`);
      }
    }

    console.log("Seeding complete! You can now run your benchmarks.");
  } catch (err) {
    console.error("Error during seeding:", err);
  } finally {
    await db.end();
    await redis.quit();
  }
}

seedData();