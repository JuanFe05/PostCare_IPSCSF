from pydantic import BaseModel, EmailStr


class UserCreateDto(BaseModel):
    username: str
    password: str
    email: EmailStr
    role_id: int  # ID del rol que se asignará


class UserResponseDto(BaseModel):
    id: int
    username: str
    email: str
    estado: bool
    role_id: int  # opcional, mostrar el rol asignado

    class Config:
        orm_mode = True


class UserUpdateDto(BaseModel):
    username: str | None = None
    password: str | None = None
    email: EmailStr | None = None
    estado: bool | None = None
    role_id: int | None = None  # permitir cambiar rol
