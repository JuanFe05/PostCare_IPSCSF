from fastapi import FastAPI
from app.presentation.router.index import router as api_router


def configure_routers(app: FastAPI):
    app.include_router(api_router)
