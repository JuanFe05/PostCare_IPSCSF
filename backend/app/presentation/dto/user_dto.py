from pydantic import BaseModel, EmailStr


class UserCreateDto(BaseModel):
    username: str
    password: str
    email: EmailStr


class UserResponseDto(BaseModel):
    id: int
    username: str
    email: str
    estado: bool

    class Config:
        orm_mode = True


class UserUpdateDto(BaseModel):
    username: str | None = None
    password: str | None = None
    email: EmailStr | None = None
    estado: bool | None = None
