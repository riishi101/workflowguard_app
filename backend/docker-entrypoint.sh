#!/bin/sh
set -e

echo "Starting WorkflowGuard Backend..."

# Wait for database to be ready
echo "Waiting for database connection..."
until npx prisma db push --accept-data-loss --skip-generate; do
  echo "Database is unavailable - sleeping"
  sleep 2
done

echo "Database is ready!"

# Start the application
echo "Starting NestJS application..."
exec node --max-old-space-size=400 dist/main.js
