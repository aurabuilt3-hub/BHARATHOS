# Deployment Guide

# BharatOS - Local Development & Production Deployment

---

# Overview

This guide explains how to configure, run, and deploy the BharatOS platform locally and in cloud environments.

---

# Environment Architecture

```
   [Vercel: Next.js Frontend]
              │
              ▼ (HTTPS / WSS calls)
   [Render: FastAPI Backend Service]
              │
   ┌──────────┴──────────┐
   ▼                     ▼
[Supabase: Postgres]  [Google AI Studio: Gemini 2.5 Pro]
```

---

# System Requirements

- **Node.js**: v22.0.0+
- **Python**: v3.12.0+
- **Git**
- **Supabase CLI** (optional, for local schema management)

---

# Setup & Installation

### 1. Clone the repository
```bash
git clone https://github.com/your-org/bharatos.git
cd bharatos
```

### 2. Database Migration (Supabase Setup)
1. Sign up on [Supabase](https://supabase.com) and create a project.
2. Under SQL Editor, run the schema file located at `database/schema/` to deploy the tables (including `states`, `districts`, `incident_assignments`, etc.).
3. Enable **Realtime** replication for the tables:
   ```sql
   alter publication supabase_realtime add table incidents, notifications, sensor_data, ai_recommendations, vehicle_tracking;
   ```
4. Create the required file storage buckets under the **Storage** panel:
   - `incident-images`
   - `reports`
   - `documents`
   - `avatars`
5. Configure RLS Policies under the **Auth** panel to secure table rows.

### 3. Backend Service Setup (FastAPI)
```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
```
Update `.env` fields:
```
DATABASE_URL=postgresql://postgres.your-ref-id:password@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1Ni...
JWT_SECRET=super_secret_jwt_sign_key
GEMINI_API_KEY=AIzaSy...
WEATHER_API_URL=https://api.open-meteo.com/v1
```
Launch local backend:
```bash
uvicorn main:app --reload
```
API runs on `http://localhost:8000`. Test endpoints at `http://localhost:8000/docs` (Swagger Panel).

### 4. Frontend Client Setup (Next.js)
```bash
cd ../frontend
npm install
cp .env.example .env.local
```
Update `.env.local` fields:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-ref-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1Ni...
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```
Launch client:
```bash
npm run dev
```
Client runs on `http://localhost:3000`.

---

# Cloud Deployment Workflows

## Frontend Deployment (Vercel)
1. Go to Vercel and import your GitHub repository.
2. Select `frontend` as the **Root Directory**.
3. Set the Framework Preset to **Next.js**.
4. Configure Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_API_URL` (URL of your Render backend API)
5. Click **Deploy**.

## Backend Deployment (Render)
1. Create a new **Web Service** on Render.
2. Select your GitHub repository and set the root directory to `backend`.
3. Set the build parameters:
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add the Environment Variables:
   - `DATABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `JWT_SECRET`
   - `GEMINI_API_KEY`
5. Click **Deploy**.

*Tip*: To avoid cold start delays (which freeze requests for 50s on Render's free tier), configure an uptime heartbeat monitoring service (e.g. UptimeRobot) to ping `/api/v1/health` every 10 minutes.
