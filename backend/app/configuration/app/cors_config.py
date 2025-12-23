from fastapi.middleware.cors import CORSMiddleware
from app.configuration.app.config import settings


def configure_cors(app):
    origins = getattr(settings, "CORS_ORIGINS", ["http://localhost:41777"]) or ["http://localhost:41777"]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
