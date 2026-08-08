# AI Agents

# BharatOS - Multi-Agent Intelligence System

---

# Overview

The intelligence layer of BharatOS is built around a Multi-Agent AI architecture orchestrated using **LangGraph**.

Instead of using a single monolithic AI prompt for every task, BharatOS utilizes specialized AI agents that collaborate through a Coordinator Agent to analyze city-wide events, query databases, read guidelines, and generate explainable recommendations for human officials.

---

# AI Agent Graph Architecture

```
                    Incident / Sensor Signal
                                │
                                ▼
                       Coordinator Agent
                                │
      ┌──────────────┬──────────┴──┬──────────────┬──────────────┐
      ▼              ▼              ▼              ▼              ▼
Weather Agent  Traffic Agent  Emergency Agent  Healthcare   Analytics Agent
                                                  Agent
      └──────────────┬───────────┬──┴──────────────┬──────────────┘
                     │           │ (MCP Tools)
                     ▼           ▼
                  Aggregated Recommendation
                                │
                                ▼
                    Authorized Human Approval
```

---

# Why Multi-Agent?

- **Specialized Reasoning**: Each agent operates with domain-specific system prompts, RAG context vectors, and tools.
- **Explainability**: Outputs indicate which agent contributed what analysis, raising trust.
- **Scalability**: New agents (e.g., Drone Agent, Utility Agent) can be added as nodes in the LangGraph without breaking existing agent configurations.
- **Context Size Control**: Agents focus on narrow inputs, keeping LLM prompts shorter, faster, and more context-efficient.

---

# Coordinator Agent

## Purpose
Acts as the central router and decision-aggregator of the BharatOS AI Engine.

## Responsibilities
- Receives incident events and parses the location and initial context.
- Dispatches sub-tasks to relevant agents in parallel.
- Combines agent outputs, resolves conflicting analyses, and calls **Gemini 2.5 Pro** to write the final recommendation.
- Estimates the overall platform severity level and sets the confidence score.

---

# Citizen Agent

## Purpose
Processes and structures natural language and media inputs submitted by citizens.

## Inputs
- Speech voice recordings (ASR text transcripts)
- Citizen text reports
- Multimodal images (Gemini Vision API)

## Responsibilities
- Triages and classifies reports into the **10 Standardized Categories**:
  1. `Flood`
  2. `Fire`
  3. `Medical`
  4. `Accident`
  5. `Garbage`
  6. `Water Leakage`
  7. `Pothole`
  8. `Street Light Failure`
  9. `Fallen Tree`
  10. `Infrastructure Damage`
- Translates regional languages (Hindi, Telugu, Tamil, Kannada, Bengali) into English for the backend.
- Extracts priority tags (`Critical`, `High`, `Medium`, `Low`).

---

# Weather Agent

## Purpose
Monitors weather feeds and evaluates current meteorological hazards.

## Inputs
- Open-Meteo current API values
- Rain gauge IoT sensors
- River and drainage water level IoT sensors

## Responsibilities
- Evaluates flood risks in low-lying city zones.
- Monitors extreme heatwave or cyclone projections.
- Emits risk ratings and triggers weather warnings on the Digital Twin.

---

# Traffic Agent

## Purpose
Manages road traffic networks and optimizes routing during emergency events.

## Inputs
- Traffic speed & density logs
- Active incident locations (e.g. Accidents)
- Road network nodes (OpenStreetMap vectors)

## Responsibilities
- Generates route diversions around flooded or blocked roads.
- Identifies congestion bottleneck alerts.
- Computes priority emergency vehicle routes from fire stations/hospitals to incident locations.

---

# Emergency Agent

## Purpose
Coordinates the dispatching logistics for public safety resources.

## Inputs
- Classified incident priorities
- Locations of Police Stations, Fire Stations, and Disaster Response warehouses.
- Live resource counts (Available fire engines / police units)

## Responsibilities
- Suggests resource dispatch counts (e.g., "Deploy 2 Fire Engines from Station A").
- Drafts inter-department emergency action plans.
- Assigns priority status and estimates response times.

---

# Healthcare Agent

## Purpose
Optimizes medical response and hospital admissions.

## Inputs
- Emergency incident details (casualties present)
- Hospital locations, bed/ICU availability
- Ambulance coordinates and busy/active status

## Responsibilities
- Recommends the optimal hospital based on distance and available beds.
- Recommends the nearest available ambulance.
- Reserves emergency beds in the database (pending officer approval).

---

# Analytics Agent

## Purpose
Derives historical correlations and automates documentation tasks.

## Inputs
- Historical incident databases
- Resolution timeframes
- Scheduled cron triggers

## Responsibilities
- Evaluates department KPIs.
- Builds charts and trends.
- Automates daily/weekly/monthly operational summaries in PDF/Excel format.

---

# Agent Tools & Protocols

## Model Context Protocol (MCP)
BharatOS agents call databases and APIs using standardized MCP tool calls. This allows the LangGraph engine to use tools like:
- `query_hospital_beds(hospital_id)`
- `fetch_traffic_density(route_id)`
- `retrieve_weather_forecast(lat, lon)`
- `dispatch_resource(incident_id, resource_id)`

## Retrieval-Augmented Generation (RAG)
When formulating emergency response plans, the Coordinator and Emergency agents query the `knowledge_base` using `pgvector` semantic matching. This retrieves specific blocks from official manuals (e.g. NDMA Flood SOPs) and appends them to the LLM context, ensuring AI suggestions are grounded in approved guidelines.

---

# Human-in-the-Loop Safety
BharatOS enforces absolute safety checks:
- **No Autonomous Execution**: AI recommendations are strictly advisory. Actions like closing roads, broadcasting public warnings, and dispatching rescue teams are saved as "Draft Action Plans."
- **Dashboard Review**: The officer must review, modify, and explicitly approve the action plan before notifications are dispatched to emergency crews.
- **Audit Logging**: Every approved plan, rejection, or manual edit is stored in `audit_logs` to maintain transparency.
