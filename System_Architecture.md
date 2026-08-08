# System Architecture

# BharatOS - AI Powered Multi-Agent Digital Twin Platform

---

# Overview

BharatOS follows a modular, cloud-native, AI-first architecture that combines a Digital Twin platform, Multi-Agent AI, real-time data processing, and scalable backend services.

The system is designed to support governance at multiple administrative levels, from a single city prototype to nationwide deployment.

---

# High-Level Architecture

```

┌─────────────────────────────────────────────┐
│             Client Applications             │
│                                             │
│ Citizen App │ Officer Dashboard │ Admin     │
└─────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────┐
│              API Gateway (FastAPI)          │
└─────────────────────────────────────────────┘
                     │
      ┌──────────────┼──────────────┐
      │              │              │
      ▼              ▼              ▼
Business Logic   AI Engine      Realtime Engine
      │              │              │
      ▼              ▼              ▼
Database      Multi-Agent AI   WebSockets
      │              │              │
      └──────────────┼──────────────┘
                     ▼
              Digital Twin Dashboard

```

---

# System Components

## Client Layer

Contains all user interfaces.

Applications:

- Citizen Portal
- Officer Dashboard
- Administration Dashboard

Responsibilities:

- User interaction
- Incident reporting
- Dashboard visualization
- AI interaction
- Report viewing

---

# API Layer

Technology

FastAPI

Responsibilities

- Authentication
- Authorization
- Routing
- Request validation
- Business logic execution
- AI communication

---

# Business Layer

Handles platform functionality.

Examples

- Incident Management
- User Management
- Notification System
- Resource Allocation
- Analytics
- Report Generation

---

# AI Layer

The intelligence layer of BharatOS.

Built using

- Gemini
- LangGraph
- MCP
- RAG

Responsibilities

- Reasoning
- Decision support
- Recommendations
- Predictions
- Report generation
- Agent communication

---

# Data Layer

Stores all platform information.

Database

Supabase PostgreSQL

Stores

- Users
- Incidents
- Departments
- Hospitals
- Reports
- Notifications
- Resources
- Cities
- Zones

---

# Storage Layer

Supabase Storage

Stores

- Uploaded images
- AI reports
- PDF files
- Documents

---

# Realtime Layer

Powered by

- WebSockets
- Supabase Realtime

Updates

- Incidents
- Dashboard
- Notifications
- AI recommendations
- Resource status

---

# External Services

Examples

Weather API

↓

Maps

↓

Geocoding

↓

AI Services

↓

Government Data (Future)

↓

IoT Sensors (Future)

---

# Multi-Agent Architecture

```

Citizen Report

↓

Coordinator Agent

↓

┌────────────┬────────────┬────────────┬────────────┐

Weather     Traffic     Emergency    Healthcare

Agent       Agent       Agent        Agent

└────────────┴────────────┴────────────┴────────────┘

↓

Analytics Agent

↓

Final Recommendation

↓

Dashboard

```

---

# Agent Responsibilities

## Coordinator Agent

Responsibilities

- Receive events
- Assign tasks
- Combine agent outputs
- Prioritize incidents
- Generate final recommendations

---

## Weather Agent

Processes

- Rainfall
- Temperature
- Weather Forecasts

Produces

- Flood risk
- Weather alerts
- Risk score

---

## Traffic Agent

Processes

- Congestion
- Road closures
- Vehicle density

Produces

- Alternate routes
- Traffic prediction

---

## Emergency Agent

Processes

- Accidents
- Fires
- Floods
- Medical emergencies

Produces

- Resource allocation
- Dispatch recommendations

---

## Healthcare Agent

Processes

- Bed availability
- Hospital capacity
- Ambulance status

Produces

- Best hospital
- Capacity alerts

---

## Citizen Agent

Processes

- Voice input
- Images
- Text reports

Produces

- Classified incidents
- Complaint tickets

---

## Analytics Agent

Processes

- Historical incidents
- Trends
- KPIs

Produces

- Dashboards
- Reports
- Forecasts

---

# Incident Processing Flow

```

Citizen Reports Incident

↓

FastAPI

↓

Database

↓

Coordinator Agent

↓

Weather Agent

↓

Traffic Agent

↓

Emergency Agent

↓

Healthcare Agent

↓

Analytics Agent

↓

Final AI Recommendation

↓

Realtime Dashboard Update

↓

Officer Notification

↓

Resource Assignment

↓

Incident Closed

```

---

# Digital Twin Flow

```

Real-Time Data

↓

Processing Engine

↓

Digital Twin Model

↓

Interactive Dashboard

↓

AI Analysis

↓

Recommendations

```

---

# AI Recommendation Flow

```

Weather

Traffic

Incidents

Resources

Citizen Reports

↓

Coordinator Agent

↓

Gemini Reasoning

↓

Explainable Recommendation

↓

Dashboard

```

---

# RAG Pipeline

```

Government Documents

↓

Document Processing

↓

Vector Embeddings

↓

pgvector Database

↓

Semantic Search

↓

Gemini

↓

Grounded AI Response

```

---

# MCP Workflow

```

AI Agent

↓

MCP Tool Request

↓

Weather API

Maps API

Hospital Service

Traffic Service

↓

Structured Response

↓

Gemini

↓

Recommendation

```

---

# Authentication Flow

```

User Login

↓

Supabase Auth

↓

JWT Token

↓

Role Verification

↓

Dashboard Access

```

---

# Real-Time Communication Flow

```

Database Change

↓

Supabase Realtime

↓

WebSocket

↓

Frontend

↓

Dashboard Updated

```

---

# Deployment Architecture

```

Users

↓

Vercel

↓

FastAPI

↓

Supabase

↓

Gemini

↓

External APIs

```

---

# Scalability

The architecture supports

India

↓

State

↓

District

↓

City

↓

Zone

↓

Ward

Each city can be onboarded independently while using the same backend services and AI engine.

---

# Prototype Scope

The SIH prototype demonstrates the complete workflow using **Visakhapatnam** as the primary Digital Twin.

The architecture is designed to support nationwide deployment by onboarding additional cities and integrating their local data sources.

---

# Key Design Principles

- Modular architecture
- AI-first design
- Cloud-native deployment
- Explainable AI
- Scalable services
- Real-time synchronization
- Secure authentication
- Independent AI agents
- Future-ready integrations

---

# Summary

BharatOS combines a layered system architecture, multi-agent AI, real-time communication, Digital Twin visualization, and cloud-native infrastructure into a unified platform for intelligent governance. The modular design enables the system to evolve from a single-city prototype into a scalable national platform while maintaining flexibility, maintainability, and high performance.