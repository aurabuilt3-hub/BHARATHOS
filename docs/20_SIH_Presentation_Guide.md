# Smart India Hackathon Presentation Guide

# BharatOS - AI Powered Multi-Agent Digital Twin Platform

---

# Presentation Duration

- **Speaking time**: 10–12 Minutes
- **Q&A session**: 5 Minutes

---

# Speaking Order & Roles

- **Member 1 (Product Lead)**: Introduce team, Vision, Problem Statement, and socio-economic impact. (2 Mins)
- **Member 2 (Frontend Lead)**: Present Digital Twin interface, OSM/Leaflet overlays, and District Dashboard controls. (2 Mins)
- **Member 3 (AI Architect)**: Explain multi-agent Graph (LangGraph), Gemini 2.5 Pro reasoning logic, pgvector RAG grounding, and MCP tools. (2 Mins)
- **Member 4 (Technical Lead)**: Perform live demo walkthrough (Citizen reporting flood incident, AI recommendations, Department Head sign-off). (3 Mins)
- **Member 5 (Backend Lead)**: Outline database tables structure, WebSockets realtime updates, hosting setup, and future scope. (2 Mins)

---

# Slides Sequence

1. **Title Slide**: BharatOS logo, team details, and tagline: *"One AI Platform. One Digital Twin. Smarter Governance for Every City."*
2. **The Problem**: Fragmented city departments, manual coordination bottlenecks, reactive operations, and slow emergency dispatches.
3. **The Solution**: Centralized Command Center integrating Digital Twin visual maps and multi-agent AI decision planners.
4. **Platform Hierarchy**: Detail scaling path: `India → State → District → City → Zone → Ward`.
5. **AI Architecture**: Present LangGraph Coordinator and the 6 specialized domain agents. Emphasize human-in-the-loop approvals.
6. **Tech Stack**: Next.js 15, FastAPI, Supabase Postgres (`pgvector`), Gemini 2.5 Pro, Leaflet, and WebSockets.
7. **Live Demo Walkthrough**: Standard demo scenario path.
8. **Scalability & Future Scope**: Connecting real IoT networks, CCTV analytics, and drone imaging feeds.
9. **Impact**: Reduced dispatch latencies and citizen trust metrics.

---

# Live Demo Script

1. **National command center**: Start on the national map, choose Andhra Pradesh.
2. **District Dashboard**: Select Visakhapatnam District to view consolidated charts.
3. **Visakhapatnam Digital Twin**: Transition to Leaflet map rendering live sensors and station coordinates.
4. **Citizen Triage**: Citizen uploads flood/pothole image. Show Citizen Agent parsing language and classifying the ticket into the standardized categories.
5. **Coordinator execution**: Show Coordinator Agent triggering sub-agents in parallel and writing a draft recommendation plan citing SOP guidelines.
6. **Department Head Sign-off**: Department Head opens approvals widget, modifies detail, and clicks "Approve."
7. **Realtime Dispatch**: Show ambulance vehicle moving on the map and citizen timeline updates in realtime via WebSockets.
