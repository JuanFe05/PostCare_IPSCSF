from fastapi import FastAPI
import os
from contextlib import asynccontextmanager
from app.configuration.app.rate_limiter import limiter
from app.configuration.app.cors_config import configure_cors
from app.configuration.app.router_config import configure_routers
from app.configuration.app.startup import run_startup_tables
from app.configuration.app.exception_handlers import register_exception_handlers
from app.configuration.app.config import settings
from app.service.implementation.scheduler_service import SchedulerService


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("[APP] Iniciando aplicación...")
    SchedulerService.start()
    yield
    print("[APP] Cerrando aplicación...")
    SchedulerService.shutdown()


def create_app():
    app = FastAPI(
        title="PostCare Backend",
        lifespan=lifespan
    )

    configure_cors(app)

    # Sólo ejecutar creación de tablas si la variable RUN_STARTUP_TABLES está activada
    # Debe ejecutarse antes de importar/configurar routers, porque los routers/controllers
    # importan servicios/entidades y eso puede inicializar mappers prematuramente.
    run_tables = os.getenv("RUN_STARTUP_TABLES", "false").lower()
    if run_tables in ("1", "true", "yes"):
        run_startup_tables()

    configure_routers(app)
    register_exception_handlers(app)

    return app


app = create_app()
