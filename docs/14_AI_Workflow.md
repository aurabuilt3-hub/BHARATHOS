# AI Workflow

# BharatOS - AI Intelligence & Agent Orchestration

---

# Overview

The BharatOS AI Engine is responsible for understanding incidents, coordinating specialized AI agents, generating explainable recommendations, and assisting government officials in making informed decisions.

Instead of relying on a single monolithic prompt, BharatOS implements a **Stateful Multi-Agent Orchestration** built with **LangGraph** running **Gemini 2.5 Pro**.

---

# Execution Diagram

```
                    Incident Created (FastAPI POST)
                                  │
                                  ▼
                         Coordinator Agent
                                  │
         ┌────────────────────────┼────────────────────────┐
         ▼ (Parallel Exec)        ▼ (Parallel Exec)        ▼ (Parallel Exec)
   Weather Agent            Traffic Agent            Emergency Agent
   - Ingest weather APIs    - Calculate routes       - Estimate severity
   - Compute flood risk     - Plan diversions        - Check resource lists
         │                        │                        │
         └────────────────────────┼────────────────────────┘
                                  ▼
                          Healthcare Agent
                          - Search hospitals & beds
                          - Check ambulance coordinates
                                  │
                                  ▼
                          Coordinator Agent
                          - Formulate JSON action plan
                          - Citation of RAG SOPs
                                  │
                                  ▼
                       Officer Dashboard Queue
                         (Pending Approval)
```

---

# Workflow Stages

### Stage 1: Incident Creation and Translation
1. Citizen reports an issue using text/image/voice.
2. The **Citizen Agent** receives the payload. It translates regional languages (Hindi, Telugu, Tamil, Kannada, Bengali) into English.
3. The image is processed via Gemini Vision and classified into one of the **10 Standardized Categories**:
   `Flood`, `Fire`, `Medical`, `Accident`, `Garbage`, `Water Leakage`, `Pothole`, `Street Light Failure`, `Fallen Tree`, `Infrastructure Damage`.
4. The ticket is committed to the Supabase database.

### Stage 2: Parallel Node Execution (LangGraph)
1. The **Coordinator Agent** reads the incident record and routes execution:
   - **Weather Agent**: Ingests coordinate telemetry to fetch local forecasts from Open-Meteo. It evaluates if rainfall index or river gauges exceed risk thresholds.
   - **Traffic Agent**: Connects to map routing APIs. If the incident blocks a street (e.g. an accident or flood), it maps diversion nodes.
   - **Emergency Agent**: Evaluates the severity based on category and proximity parameters to public assets.
2. These nodes execute concurrently to minimize API call latency.

### Stage 3: Asset Routing (Healthcare Agent)
1. If the incident includes casualties or medical requirements (e.g. `Medical` or `Accident` categories):
   - The **Healthcare Agent** is executed.
   - It queries `hospitals` bed counts and searches the `ambulances` table for units in `available` status.
   - It computes the nearest hospital using routing distance calculations.

### Stage 4: Recommendation Aggregation & Grounding (RAG)
1. The Coordinator receives all agent node outputs.
2. It queries the `knowledge_base` using pgvector cosine similarity search to retrieve NDMA SOP guidelines matching the category (e.g. Flood SOP).
3. The Coordinator sends the consolidated data and SOP guidelines to **Gemini 2.5 Pro**.
4. Gemini compiles:
   - A structured action plan (JSON).
   - An explainable reasoning summary.
   - Citations of the retrieved SOP documents.
   - A confidence score (`very_high`, `high`, `medium`, `low`).
5. The recommendation is committed to the `ai_recommendations` table, which triggers a WebSocket update to the Officer's interface.

---

# Model Context Protocol (MCP) Tools

The agents communicate with backend tables and external APIs using standard tool mappings:
- `get_weather_data(lat, lon)`: open-meteo weather variables.
- `search_nearby_hospitals(lat, lon)`: hospital capacities and beds.
- `search_nearby_police_stations(lat, lon)`: police staff availability.
- `search_nearby_fire_stations(lat, lon)`: active engines logs.
- `query_traffic_congestion(street_id)`: road density indexes.
- `retrieve_sop_guidelines(query)`: RAG pgvector matches.

---

# Human-in-the-Loop Sign-off

No critical system action is executed autonomously. All dispatches, alerts, and diversions are draft plans until verified, adjusted, and approved by the Department Head or authorized command center official.
