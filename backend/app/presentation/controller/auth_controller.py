from fastapi import APIRouter, Depends, HTTPException
from app.presentation.dto.auth_dto import LoginDto, TokenResponse
from app.configuration.security.password_utils import verify_password
from app.configuration.security.jwt_utils import create_token
from app.persistence.repository.user_repository import UserRepository
from app.configuration.app.database import SessionLocal

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/login", response_model=TokenResponse)
def login(data: LoginDto):
    db = SessionLocal()
    user_repo = UserRepository()
    user = user_repo.get_by_username(db, data.username)
    db.close()

    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")

    token = create_token({"sub": user.username, "id": user.id})

    return TokenResponse(access_token=token)
