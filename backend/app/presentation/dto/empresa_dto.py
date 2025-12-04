from pydantic import BaseModel
from typing import Optional


class EmpresaCreateDto(BaseModel):
    id: Optional[int] = None
    id_tipo_empresa: int
    nombre: str


class EmpresaUpdateDto(BaseModel):
    id_tipo_empresa: Optional[int] = None
    nombre: Optional[str] = None


class EmpresaResponseDto(BaseModel):
    id: int
    id_tipo_empresa: int
    nombre: str

    class Config:
        orm_mode = True
