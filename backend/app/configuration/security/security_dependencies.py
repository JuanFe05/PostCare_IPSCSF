from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
import jwt
from app.configuration.app.config import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

SECRET = getattr(settings, "JWT_SECRET", "SUPER_SECRET_KEY_IPSCF")
ALGORITHM = getattr(settings, "JWT_ALGORITHM", "HS256")


def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET, algorithms=[ALGORITHM])
        return payload
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Token inválido")


def get_current_admin(current_user: dict = Depends(get_current_user)):
    rol = current_user.get("rol")

    if rol != "ADMINISTRADOR":
        raise HTTPException(
            status_code=403,
            detail="No autorizado. Requiere rol ADMINISTRADOR"
        )

    return current_user


def get_current_user_with_roles(current_user: dict = Depends(get_current_user)):
    """
    Permite acceso a usuarios con roles: ADMINISTRADOR, ASESOR, FACTURADOR
    Útil para endpoints de lectura de catálogos que necesitan estos roles.
    """
    rol = current_user.get("rol", "").upper()
    
    allowed_roles = ["ADMINISTRADOR", "ASESOR", "FACTURADOR"]
    
    if rol not in allowed_roles:
        raise HTTPException(
            status_code=403,
            detail=f"No autorizado. Requiere uno de estos roles: {', '.join(allowed_roles)}"
        )
    
    return current_user
