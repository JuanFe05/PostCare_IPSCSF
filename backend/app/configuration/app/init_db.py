import pkgutil
import importlib
from app.configuration.app.database import Base, engine
import app.persistence.entity


def init_db():
    # Importar dinámicamente todas las entidades
    found = []
    for loader, module_name, is_pkg in pkgutil.iter_modules(app.persistence.entity.__path__):
        found.append(module_name)
        try:
            importlib.import_module(f"app.persistence.entity.{module_name}")
            print(f"Imported entity module: app.persistence.entity.{module_name}")
        except Exception as e:
            print(f"Error importing module app.persistence.entity.{module_name}: {e}")

    print(f"Entity modules discovered: {found}")

    # Crear todas las tablas
    try:
        Base.metadata.create_all(bind=engine)
        print("Todas las tablas creadas (create_all ejecutado)")
    except Exception as e:
        print(f"Error ejecutando create_all: {e}")
