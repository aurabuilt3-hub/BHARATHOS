from fastapi import APIRouter
from app.api.v1.health import router as health_router
from app.api.v1.system import router as system_router
from app.api.v1.auth import router as auth_router
from app.api.v1.incidents import router as incidents_router
from app.api.v1.departments import router as departments_router
from app.api.v1.cities import router as cities_router
from app.api.v1.states import router as states_router
from app.api.v1.districts import router as districts_router
from app.api.v1.zones import router as zones_router
from app.api.v1.wards import router as wards_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.ai import router as ai_router
from app.api.v1.digital_twin import router as digital_twin_router
from app.api.v1.resources import router as resources_router
from app.api.v1.command_centers import router as command_centers_router
from app.api.v1.facilities import router as facilities_router
from app.api.v1.admin import router as admin_router
from app.api.v1.alerts import router as alerts_router

api_v1_router = APIRouter()

# Register core health checks router
api_v1_router.include_router(health_router)

# Register legacy and skeleton domain routers to preserve existing backend system functionality
api_v1_router.include_router(system_router)
api_v1_router.include_router(auth_router)
api_v1_router.include_router(incidents_router)
api_v1_router.include_router(departments_router)
api_v1_router.include_router(cities_router)
api_v1_router.include_router(states_router)
api_v1_router.include_router(districts_router)
api_v1_router.include_router(zones_router)
api_v1_router.include_router(wards_router)
api_v1_router.include_router(dashboard_router)
api_v1_router.include_router(ai_router)
api_v1_router.include_router(resources_router)
api_v1_router.include_router(command_centers_router)
api_v1_router.include_router(facilities_router)
api_v1_router.include_router(admin_router)
api_v1_router.include_router(alerts_router)
api_v1_router.include_router(digital_twin_router)
