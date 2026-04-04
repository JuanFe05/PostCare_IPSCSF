# ── Stage 1: builder ────────────────────────────────────────────────────────
FROM python:3.11-slim-bookworm AS builder

ENV PYTHONUNBUFFERED=1

WORKDIR /build

# Deps de compilación (solo en esta etapa)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    default-libmysqlclient-dev \
    pkg-config \
    libssl-dev \
    freetds-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --upgrade pip --no-cache-dir && \
    pip install --no-cache-dir --prefix=/install -r requirements.txt

# ── Stage 2: runtime ─────────────────────────────────────────────────────────
FROM python:3.11-slim-bookworm

ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

# Solo libs de runtime (sin herramientas de compilación)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libmariadb3 \
    libsybdb5 \
    && rm -rf /var/lib/apt/lists/*

# Copiar paquetes instalados desde el builder
COPY --from=builder /install /usr/local

WORKDIR /app

COPY . .

# Normalizar fin de línea y dar permisos (sin dos2unix)
RUN sed -i 's/\r$//' /app/docker-entrypoint.sh && chmod +x /app/docker-entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/app/docker-entrypoint.sh"]
