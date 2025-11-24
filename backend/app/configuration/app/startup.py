from app.configuration.app.init_db import init_db


def run_startup_tables():
    # Solo para desarrollo, NO en producción
    # init_db() importa dinámicamente las entidades y crea todas las tablas
    init_db()
