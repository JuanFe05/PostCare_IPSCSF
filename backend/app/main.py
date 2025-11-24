from fastapi import FastAPI
import os
from app.configuration.app.cors_config import configure_cors
from app.configuration.app.router_config import configure_routers
from app.configuration.app.startup import run_startup_tables
from app.configuration.app.exception_handlers import register_exception_handlers


def create_app():
    app = FastAPI(title="PostCare Backend")

    configure_cors(app)
    configure_routers(app)
    register_exception_handlers(app)

    # Sólo ejecutar creación de tablas si la variable RUN_STARTUP_TABLES está activada
    run_tables = os.getenv("RUN_STARTUP_TABLES", "false").lower()
    if run_tables in ("1", "true", "yes"):
        run_startup_tables()

    return app


app = create_app()
