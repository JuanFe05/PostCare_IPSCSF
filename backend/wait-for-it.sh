#!/bin/sh

HOST="$1"
PORT="$2"

echo ">> Esperando a MySQL en $HOST:$PORT..."

while ! nc -z "$HOST" "$PORT"; do
  sleep 2
  echo ">> Aún no disponible: $HOST:$PORT"
done

echo ">> MySQL listo! Ejecutando aplicación..."
shift 2
exec "$@"
