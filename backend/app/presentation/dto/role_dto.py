from pydantic import BaseModel


class RoleCreateDto(BaseModel):
    nombre: str
    descripcion: str | None = None


class RoleUpdateDto(BaseModel):
    nombre: str | None = None
    descripcion: str | None = None


class RoleResponseDto(BaseModel):
    id: int
    nombre: str
    descripcion: str | None = None

    class Config:
        orm_mode = True
