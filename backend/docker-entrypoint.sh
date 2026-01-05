#!/bin/bash
set -e

echo "Esperando a que MySQL esté listo..."
# Esperar a que MySQL esté disponible usando un script Python simple
until python -c "
import MySQLdb
import os
import sys
try:
    conn = MySQLdb.connect(
        host=os.getenv('MYSQL_HOST'),
        port=int(os.getenv('MYSQL_PORT', 3306)),
        user=os.getenv('MYSQL_USER'),
        passwd=os.getenv('MYSQL_PASSWORD'),
        db=os.getenv('MYSQL_DATABASE')
    )
    conn.close()
    sys.exit(0)
except Exception as e:
    sys.exit(1)
" 2>/dev/null; do
  echo "MySQL no está listo aún - esperando..."
  sleep 2
done

echo "MySQL está listo. Ejecutando migraciones de Alembic..."
alembic upgrade head

echo "Migraciones completadas. Iniciando aplicación..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
