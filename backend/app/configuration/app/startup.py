from app.configuration.app.database import Base, engine


def run_startup_tables():
    # Solo para desarrollo, NO en producción
    Base.metadata.create_all(bind=engine)
