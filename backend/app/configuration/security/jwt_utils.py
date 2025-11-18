from datetime import datetime, timedelta
import jwt

SECRET = "SUPER_SECRET_KEY_IPSCF"
ALGORITHM = "HS256"
EXPIRE_MINUTES = 60


def create_token(data: dict, rol: str = None):
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(minutes=EXPIRE_MINUTES)

    if rol:
        payload["rol"] = rol  # ahora solo un rol

    return jwt.encode(payload, SECRET, algorithm=ALGORITHM)
