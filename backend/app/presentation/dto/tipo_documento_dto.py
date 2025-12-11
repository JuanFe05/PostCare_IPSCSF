from pydantic import BaseModel
from typing import Optional


class TipoDocumentoResponseDto(BaseModel):
    """DTO para respuesta de tipo de documento"""
    id: int
    siglas: str
    descripcion: Optional[str] = None

    class Config:
        from_attributes = True
