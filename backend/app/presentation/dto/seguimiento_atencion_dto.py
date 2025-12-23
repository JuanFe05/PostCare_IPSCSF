from pydantic import BaseModel


class SeguimientoAtencionCreateDto(BaseModel):
    nombre: str
    descripcion: str | None = None


class SeguimientoAtencionUpdateDto(BaseModel):
    nombre: str | None = None
    descripcion: str | None = None


class SeguimientoAtencionResponseDto(BaseModel):
    id: int
    nombre: str
    descripcion: str | None = None

    class Config:
        orm_mode = True
