from datetime import datetime, timedelta
import jwt

SECRET = "SUPER_SECRET_KEY_IPSCF"
ALGORITHM = "HS256"
EXPIRE_MINUTES = 60


def create_token(data: dict, roles: list[str] = None):
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(minutes=EXPIRE_MINUTES)
    if roles:
        payload["roles"] = roles
    return jwt.encode(payload, SECRET, algorithm=ALGORITHM)
