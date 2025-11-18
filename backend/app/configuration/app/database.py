import time
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.configuration.app.config import settings

Base = declarative_base()

# Engine con reintentos
MAX_RETRIES = 10
RETRY_DELAY = 5  # segundos

for attempt in range(1, MAX_RETRIES + 1):
    try:
        engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
        conn = engine.connect()
        conn.close()
        print("Conectado a MySQL")
        break
    except Exception as e:
        print(f"[Intento {attempt}/{MAX_RETRIES}] Error conectando a MySQL: {e}")
        time.sleep(RETRY_DELAY)
else:
    raise Exception("No se pudo conectar a MySQL después de varios intentos")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()