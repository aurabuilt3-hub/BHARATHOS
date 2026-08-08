# 🇮🇳 BharatOS: AI-Powered Multi-Agent Digital Twin & Smart Municipal Platform

**Smart India Hackathon (SIH) Production Submission**

BharatOS is an enterprise-grade AI Government Operations Command Center and Digital Twin decision-support platform designed to transform urban municipal response. Powered by **Gemini 2.5 Pro**, **LangGraph**, **Model Context Protocol (MCP)**, **pgvector RAG**, **Leaflet GIS**, and **Real-time WebSockets**, BharatOS unifies city telemetry, automates multi-agent disaster triage, and provides executive decision support with mandatory human-in-the-loop approval guarantees.

---

## 🏛️ System Architecture

```
                                  [ Citizen Mobile / Web App ]
                                                │
                                                ▼
                                    [ Supabase Auth & Storage ]
                                                │
                                                ▼
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                   FastAPI Backend App                                  │
  │                                                                                        │
  │   ┌─────────────────────┐    ┌─────────────────────┐    ┌──────────────────────────┐   │
  │   │  API Controllers    │    │   Services Layer    │    │    Repositories Layer    │   │
  │   │   (/api/v1/*)       │ ──►│   (Business Rules)  │ ──►│   (SQLAlchemy 2.0 ORM)   │   │
  │   └─────────────────────┘    └─────────────────────┘    └──────────────────────────┘   │
  │                                                                       │                │
  │   ┌───────────────────────────────────────────────────────────────────┼──────────────┐ │
  │   │                    AI Gateway & Multi-Agent Engine                ▼              │ │
  │   │                                                          [ Supabase PostgreSQL ] │ │
  │   │  ┌─────────────────┐     ┌────────────────────────────────┐       (pgvector)     │ │
  │   │  │ LangGraph Graph │ ──► │  Gemini 2.5 Pro Sub-Agents     │                      │ │
  │   │  └─────────────────┘     │  (Citizen, Weather, Traffic,   │                      │ │
  │   │                          │   Healthcare, Emergency,      │                      │ │
  │   │                          │   Analytics, Coordinator)     │                      │ │
  │   │                          └────────────────────────────────┘                      │ │
  │   │                                          │                                       │ │
  │   │                                          ▼                                       │ │
  │   │                          [ MCP Tools & pgvector RAG ]                            │ │
  │   └──────────────────────────────────────────────────────────────────────────────────┘ │
  │                                              │                                         │
  │   ┌──────────────────────────────────────────┴───────────────────────────────────────┐ │
  │   │                      Realtime WebSockets & IoT Simulation                        │ │
  │   │                   (/ws/dashboard, /ws/sensors, /ws/notifications)                │ │
  │   └──────────────────────────────────────────┬───────────────────────────────────────┘ │
  └──────────────────────────────────────────────┼─────────────────────────────────────────┘
                                                 │
                                                 ▼
                             [ Next.js 16 Executive Command Center ]
                         (Digital Twin, Spatial Map, Analytics, Activity Feed)
```

---

## 🚀 Key Features

1. **Digital Twin Spatial Map**: 2D/3D Leaflet GIS workspace mapping Visakhapatnam GeoJSON wards, IoT storm drain depth gauges, traffic corridors, hospitals, and hazard heatmaps.
2. **7-Agent AI System (Gemini 2.5 Pro + LangGraph)**:
   * **Citizen Agent**: Categorizes reports, extracts locations, predicts severity.
   * **Weather Agent**: Analyzes rainfall rates (78mm/24h) and river spillways.
   * **Traffic Agent**: Evaluates NH16/Beach Road bottlenecks and recommends bypass routes.
   * **Healthcare Agent**: Recommends nearest facilities (KGH) and available ICU beds.
   * **Emergency Agent**: Coordinates Fire tenders, Police patrol units, and pumps M-12.
   * **Analytics Agent**: Historical pattern matching against monsoonal trends.
   * **Coordinator Agent**: Synthesizes agent responses, attaches RAG citations, and marks status as `awaiting_human_approval`.
3. **Model Context Protocol (MCP) & pgvector RAG**: Agent tool-calling framework querying live telemetry feeds and vector-search NDMA disaster SOP manuals.
4. **Realtime WebSockets Streaming**: Asynchronous IoT simulation engine broadcasting depth readings every 4s, real-time activity streams, and notification alarms over auto-reconnecting WS clients.
5. **Strategic Analytics & Executive Dashboards**: Custom command views for **District Collector**, **Municipal Commissioner**, and **Disaster Management Authority** with PDF and CSV report export capabilities.
6. **One-Click Automated Demo Mode**: Automated `START DEMO` button triggering 4 SIH scenarios (Heavy Rain, Chemical Factory Fire, Cyclone Warning, Major Road Accident).

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Leaflet GIS, Recharts, Framer Motion |
| **Backend** | Python 3.11+, FastAPI, Pydantic v2, SQLAlchemy 2.0, Alembic, Uvicorn |
| **AI & Multi-Agent** | Gemini 2.5 Pro, LangGraph, Model Context Protocol (MCP), pgvector RAG |
| **Database & Auth** | Supabase PostgreSQL, Supabase Auth (JWT), Supabase Storage |
| **Realtime** | WebSockets, Asyncio, Custom Event Bus |

---

## 📂 Project Folder Structure

```
BharatOS/
├── backend/
│   ├── app/
│   │   ├── api/v1/          # REST & WebSocket Controllers (/api/v1/incidents, /ws/*)
│   │   ├── ai/              # Gemini 2.5 Pro & LangGraph Multi-Agent Engine
│   │   │   ├── agents/      # 7 Specialized Agent definitions
│   │   │   ├── gateway.py   # Central AI Gateway & Failure Recovery
│   │   │   ├── graph/       # LangGraph Orchestrator
│   │   │   ├── mcp/         # MCP Tools Registry
│   │   │   ├── rag/         # pgvector SOP Knowledge Retriever
│   │   │   └── prompts/v1/  # Versioned v1.0.0 Prompts
│   │   ├── core/            # Config, Security & Logging
│   │   ├── db/              # SQLAlchemy 2.0 Engine & Session
│   │   ├── models/          # SQLAlchemy ORM Models
│   │   ├── repositories/    # Isolated Database Query Layer
│   │   ├── services/        # Business Logic & Ticket Generator (INC-2026-XXXXXX)
│   │   ├── realtime/        # WebSockets Connection Manager, Event Bus, Metrics Tracker
│   │   └── simulation/      # IoT Water Depth & Weather Telemetry Engine
│   └── main.py              # Root FastAPI Launcher
├── database/
│   └── schema/              # PostgreSQL DDL Migrations (01_foundational, 02_incidents)
└── frontend/
    ├── app/
    │   ├── dashboard/       # Routed Views (/city, /digital-twin, /analytics, /executive, /national, /state)
    │   ├── login/           # Supabase Auth Login
    │   └── register/        # Supabase Auth Profile Sync
    ├── components/
    │   ├── layout/          # Dashboard & Layout System Primitives
    │   ├── navigation/      # Header, Sidebar, GlobalSearch (Cmd+K), NotificationCenter, RightAIPanel
    │   ├── ui/              # StatCard, ChartCard, MapContainer, MetricBadge, EmptyStates
    │   └── widgets/         # Weather, Traffic, Resource, Sensor, AISummary, ActivityFeed, DemoModeController
    ├── lib/
    │   ├── digitalTwin/     # Spatial LayerManager, MarkerManager, GeoJsonManager
    │   ├── mock/            # Typed Mock Data Modules (india, states, cities, incidents, weather, etc.)
    │   ├── analytics/       # Single-Responsibility KPI, Forecast, Trend & Risk Engines
    │   └── demoEngine.ts    # Automated Demo Sequence Controller
    └── services/            # API & Auto-Reconnecting WebSocket HTTP Clients
```

---

## ⚡ Quick Start & Local Setup

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
pip install -r requirements.txt
python main.py
```
*Backend API documentation available at `http://localhost:8000/docs`.*

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*Open `http://localhost:3000` in your browser.*

---

## 🎬 Smart India Hackathon (SIH) 5-7 Minute Judge Presentation Script

### Minute 1: Problem Statement & Vision
> *"Respected Judges, urban disaster response in Indian cities suffers from fragmented agency siloes. When heavy monsoonal rain causes coastal flooding, traffic police, municipal engineers, and emergency health services operate blindly without unified spatial telemetry. We present **BharatOS**: India's AI-Powered Multi-Agent Digital Twin & Smart Command Center."*

### Minute 2: Demonstration of Digital Twin & IoT Telemetry
> *"Let us look at our live Visakhapatnam Command Center on screen. Notice how our IoT telemetry engine streams depth readings every 4 seconds over WebSockets. As Ward 12 storm drain depth reaches 4.2 meters, the spatial Leaflet Digital Twin dynamically highlights the coastal hazard polygon and triggers instant warning badges without refreshing the page."*

### Minute 3: Multi-Agent AI System (Gemini 2.5 Pro + LangGraph)
> *"When a citizen reports waterlogging on Beach Road, our **Gemini 2.5 Pro LangGraph Orchestrator** initiates 7 specialized AI agents: Citizen, Weather, Traffic, Healthcare, Emergency, Analytics, and Coordinator. Notice how the Coordinator agent queries our pgvector RAG database to cite NDMA Coastal SOP manuals and computes a 94.2% confidence recommendation."*

### Minute 4: Mandatory Human-in-the-Loop Safety Guarantee
> *"Critically, BharatOS enforces strict AI safety: our AI system **never** dispatches resources automatically. As highlighted by our prominent UI badge, **Human Approval is Mandatory**. Senior officials review the reasoning, telemetry evidence, and sign off with a single click."*

### Minute 5: Executive Dashboards & Scenario Simulator
> *"For senior leadership, we provide tailored Executive Dashboards for the **District Collector**, **Municipal Commissioner**, and **Disaster Management Authority**. Officials can trigger our **Scenario Simulator** to model Heavy Rain, Cyclones, Chemical Fires, or Road Accidents, and export instant PDF Executive Summaries or CSV datasets."*

### Minute 6-7: Conclusion, Scalability & Social Impact
> *"BharatOS is built using modern production technologies: Next.js 16, FastAPI, Supabase PostgreSQL, and Gemini 2.5 Pro. It scales horizontally from city wards to state and national command centers. Thank you!"*

---

## 🌐 Production Deployment Guide

* **Frontend**: Deployed on **Vercel** (`npm run build`).
* **Backend**: Deployed on **Render** / **AWS ECS** (`uvicorn app.main:app --host 0.0.0.0 --port 8000`).
* **Database**: Hosted on **Supabase PostgreSQL** with `pgvector` enabled.

---

## 📜 License & Acknowledgments
Built for the **Smart India Hackathon (SIH)**. Developed under open-source software licenses.