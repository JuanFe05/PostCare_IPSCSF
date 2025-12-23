from datetime import datetime, timedelta
import jwt
from app.configuration.app.config import settings


SECRET = getattr(settings, "JWT_SECRET", "SUPER_SECRET_KEY_IPSCF")
ALGORITHM = getattr(settings, "JWT_ALGORITHM", "HS256")
EXPIRE_MINUTES = getattr(settings, "JWT_EXPIRE_MINUTES", 60)


def create_token(data: dict, rol: str = None):
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(minutes=int(EXPIRE_MINUTES))

    if rol:
        payload["rol"] = rol  # ahora solo un rol

    return jwt.encode(payload, SECRET, algorithm=ALGORITHM)
