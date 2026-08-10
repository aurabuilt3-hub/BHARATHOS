# BharatOS FastAPI Backend Platform

This is the asynchronous, AI-powered municipal command-center & digital-twin backend api platform supporting **BharatOS**.

---

## Prerequisites
- Python 3.10+
- PostgreSQL / Supabase
- Node / npm (for frontend development)

---

## Project Structure
```bash
backend/
├── alembic/                    # Database schema migrations
├── app/
│   ├── main.py                 # FastAPI application root entry
│   ├── core/
│   │   ├── config.py           # Central config settings
│   │   ├── logging.py          # Structured app logging
│   │   └── security.py         # Security utilities
│   ├── db/
│   │   ├── base.py
│   │   └── session.py          # Database engines & sessions
│   ├── api/
│   │   └── v1/
│   │       ├── router.py       # Mounting core routers
│   │       └── health.py       # Health checks and readiness endpoints
│   ├── models/                 # SQLAlchemy schemas
│   ├── schemas/                # Pydantic schemas
│   ├── services/               # Business service logic
│   ├── realtime/               # Realtime WS connection orchestration
│   └── simulation/             # IoT simulation loops
├── tests/                      # Unit testing suites
├── requirements.txt            # System dependencies
└── .env.example                # Sample environment configurations
```

---

## Installation & Setup

1. **Activate Virtual Environment**:
   ```bash
   .\venv\Scripts\Activate.ps1
   ```

2. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   pip install pytest
   ```

3. **Configure Environment**:
   Copy `.env.example` to `.env` and configure your credentials:
   ```bash
   cp .env.example .env
   ```

4. **Run Database Migrations**:
   Generate and apply Alembic migrations to align your local database to the current schema:
   ```bash
   alembic upgrade head
   ```

5. **Seed the Database**:
   Populate your local database with idempotent mock datasets (Andhra Pradesh, Visakhapatnam, nodes, resources, telemetry):
   ```bash
   $env:PYTHONPATH="."
   python app/db/seed.py
   ```

---

## Running the Application

1. **Start the API server locally**:
   ```bash
   uvicorn app.main:app --reload
   ```
2. **Access local Swagger documentation**:
   Open [http://localhost:8000/docs](http://localhost:8000/docs) in your browser.

---

## Health Check & Monitoring Endpoints

- **Liveness Endpoint**:
  `GET /api/v1/health`
  - **Returns**: HTTP 200 `{"status": "ok", "service": "BHARATOS Backend", "version": "1.0.0"}`
- **Readiness Endpoint**:
  `GET /api/v1/health/ready`
  - **Returns**: HTTP 200 `{"status": "ready", "database": "connected"}` or HTTP 503 if the database is unreachable.

---

## Running Test Suite
Execute tests with pytest:
```bash
pytest
```
