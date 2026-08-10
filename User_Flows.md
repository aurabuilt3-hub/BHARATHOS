# User Flows

# BharatOS - End-to-End User Journey

---

# Overview

This document describes the major workflows within BharatOS.

Each workflow explains how different users interact with the platform and how AI agents collaborate behind the scenes.

---

# User Roles

The platform supports multiple user roles.

- Citizen
- Officer
- Department Head
- Administrator
- State Administrator
- National Administrator

Each role has different permissions and responsibilities.

---

# Workflow 1: Citizen Reports an Incident

## Step 1

Citizen opens BharatOS Mobile App.

↓

## Step 2

Selects

"Report Incident"

↓

## Step 3

Adds

- Title
- Description
- Location
- Image
- Voice Message (Optional)

↓

## Step 4

Clicks Submit.

↓

## Backend Flow

FastAPI receives request.

↓

Stores incident.

↓

Image uploaded to Supabase Storage.

↓

Coordinator Agent notified.

↓

Citizen receives

"Incident Submitted Successfully"

---

# Workflow 2: AI Incident Processing

Incident Created

↓

Coordinator Agent

↓

Citizen Agent

↓

Gemini Vision analyzes image.

↓

Incident classified.

↓

Weather Agent checks weather.

↓

Traffic Agent checks nearby roads.

↓

Emergency Agent checks severity.

↓

Healthcare Agent checks nearby hospitals.

↓

Coordinator combines responses.

↓

AI Recommendation generated.

↓

Stored in Database.

↓

Officer notified.

---

# Workflow 3: Officer Responds

Officer Login

↓

Dashboard

↓

New Critical Incident

↓

Open Incident

↓

Review

- Images
- AI Analysis
- Recommendation
- Location

↓

Assign Team

↓

Update Status

↓

Dispatch Resources

↓

Incident becomes

"In Progress"

---

# Workflow 4: Resource Allocation

Emergency Agent identifies required resources.

↓

Nearby Police

↓

Nearby Ambulance

↓

Nearby Fire Station

↓

Nearest Hospital

↓

Coordinator Agent

↓

Suggested Response Plan

↓

Officer Approval

↓

Deployment

---

# Workflow 5: Incident Resolution

Field Team reaches location.

↓

Updates progress.

↓

Officer verifies completion.

↓

Citizen receives update.

↓

Status

Resolved

↓

Analytics updated.

↓

AI Report updated.

---

# Workflow 6: AI Chat Assistant

User opens AI Assistant.

↓

Types

"Show all flood incidents."

↓

Coordinator Agent

↓

Relevant Data

↓

Gemini

↓

Response

↓

Dashboard updates.

---

# Workflow 7: Voice Assistant

User presses microphone.

↓

Voice converted to text.

↓

Coordinator Agent

↓

Relevant AI Agents

↓

Gemini

↓

Response

↓

Speech generated.

↓

Voice reply played.

---

# Workflow 8: Weather Alert

Weather API detects heavy rainfall.

↓

Weather Agent

↓

Flood Risk calculated.

↓

Coordinator Agent

↓

Traffic Agent

↓

Emergency Agent

↓

Recommendation

↓

Dashboard Alert

↓

Notifications sent.

---

# Workflow 9: Traffic Intelligence

Traffic density increases.

↓

Traffic Agent

↓

Congestion predicted.

↓

Alternative routes generated.

↓

Officer Dashboard updated.

↓

Public alerts (if approved).

---

# Workflow 10: Hospital Recommendation

Medical emergency reported.

↓

Healthcare Agent

↓

Nearby hospitals checked.

↓

Available beds verified.

↓

AI Recommendation

↓

Best hospital suggested.

---

# Workflow 11: Daily Report Generation

Scheduled process starts.

↓

Analytics Agent

↓

Incident Statistics

↓

Department KPIs

↓

AI Summary

↓

PDF generated.

↓

Stored in Reports.

↓

Admin notified.

---

# Workflow 12: Dashboard Navigation

National Dashboard

↓

Select State

↓

State Dashboard

↓

Select City

↓

City Dashboard

↓

Digital Twin

↓

Zone

↓

Incident Details

---

# Workflow 13: Notification Flow

New incident

↓

Coordinator Agent

↓

Determine recipients.

↓

Notification created.

↓

Realtime update.

↓

Mobile

↓

Dashboard

↓

Email (Future)

---

# Workflow 14: Citizen Complaint Tracking

Citizen Login

↓

My Complaints

↓

Incident Timeline

↓

Assigned Officer

↓

Current Status

↓

Resolution Updates

↓

Citizen Feedback

---

# Workflow 15: AI Recommendation Approval

AI Recommendation generated.

↓

Officer reviews recommendation.

↓

Approve

or

Reject

↓

System records decision.

↓

Audit Log updated.

This ensures AI supports decision-making without taking autonomous critical actions.

---

# Workflow 16: Digital Twin Update

New incident

↓

Database updated.

↓

Realtime event triggered.

↓

Digital Twin refreshes.

↓

Map marker added.

↓

Analytics refreshed.

---

# Workflow 17: Knowledge Retrieval (RAG)

Officer asks

"What is the flood evacuation procedure?"

↓

Coordinator Agent

↓

Knowledge Base Search

↓

Relevant SOP retrieved.

↓

Gemini generates grounded response.

↓

Answer displayed.

---

# Workflow 18: Simulated Sensor Event

Water level simulation increases.

↓

Sensor Data updated.

↓

Weather Agent

↓

Flood Risk recalculated.

↓

AI Recommendation

↓

Dashboard updated.

---

# Error Handling Flow

Invalid request

↓

Validation

↓

Error logged

↓

User-friendly message returned

↓

Audit log updated

---

# Audit Flow

Every important action records:

- User
- Timestamp
- Action
- Resource
- Result

Examples

- Login
- Incident created
- Recommendation approved
- Status updated

---

# Complete End-to-End Flow

Citizen

↓

Incident Report

↓

FastAPI

↓

Database

↓

Coordinator Agent

↓

Specialized AI Agents

↓

Gemini Reasoning

↓

AI Recommendation

↓

Officer Dashboard

↓

Approval

↓

Resource Deployment

↓

Incident Resolution

↓

Citizen Notification

↓

Analytics

↓

Reports

---

# Prototype Scope

The SIH prototype demonstrates these workflows using **Visakhapatnam** as the primary Digital Twin.

National and State dashboards provide summary navigation, while all AI workflows, incident management, and Digital Twin interactions are fully implemented for the prototype city.

---

# Summary

BharatOS is built around clearly defined user journeys that connect citizens, government officials, AI agents, and real-time infrastructure. Every workflow emphasizes transparency, explainability, and human oversight, ensuring AI assists decision-makers while maintaining accountability.