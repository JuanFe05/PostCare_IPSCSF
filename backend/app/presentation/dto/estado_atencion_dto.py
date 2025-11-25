from pydantic import BaseModel


class EstadoAtencionCreateDto(BaseModel):
    nombre: str
    descripcion: str | None = None


class EstadoAtencionUpdateDto(BaseModel):
    nombre: str | None = None
    descripcion: str | None = None


class EstadoAtencionResponseDto(BaseModel):
    id: int
    nombre: str
    descripcion: str | None = None

    class Config:
        orm_mode = True
