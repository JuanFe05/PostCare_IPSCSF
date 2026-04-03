from fastapi import FastAPI
from app.presentation.router.index import router as api_router
from app.configuration.app.config import settings


def configure_routers(app: FastAPI):
    app.include_router(api_router, prefix=settings.API_PREFIX)
