from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

from app.api.v1.health import router as health_router
from app.api.v1.system import router as system_router
from app.api.v1.auth import router as auth_router
from app.api.v1.incidents import router as incidents_router
from app.api.v1.departments import router as departments_router
from app.api.v1.cities import router as cities_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.ai import router as ai_router
from app.api.v1.ws import router as ws_router
import asyncio
from app.simulation.sensor_engine import sensor_engine

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="BharatOS AI-Powered Multi-Agent Digital Twin & Smart Municipal Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Versioned API V1 Routers
app.include_router(health_router, prefix=settings.API_V1_STR)
app.include_router(system_router, prefix=settings.API_V1_STR)
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(incidents_router, prefix=settings.API_V1_STR)
app.include_router(departments_router, prefix=settings.API_V1_STR)
app.include_router(cities_router, prefix=settings.API_V1_STR)
app.include_router(dashboard_router, prefix=settings.API_V1_STR)
app.include_router(ai_router, prefix=settings.API_V1_STR)
app.include_router(ws_router)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(sensor_engine.run_simulation_loop())

@app.get("/")
def root():
    return {
        "message": "Welcome to BharatOS API Server",
        "docs": "/docs",
        "health": "/api/v1/health"
    }
