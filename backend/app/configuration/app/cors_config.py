from fastapi.middleware.cors import CORSMiddleware
import logging
import os
from app.configuration.app.config import settings

try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    # Si no está instalado python-dotenv, seguimos leyendo desde las variables de entorno del sistema.
    pass


def _parse_origins(env_value: str):
    if not env_value:
        return []
    return [o.strip() for o in env_value.split(",") if o.strip()]


def configure_cors(app):
    # Permitir orígenes específicos por motivos de seguridad.
    # En desarrollo por defecto: http://localhost:41777, http://127.0.0.1:41777.
    # En producción: use la variable de entorno CORS_ORIGINS (separados por comas).
    default_origins = [
        "http://localhost:41777",
        "http://127.0.0.1:41777",
    ]

    env_origins = settings.get_cors_origins_list()

    # Combinar manteniendo el orden y sin duplicados
    origins = []
    seen = set()
    for o in default_origins + env_origins:
        if o not in seen:
            origins.append(o)
            seen.add(o)
    # Loggear configuración para depuración (se verá en los logs del contenedor)
    logger = logging.getLogger("postcare.cors")
    logger.info("CORS origins configured: %s", origins)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allow_headers=["*"],
    )
