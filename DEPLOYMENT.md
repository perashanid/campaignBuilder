# Deployment Guide

## Production Environment Variables

### Backend (Render Service)
- `DATABASE_URL`: PostgreSQL connection string
- `NODE_ENV`: production
- `CORS_ORIGINS`: https://campaignbuilder-onrender.com
- `JWT_SECRET`: Secure random string

### Frontend (Render Static Site)
- `VITE_API_URL`: https://campaignbuilder-backend.onrender.com
- `VITE_ENVIRONMENT`: production

## Deployment Steps

### Backend Deployment
1. Environment variables are already configured in Render
2. Build script (`render-build.sh`) handles:
   - Installing dependencies
   - Building TypeScript
   - Running database migrations
3. Server starts with `npm start`

### Frontend Deployment
1. Build command: `npm run build:production`
2. Publish directory: `dist`
3. Environment variables set in Render dashboard

## Local Development
1. Run `npm run dev` to start both frontend and backend
2. Frontend: http://localhost:3000
3. Backend: http://localhost:3001
4. Uses Vite proxy for API calls in development

## Database
- Production: PostgreSQL on Render
- Migrations run automatically during deployment
- Sample data can be seeded with `npm run db:seed:prod`

## CORS Configuration
- Development: localhost:3000, localhost:5173
- Production: https://campaignbuilder-onrender.com