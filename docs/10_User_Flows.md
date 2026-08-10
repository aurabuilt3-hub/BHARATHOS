# User Flows

# BharatOS - End-to-End User Journeys

---

# Overview

This document maps the core workflows within BharatOS, highlighting interactions between citizens, officers, department heads, and regional admins, alongside the orchestration of AI agents.

---

# User Roles & Matrix

- **Citizen**: Reports incidents, tracks personal tickets, receives alerts.
- **Officer (Responder)**: Receives assignments, updates field status, coordinates on site.
- **Department Head**: Monitors department resources (hospitals, stations) and approves AI recommendations.
- **District / State Admin**: Oversees regional analytics, configures local zones, handles alerts.
- **Global Administrator**: Configures user accounts, reviews database schema integrity, audits logs.

---

# Workflow 1: Citizen Reports an Incident (Voice / Image Triage)

```
[Citizen App] ──────────► [FastAPI Backend] ─────────► [Supabase Database]
   │                         │ (Save Incident)            │ (Upload Image)
   ▼                         ▼                            ▼
Select "Report" ──► Upload Photo / Voice ──► Citizen Agent (Gemini Vision)
                                                          │
                                                          ▼
                                             Classifies into 10 Categories
                                             & Determines Severity Level
```

### Detailed Steps:
1. Citizen opens the mobile interface and taps **Report Incident**.
2. Citizen takes a picture of a street hazard (e.g. a fallen tree blocking a lane) and records a brief voice note in Telugu: *"Beach road blocked by a big tree branch near the lighthouse."*
3. Citizen clicks **Submit**.
4. The backend uploads the image to the `incident-images` Supabase bucket.
5. The **Citizen Agent** triggers:
   - Transcribes and translates the Telugu note to English using Cloud ASR/Translation API.
   - Invokes Gemini Vision to analyze the photo, identifying the hazard type.
6. The Citizen Agent writes a structured incident log to the database:
   - **Category**: `Fallen Tree`
   - **Priority**: `high`
   - **Confidence**: `94%`
7. A WebSocket event broadcast triggers a map pin on the Digital Twin and overlays a notification alert on the Officer's dashboard.

---

# Workflow 2: Department Head Approval & Dispatch

```
[Incident Logged]
       │
       ▼
[Weather / Traffic Agents Run] ──► [Coordinator Agent] ──► [Draft Action Plan]
                                                                  │
                                                                  ▼
                                                      [Dept Head Dashboard]
                                                                  │
                                                                  ▼
                                                      (Review, Edit, Approve)
                                                                  │
                                                                  ▼
                                                       [WebSocket Dispatch]
```

### Detailed Steps:
1. A new incident is flagged in the database.
2. The **Coordinator Agent** executes LangGraph nodes in parallel:
   - **Weather Agent**: Ingests local coordinates, checking for wind/storm risks.
   - **Traffic Agent**: Calculates traffic congestion factors near Beach Road.
   - **Healthcare Agent**: Queries hospital bed databases for capacity.
3. The Coordinator combines outputs and drafts a response plan:
   - *Draft Recommendation*: Dispatch 1 municipal debris crew and 1 police cruiser to block the lane and divert traffic.
4. This Draft Action Plan is pushed to the **Department Head Dashboard** (e.g. Municipal Director / Police Chief).
5. The Department Head opens the AI panel:
   - Reviews the reasoning and the cited SOP manuals.
   - Click **Approve** (or edits the dispatch targets).
6. The system commits the approval:
   - Inserts record to `incident_assignments` and `resource_assignments`.
   - Sends WebSocket triggers to the designated responder's app.
   - Updates `audit_logs` tracking the approval action.

---

# Workflow 3: Field Operations & Resolution

1. Deployed crew logs onto the responder portal.
2. App shows the route mapped by the **Traffic Agent** to bypass Beach Road bottlenecks.
3. Live GPS coordinates are sent to `vehicle_tracking` every 5 seconds, updating the vehicle marker on the Digital Twin.
4. Crew arrives on site, clears the tree, and uploads a "Resolved" status update and photo.
5. The **Department Head** or assigned officer reviews the completion photo, moves status to `Resolved` then `Closed`.
6. Database inserts are committed, and the citizen receives a push notification: *"Your report on Fallen Tree has been successfully resolved. Thank you!"*
7. The **Analytics Agent** updates daily response metrics.

---

# Workflow 4: Regional District Admin Review

1. A District Administrator logs into the **District Dashboard**.
2. The dashboard aggregates data from Visakhapatnam City, zones, and wards.
3. The Admin views consolidated KPIs: Average Response Time, open tickets counts, and resources status.
4. The Admin launches the AI Chat Assistant: *"Summarize our biggest operational bottleneck in the Novotel zone over the last 48 hours."*
5. The **Analytics Agent** performs a pgvector search on past incident patterns and outputs a grounded summary: *"Beach Road experienced 4 instances of Fallen Tree and Flood incidents, raising congestion index by 40% due to slow municipal response times."*
6. The Admin uses this analysis to draft policy adjustments for emergency team placement.
