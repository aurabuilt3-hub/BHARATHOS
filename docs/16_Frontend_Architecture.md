# Frontend Architecture

# BharatOS Frontend

---

# Overview

The BharatOS frontend is built using **Next.js 15**, **React 19**, **TypeScript**, and **Tailwind CSS**. It follows a component-driven architecture with reusable UI elements, modular layouts, centralized state management, and a responsive design system.

The application serves five main client groups:
- **Citizens**: Grid layout optimized for mobile incident submissions.
- **Officers (Responders)**: Live queues and mapping indicators.
- **Department Heads**: Operational overview dashboard and approval workflows.
- **Regional Admins (District/State)**: Aggregated analytics graphs.
- **System Administrators**: Audit log tables.

---

# Tech Stack & Libraries

- **Framework**: Next.js 15 (App Router, Server Components)
- **Styling**: Tailwind CSS, Lucide React (Icons)
- **Component System**: shadcn/ui (Radix Primitives)
- **Animations**: Framer Motion
- **Map Visualizations**: Leaflet (dynamic OpenStreetMap overlays)
- **Data Charts**: Recharts
- **Client State**: Zustand
- **Server Queries**: TanStack Query (React Query)
- **Form Handling**: React Hook Form, Zod (validation)

---

# Directory Mapping

```
frontend/
├── app/                  # Next.js App Router Pages
│   ├── (auth)/           # Splash, Login, Register layouts
│   ├── (citizen)/        # Citizen reporting portal
│   ├── (officer)/        # Responder queues
│   ├── (head)/           # Department Head approvals panel
│   ├── (admin)/          # Audit logs and configurations
│   ├── layout.tsx        # Global page layouts wrapper
│   └── page.tsx          # Root dashboard redirect router
├── components/           # Reusable UI Blocks
│   ├── ui/               # Radix primitives (Button, Card, Dialog)
│   ├── maps/             # Leaflet Digital Twin maps
│   ├── charts/           # Recharts panels
│   └── ai/               # Chat UI and AI Recommendation panels
├── hooks/                # Custom React hooks (useWebSockets, useAuth)
├── store/                # Zustand global slices
└── services/             # Axios API calls wrappers
```

---

# Global State Management (Zustand)

Slices keep state modular:
- **Auth Slice**: JWT token, user profiles, session flags.
- **Layer Slice**: Visible map layer states (Traffic layer on, flood overlay off).
- **Incident Slice**: Active incident arrays, socket notifications list.
- **Sensor Slice**: Realtime IoT sensor records for chart plotting.

---

# Real-Time Event Sync

The client uses the `useWebSockets` hook to establish direct connections to the backend WebSocket gateways. 

When a database event triggers (e.g. status change in `incidents`, telemetry update in `sensor_data`), the client handles the payload:
1. Updates the global Zustand store array.
2. Injects a notification toast banner.
3. Repositions active vehicle coordinates or marker positions on the Leaflet map without full-page re-renders.

---

# Optimization Features

- **Dynamic Imports**: Map components (Leaflet relies on client browser windows) are loaded dynamically using `next/dynamic` to prevent server-side build failures.
- **Image Triage Compression**: Citizen uploads are compressed in the browser before POSTing to Supabase Storage, preserving network bandwidth.
- **Cache Invalidation**: React Query queries are invalidated automatically upon receiving specific WebSocket status update confirmations.
