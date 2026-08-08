# Tech Stack

# BharatOS - AI Powered Multi-Agent Digital Twin Platform

---

# Overview

BharatOS is built using a modern AI-first architecture designed to be scalable, modular, and cloud-native.

The platform combines Artificial Intelligence, Digital Twin technology, real-time communication, cloud infrastructure, and modern web technologies to create a unified governance platform.

---

# Architecture Philosophy

BharatOS follows a layered architecture:

```
Frontend (Next.js 15)
        │
API Gateway (FastAPI)
        │
Business Logic (Python)
        │
AI Engine (LangGraph + Gemini 2.5 Pro)
        │
Database (Supabase PostgreSQL + pgvector)
        │
External APIs & Sensors
```

Each layer is independent, making the system easier to scale and maintain.

---

# Frontend

## Framework
**Next.js 15**
Reason:
- Server-side rendering (SSR) and Server Components
- Fast client performance
- SEO support
- File-system App Router
- Strict TypeScript support

## UI Library
**React 19**
Used for:
- Component-driven architecture
- Interactive dashboard widgets
- Centralized client states

## Language
**TypeScript**
Benefits:
- Static typing and code safety
- Easier refactoring
- Fewer runtime exceptions

## Styling
**Tailwind CSS**
Used for:
- Fully responsive styling
- Sleek dark UI styling
- Rapid component development

## Component Library
**shadcn/ui**
Benefits:
- Accessible UI components
- High customizability and modern design

## Animations
**Framer Motion**
Used for:
- Dashboard route transitions
- Smooth card hover states and panel slide-ins
- AI processing loading micro-animations

---

# Backend

## Framework
**FastAPI**
Reasons:
- Asynchronous python code execution (high performance)
- Smooth python integration (AI and LangGraph ecosystem friendly)
- Automated interactive Swagger API documentation (`/docs`)

## Language
**Python 3.12+**

## Authentication
**Supabase Authentication**
Supports:
- Email/Password login
- OAuth (Google Login)
- JWT-based authentication headers

---

# Database

## Database Platform
**Supabase** (Managed PostgreSQL)

## Features
- **PostgreSQL**: Robust relational storage
- **pgvector**: High-performance semantic vector searches for RAG SOPs
- **Supabase Realtime**: Event broadcasting via WebSockets
- **Supabase Storage**: Bucket storage for files, incident photos, and PDF reports

---

# AI Stack

## Large Language Model (LLM)
**Gemini 2.5 Pro**
Capabilities:
- Complex multi-agent reasoning and decision planning
- Gemini Vision multimodal understanding (image triage)
- Structured JSON output / function calling
- Long context processing (for RAG context and reports)

## Agent Framework
**LangGraph**
Responsible for:
- Orchestrating the multi-agent graph
- State tracking and conversation history loops
- Parallel and sequential execution flows

## Model Context Protocol (MCP)
Purpose:
- Standardized tool interface linking agents to databases, APIs, and manual searches.

## Retrieval-Augmented Generation (RAG)
Purpose:
- Grounding AI recommendations in NDMA SOP manuals and city governance guidelines using `pgvector` similarity search.

---

# Mapping & Charts

## Maps
- **Leaflet**: Map rendering framework
- **OpenStreetMap**: Free tile server (no API costs)
- **Nominatim**: Open-source geocoding and reverse-geocoding

## Charts
- **Recharts**: Responsive charting widgets for telemetry and analytics

---

# Voice AI & Image processing
- **ASR & TTS**: Cloud APIs with regional language fallbacks for Hindi, Telugu, Tamil, Kannada, and Bengali.
- **Multimodal processing**: Gemini Vision for automatic triage of the 10 standardized categories.

---

# Deployment

- **Frontend**: Vercel
- **Backend**: Render
- **Database/Storage**: Supabase

---

# Folder Structure

```
bharatos/
├── frontend/         # Next.js Application
├── backend/          # FastAPI Backend Application
├── ai/               # AI Engine Agent Graph & Prompting
├── database/         # Database schemas, migrations, and triggers
├── docs/             # Numerical prefixed Markdown documentation
├── prompts/          # Version-controlled system prompts
├── assets/           # Media, design materials, and presentations
├── scripts/          # Database seeding and sensor simulation scripts
└── tests/            # Automation tests (unit, integration, api, performance)
```

---

# Why This Stack?

The chosen technologies provide:
- Fast performance under demo workloads
- Direct access to Python's robust AI libraries
- Zero page refresh realtime UI updates
- High scalability
- Quick deployment and simple hosting configuration

---

# Summary

BharatOS leverages a modern full-stack architecture centered around AI, Digital Twins, and real-time data. By combining Next.js, FastAPI, Supabase, Gemini, LangGraph, MCP, and RAG, the platform is designed to support scalable, intelligent, and secure smart governance while remaining practical for a hackathon prototype.
