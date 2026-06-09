#!/bin/sh

# Ensure data directory exists
mkdir -p /app/data

# Run database push (creates tables if they don't exist)
npx prisma db push --accept-data-loss

# Seed only if database is empty
COUNT=$(sqlite3 /app/data/promptwiki.db "SELECT COUNT(*) FROM Prompt;" 2>/dev/null || echo "0")
if [ "$COUNT" = "0" ]; then
  echo "Seeding database..."
  npx tsx prisma/seed.ts
else
  echo "Database already has $COUNT prompts. Skipping seed."
fi

# Start the standalone Next.js server on 0.0.0.0:3000
export HOSTNAME=0.0.0.0
export PORT=3000
exec node server.js
