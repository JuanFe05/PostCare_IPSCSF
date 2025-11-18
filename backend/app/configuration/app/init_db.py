import pkgutil
import importlib
from app.configuration.app.database import Base, engine
import app.persistence.entity


def init_db():
    # Importar dinámicamente todas las entidades
    for loader, module_name, is_pkg in pkgutil.iter_modules(app.persistence.entity.__path__):
        importlib.import_module(f"app.persistence.entity.{module_name}")

    # Crear todas las tablas
    Base.metadata.create_all(bind=engine)
    print("Todas las tablas creadas")
