# Postgres vs Redis Benchmark

This project is a lightweight Node.js service designed to benchmark read performance differences between a relational database (PostgreSQL) and an in-memory key-value store (Redis). It provides a single API endpoint that fetches data from both databases and compares their response times in milliseconds.

## Prerequisites

- Node.js (v14+ recommended)
- PostgreSQL running locally
- Redis running locally

## Setup

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the root directory and configure your environment variables:
   ```env
   DB_USER=postgres
   DB_HOST=localhost
   DB_NAME=your_db_name
   DB_PASSWORD=your_db_password
   DB_PORT=5432
   REDIS_URL=redis://localhost:6379
   PORT=3000
   ```

3. Ensure your PostgreSQL instance has the required `users` table created:
   ```sql
   CREATE TABLE users (
     id INT PRIMARY KEY,
     name TEXT
   );
   ```

4. Seed the databases. The provided script will insert 10,000 records into both PostgreSQL and Redis for benchmarking:
   ```bash
   node seed.js
   ```

## Running the Benchmark

Start the Express server:
```bash
node server.js
```

Make a GET request to the endpoint using a user ID (from 1 to 10000) via your browser or curl:
```bash
curl http://localhost:3000/150
```

## Example Response

The API returns the data fetched from both sources along with the execution times for comparison.

```json
{
  "pgData": {
    "id": 150,
    "name": "TestUser_150"
  },
  "redisData": {
    "id": 150,
    "name": "TestUser_150"
  },
  "pgTimeMs": "1.450",
  "redisTimeMs": "0.215",
  "diffMs": "1.235"
}
```