#!/bin/bash
set -e

echo "Esperando a que MySQL esté listo..."
# Esperar a que MySQL esté disponible
until python -c "from app.configuration.app.database import engine; engine.connect()" 2>/dev/null; do
  echo "MySQL no está listo aún - esperando..."
  sleep 2
done

echo "MySQL está listo. Ejecutando migraciones de Alembic..."
alembic upgrade head

echo "Migraciones completadas. Iniciando aplicación..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
