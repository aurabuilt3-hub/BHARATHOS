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
    # Database initialization and seeding
    from app.db.base import Base
    from app.db.session import engine, SessionLocal
    from app.models.models import Role, Department, User
    import uuid

    try:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        try:
            if db.query(Role).count() == 0:
                roles = [
                    Role(role_name="citizen"),
                    Role(role_name="officer"),
                    Role(role_name="dept_head"),
                    Role(role_name="admin"),
                    Role(role_name="state_admin"),
                    Role(role_name="national_admin")
                ]
                db.add_all(roles)
                db.commit()
                print("Seeded roles.")

            if db.query(Department).count() == 0:
                depts = [
                    Department(name="Police Department", code="POLICE"),
                    Department(name="Fire Department", code="FIRE"),
                    Department(name="Emergency Health Services", code="HEALTH"),
                    Department(name="Municipal Corporation", code="MUNICIPAL"),
                    Department(name="Disaster Management Authority", code="DISASTER")
                ]
                db.add_all(depts)
                db.commit()
                print("Seeded departments.")

            mock_user_id = uuid.UUID("00000000-0000-0000-0000-000000000001")
            if db.query(User).filter(User.id == mock_user_id).count() == 0:
                admin_role = db.query(Role).filter(Role.role_name == "admin").first()
                if admin_role:
                    mock_user = User(
                        id=mock_user_id,
                        full_name="Commanding Officer (Mock)",
                        email="collector@bharatos.gov.in",
                        role_id=admin_role.id,
                        status="active"
                    )
                    db.add(mock_user)
                    db.commit()
                    print("Seeded mock user profile.")
        except Exception as e:
            db.rollback()
            print(f"Startup DB seeding error: {e}")
        finally:
            db.close()
    except Exception as e:
        print(f"Startup DB connection/creation error: {e}")

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
