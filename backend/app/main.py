from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.logging import logger
from app.api.v1.router import api_v1_router
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

# CORS Configuration using environment parsed CORS origins instead of wildcard *
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.parsed_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Versioned API V1 Router
app.include_router(api_v1_router, prefix=settings.API_V1_STR)

# Mount separate WebSockets routers
app.include_router(ws_router)

@app.on_event("startup")
async def startup_event():
    logger.info("Starting up BharatOS API application server.")
    asyncio.create_task(sensor_engine.run_simulation_loop())

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down BharatOS API application server.")

@app.get("/")
def root():
    return {
        "message": "Welcome to BharatOS API Server",
        "docs": "/docs",
        "health": "/api/v1/health"
    }
