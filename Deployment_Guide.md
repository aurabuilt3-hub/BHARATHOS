# Deployment Guide

# BharatOS - Local Development & Production Deployment

---

# Overview

This guide explains how to set up, configure, run, and deploy BharatOS.

The deployment strategy is designed to be simple for development while remaining scalable for production.

---

# Architecture

```
Frontend (Next.js)
        │
        ▼
FastAPI Backend
        │
        ▼
Supabase PostgreSQL
        │
        ▼
Gemini AI
        │
        ▼
External APIs
```

---

# Requirements

Install:

- Node.js 22+
- Python 3.12+
- Git
- VS Code
- Docker (Optional)

Accounts:

- GitHub
- Supabase
- Vercel
- Render
- Google AI Studio (Gemini)

---

# Clone Repository

```bash
git clone https://github.com/your-org/bharatos.git
cd bharatos
```

---

# Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Runs on:

```
http://localhost:3000
```

---

# Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload
```

Runs on:

```
http://localhost:8000
```

Swagger:

```
http://localhost:8000/docs
```

---

# AI Setup

Configure:

- Gemini API Key
- MCP tools
- RAG knowledge base

Verify:

- Chat
- Vision
- Recommendations
- Report generation

---

# Supabase Setup

Create project.

Enable:

- Authentication
- PostgreSQL
- Storage
- Realtime

Create buckets:

- incident-images
- reports
- documents
- avatars

Run database migrations before starting the backend.

---

# Environment Variables

Frontend

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_API_URL=
```

Backend

```
DATABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
JWT_SECRET=
GEMINI_API_KEY=
WEATHER_API_URL=
```

Never commit secrets to the repository.

---

# Maps

Use:

- OpenStreetMap
- Leaflet
- Nominatim (geocoding)

The prototype should default to Visakhapatnam while allowing navigation to summary views for other cities.

---

# Simulated Data

Run helper scripts to populate:

- Sample users
- Incidents
- Hospitals
- Weather
- Sensor data

These datasets power the SIH demo.

---

# Deployment

## Frontend

Platform

Vercel

Steps

- Connect GitHub
- Import frontend project
- Configure environment variables
- Deploy

---

## Backend

Platform

Render

Steps

- Connect GitHub
- Configure Python service
- Add environment variables
- Deploy

---

## Database

Platform

Supabase

Responsibilities

- PostgreSQL
- Authentication
- Storage
- Realtime

---

# CI/CD

Suggested workflow

```
Push to GitHub

↓

Run Tests

↓

Build Frontend

↓

Build Backend

↓

Deploy
```

---

# Monitoring

Monitor:

- API health
- Database status
- AI service availability
- Realtime connection
- Error logs

---

# Backup

Maintain:

- Database backups
- Storage backups
- Configuration backups

Regular backups help protect demo data and project assets.

---

# Security Checklist

- HTTPS enabled
- JWT authentication
- Row-Level Security
- Environment variables configured
- API validation enabled
- Rate limiting (optional)
- Audit logging enabled

---

# Demo Readiness Checklist

Before the SIH presentation:

- Frontend loads successfully
- Backend APIs respond
- Authentication works
- AI recommendations generate
- Incident workflow completes
- Dashboard updates in real time
- Demo data is populated
- Backup screenshots and video are available

---

# Troubleshooting

Common issues:

- Invalid environment variables
- Supabase connection failures
- Missing API keys
- CORS configuration
- Realtime synchronization delays

Document fixes in the project wiki for future contributors.

---

# Summary

BharatOS is deployed using a cloud-native architecture with Next.js on Vercel, FastAPI on Render, and Supabase as the backend platform. The deployment process emphasizes reproducibility, security, and a reliable SIH demonstration environment.