# Tech Stack

# BharatOS - AI Powered Multi-Agent Digital Twin Platform

---

# Overview

BharatOS is built using a modern AI-first architecture designed to be scalable, modular, and cloud-native.

The platform combines Artificial Intelligence, Digital Twin technology, real-time communication, cloud infrastructure, and modern web technologies to create a unified governance platform.

---

# Architecture Philosophy

BharatOS follows a layered architecture.

```
Frontend
        │
API Gateway
        │
Business Logic
        │
AI Engine
        │
Database
        │
External APIs
```

Each layer is independent, making the system easier to scale and maintain.

---

# Frontend

## Framework

Next.js 15

Reason

- Server-side rendering
- Fast performance
- SEO support
- App Router
- TypeScript support

---

## UI Library

React 19

Used for:

- Component architecture
- Dashboard development
- State management

---

## Language

TypeScript

Benefits

- Strong typing
- Better maintainability
- Fewer runtime errors

---

## Styling

Tailwind CSS

Used for:

- Responsive layouts
- Modern UI
- Rapid development

---

## Component Library

shadcn/ui

Benefits

- Accessible components
- Professional design
- Easy customization

---

## Animations

Framer Motion

Used for:

- Dashboard transitions
- Interactive cards
- Loading animations
- Page transitions

---

# Backend

Framework

FastAPI

Reasons

- High performance
- Python ecosystem
- AI friendly
- Automatic Swagger documentation

---

Language

Python 3.12+

---

API Style

REST API

Future Support

GraphQL

---

Authentication

Supabase Authentication

Supports

- Email Login
- Google Login
- JWT Authentication

---

# Database

Platform

Supabase

Database

PostgreSQL

---

Storage

Supabase Storage

Stores

- Images
- Reports
- Documents
- Incident Files

---

Realtime

Supabase Realtime

Used for

- Live dashboard updates
- Notifications
- Incident synchronization

---

Vector Search

pgvector

Used for

- RAG
- Semantic Search
- Similar Incident Search

---

# AI Stack

## Large Language Model

Gemini 2.5 Pro

Capabilities

- Reasoning
- Vision
- Function Calling
- Report Generation
- Recommendations
- Natural Language Processing

---

## Agent Framework

LangGraph

Responsible for

- Multi-Agent orchestration
- Agent collaboration
- Workflow execution

---

## Model Context Protocol

MCP

Purpose

Standard interface for connecting AI agents with external tools and data sources.

Examples

- Weather API
- Maps
- Hospital Database
- Traffic Services

---

## Retrieval-Augmented Generation

RAG

Purpose

Allows AI to answer questions using trusted documents.

Knowledge Sources

- Disaster SOPs
- Government guidelines
- Emergency manuals
- Policy documents

---

# AI Agent Layer

Coordinator Agent

↓

Weather Agent

Traffic Agent

Healthcare Agent

Emergency Agent

Citizen Agent

Analytics Agent

Each agent focuses on a specific domain and shares information with the Coordinator Agent.

---

# Mapping

Library

Leaflet

Map Source

OpenStreetMap

Features

- Interactive Maps
- Markers
- Heatmaps
- GeoJSON Layers
- Route Visualization

---

# Charts

Recharts

Displays

- Analytics
- KPIs
- Trends
- Incident Statistics
- Department Performance

---

# Voice AI

Speech Recognition

Web Speech API

Speech Output

Web Speech API

Future

Cloud Speech APIs

---

# Image Processing

Gemini Vision

Functions

- Incident Classification
- Damage Detection
- Image Understanding

---

# Realtime Communication

WebSockets

Supabase Realtime

Used for

- Dashboard synchronization
- Live notifications
- Incident updates

---

# Deployment

Frontend

Vercel

Backend

Render

Database

Supabase

Storage

Supabase Storage

---

# Development Tools

Git

GitHub

VS Code

Postman

Figma

Antigravity

---

# APIs

Weather

Open-Meteo

Maps

OpenStreetMap

Geocoding

Nominatim

AI

Gemini API

Authentication

Supabase Auth

---

# Security

JWT Authentication

Role-Based Access Control

HTTPS

API Validation

Row-Level Security

Audit Logs

---

# Folder Structure

```
bharatos/

├── frontend/
│
├── backend/
│
├── ai/
│
├── database/
│
├── docs/
│
├── assets/
│
├── prompts/
│
├── deployment/
│
└── README.md
```

---

# Frontend Structure

```
frontend/

app/

components/

hooks/

lib/

services/

types/

styles/

public/
```

---

# Backend Structure

```
backend/

api/

models/

services/

agents/

middleware/

utils/

config/

main.py
```

---

# AI Structure

```
ai/

coordinator/

weather/

traffic/

emergency/

healthcare/

citizen/

analytics/

rag/

mcp/

prompts/
```

---

# Database Structure

```
database/

schema/

migrations/

seed/

functions/

policies/
```

---

# Why This Stack?

The chosen technologies provide:

- High performance
- AI compatibility
- Real-time communication
- Scalability
- Cloud-native deployment
- Strong developer ecosystem
- Rapid prototyping
- Production-ready architecture

---

# Future Scalability

The architecture supports future integration with:

- Real IoT devices
- CCTV analytics
- Drone feeds
- Satellite imagery
- Government data sources
- Additional AI agents
- Multiple cities
- National-level deployments

---

# Summary

BharatOS leverages a modern full-stack architecture centered around AI, Digital Twins, and real-time data. By combining Next.js, FastAPI, Supabase, Gemini, LangGraph, MCP, and RAG, the platform is designed to support scalable, intelligent, and secure smart governance while remaining practical for a hackathon prototype.