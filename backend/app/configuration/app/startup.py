from app.configuration.app.init_db import init_db
import subprocess
import sys


def run_startup_tables():
    # Solo para desarrollo, NO en producción
    # init_db() importa dinámicamente las entidades y crea todas las tablas
    init_db()
    
    # Ejecutar migraciones de Alembic automáticamente
    try:
        print("Ejecutando migraciones de Alembic...")
        result = subprocess.run(
            ["alembic", "upgrade", "head"],
            capture_output=True,
            text=True,
            check=False
        )
        
        if result.returncode == 0:
            print("Migraciones de Alembic ejecutadas exitosamente")
            print(result.stdout)
        else:
            print(f"Error ejecutando migraciones de Alembic:")
            print(result.stderr)
            print("Continuando con el inicio de la aplicación...")
            
    except Exception as e:
        print(f"Error ejecutando alembic upgrade: {e}")
        print("Continuando con el inicio de la aplicación...")
