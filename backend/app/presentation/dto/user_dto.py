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
