from pydantic import BaseModel
from typing import Optional


class ServicioCreateDto(BaseModel):
    nombre: str
    descripcion: Optional[str] = None


class ServicioUpdateDto(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None


class ServicioResponseDto(BaseModel):
    id: int
    nombre: str
    descripcion: Optional[str] = None

    class Config:
        orm_mode = True
