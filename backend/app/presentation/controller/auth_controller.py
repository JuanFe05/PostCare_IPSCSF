from fastapi import APIRouter, HTTPException, Request
from app.presentation.dto.auth_dto import LoginDto, TokenResponse
from app.configuration.security.password_utils import verify_password
from app.configuration.security.jwt_utils import create_token
from app.persistence.repository.user_repository import UserRepository
from app.persistence.repository.user_role_repository import UserRoleRepository
from app.configuration.app.database import SessionLocal
from app.configuration.app.rate_limiter import limiter

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/login", response_model=TokenResponse)
@limiter.limit("5/minute")  # Max 5 login attempts per minute per IP
def login(request: Request, data: LoginDto):
    db = SessionLocal()

    user_repo = UserRepository()
    user = user_repo.get_by_username(db, data.username)

    # Validación de credenciales
    if not user or not verify_password(data.password, user.password_hash):
        db.close()
        raise HTTPException(status_code=401, detail="Credenciales inválidas")

    # Verificar que el usuario esté activo
    if hasattr(user, 'estado') and not user.estado:
        db.close()
        raise HTTPException(status_code=403, detail="Usuario inactivo")

    # Obtener rol del usuario (SOLO UN ROL)
    user_role_repo = UserRoleRepository()
    role_rel = user_role_repo.get_role_of_user(db, user.id)

    if not role_rel:
        db.close()
        raise HTTPException(status_code=401, detail="El usuario no tiene un rol asignado")

    rol = role_rel.rol.nombre  # <--- Rol único

    db.close()

    # Crear token con un único rol
    token = create_token(
        {"sub": user.username, "id": user.id, "rol": rol}
    )

    return TokenResponse(access_token=token)
