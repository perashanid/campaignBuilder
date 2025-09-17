#!/bin/bash

# Render build script for Node.js TypeScript project
set -e

echo "🔄 Installing dependencies..."
npm ci

echo "🔄 Building TypeScript project..."
npx tsc

echo "🔄 Running database migrations..."
npm run db:migrate:prod

echo "✅ Build completed successfully!"