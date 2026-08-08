# UI / UX Design

# BharatOS - AI Powered Multi-Agent Digital Twin Platform

---

# Design Philosophy

BharatOS is designed as a modern AI-powered government command center.

The interface should feel premium, futuristic, and trustworthy while remaining simple enough for government officials to use during critical situations.

The UI draws inspiration from:
- Google Cloud Console
- Palantir Gotham
- Tesla Fleet Dashboard
- Arc Browser
- Linear
- Apple Human Interface Guidelines

The focus is clarity, speed, accessibility, and decision support.

---

# Design Principles

- Minimal yet information-rich layouts
- Dark-first interface (sleek, high-contrast palette)
- AI-first context widgets
- Glassmorphism overlays and containers
- Accessible typography
- Fluid but performance-conscious micro-animations

---

# Color Palette

## Primary & Backgrounds
- Deep Navy Background: `#050816`
- Card Container Slate: `#111827`
- Border Overlay: `#1F2937`

## Accents & Statuses
- Action Blue: `#3B82F6`
- Success Green: `#22C55E`
- Alert Orange (Warning): `#F59E0B`
- Critical Red (Danger): `#EF4444`
- Telemetry Cyan: `#06B6D4`

## Typography
- Primary White: `#FFFFFF`
- Secondary Slate: `#94A3B8`

---

# Navigation & Role-Based Access

The sidebar and top navigation panels hide or show options dynamically based on the logged-in user's role:

```
[Role: Citizen]
  ├── Home (Submit Incident Card, Live Alerts Feed)
  ├── My Complaints (Personal Timeline & Feedback)
  └── Nearby Shelters & Maps

[Role: Responder / Officer]
  ├── Active Incident Queue (Assigned cards)
  ├── Digital Twin Map (Visakhapatnam layers)
  └── Communications (Dispatcher Radio, team notes)

[Role: Department Head]
  ├── Department Dashboard (Consolidated resources, fire engines count, available beds)
  └── Sign-offs (Approve major alerts, evacuations draft, resource allocations)

[Role: District / State Admin]
  ├── Regional Dashboards (Consolidated analytics, cross-city alerts)
  └── Settings (Onboard city zones, adjust weather threshold parameters)

[Role: Global Admin]
  ├── Admin Panel (User profile config, DB sync logs, audit logs)
  └── System Monitor (FastAPI endpoints, active LLM agents status)
```

---

# Screen Directory

## Authentication
1. **Splash Screen**: Graphic logo and tagline.
2. **Login**: Password/Google OAuth fields.
3. **Register**: Name, phone, city fields.
4. **Forgot Password**: Password reset email form.

## Hierarchical Dashboards
5. **National Command Center**: India map with high-risk state overlays and national disaster alerts.
6. **State Dashboard**: District performance charts, resources breakdown, and active alerts.
7. **District Dashboard (NEW)**: Aggregated city parameters, consolidates inter-city dispatches, district incident heatmaps, and consolidated analytics.
8. **City Dashboard**: Digital Twin map centered on Visakhapatnam with live incident lists.

## Digital Twin Command
9. **Interactive Map**: Leaflet view rendering geo-assets (shelters, hospitals, fire stations, police stations), live incident pins, and emergency vehicles.
10. **Layer Control Panel**: Checkboxes to toggle layers (Traffic density, Weather radar overlay, Flood zones, Sensor pins).

## Incident Management
11. **Incident Queue**: Filterable cards using the **10 Standardized Categories**:
    `Flood`, `Fire`, `Medical`, `Accident`, `Garbage`, `Water Leakage`, `Pothole`, `Street Light Failure`, `Fallen Tree`, `Infrastructure Damage`.
12. **Incident Details**: Large panel displaying coordinates, reporter information, images, timeline, and AI Recommendations widget.
13. **Incident Timeline**: Vertical line displaying logs (Reported → AI triaged → Assigned → En route → Resolved).
14. **Incident Reporting Card**: Simple container for image drops, title, location picker, and microphone recorder button.

## AI Interfaces
15. **AI Assistant Chat**: Sidebar slide-in interface for natural language queries (FastAPI endpoint `/ai/chat`).
16. **AI Action Plan Panel**: Highlights recommendations, explanations, confidence tags, and "Approve/Modify" buttons.
17. **AI Automated Reports**: Template config to preview daily analytics before generating PDFs.

## Department Specific Dashboards (NEW)
18. **Department Head Dashboard**: Shows resource counts (e.g. active fire engines, police units on shift), team capacity meters, active dispatches queue, and urgent recommendations awaiting approval.
19. **Hospital & Health Dashboard**: Live ICU status bar, bed counts list, and active ambulance positions.

## Administrative Panels
20. **User Management Table**: Onboard users, search by name, assign roles.
21. **System Health Console**: Heartbeats for LLM endpoints, Supabase connections, and WebSocket latency.
22. **Audit Logs Page**: Table mapping actions, users, and timestamps.
