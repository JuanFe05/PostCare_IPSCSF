FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

WORKDIR /app

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    gcc \
    default-libmysqlclient-dev \
    pkg-config \
    libssl-dev \
    freetds-dev \
    freetds-bin \
    dos2unix \
    && rm -rf /var/lib/apt/lists/*

# Copiar y instalar dependencias de Python
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copiar el código de la app
COPY . .

# Convertir formato de líneas Windows a Unix y dar permisos de ejecución
RUN dos2unix /app/entrypoint.sh && chmod +x /app/entrypoint.sh

# Exponer puerto de la app
EXPOSE 8000

# Usar entrypoint que ejecuta migraciones antes de iniciar
ENTRYPOINT ["/app/entrypoint.sh"]
