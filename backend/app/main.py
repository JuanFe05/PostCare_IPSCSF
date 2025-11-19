from fastapi import FastAPI
from app.configuration.app.cors_config import configure_cors
from app.configuration.app.router_config import configure_routers
from app.configuration.app.startup import run_startup_tables


def create_app():
    app = FastAPI(title="PostCare Backend")

    configure_cors(app)
    configure_routers(app)
    run_startup_tables()   # solo en desarrollo

    return app


app = create_app()
