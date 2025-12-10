from pydantic import BaseModel, field_validator
from typing import Optional


class PacienteCreateDto(BaseModel):
    """DTO para crear un paciente"""
    id: str
    id_tipo_documento: int
    primer_nombre: str
    segundo_nombre: Optional[str] = None
    primer_apellido: str
    segundo_apellido: Optional[str] = None
    telefono_uno: Optional[str] = None
    telefono_dos: Optional[str] = None
    email: Optional[str] = None

    @field_validator('id')
    @classmethod
    def validar_id(cls, v):
        if not v or not v.strip():
            raise ValueError('El ID del paciente es requerido')
        return v.strip()

    @field_validator('primer_nombre', 'primer_apellido')
    @classmethod
    def validar_campos_requeridos(cls, v):
        if not v or not v.strip():
            raise ValueError('Este campo es requerido')
        return v.strip()


class PacienteUpdateDto(BaseModel):
    """DTO para actualizar un paciente"""
    id_tipo_documento: Optional[int] = None
    primer_nombre: Optional[str] = None
    segundo_nombre: Optional[str] = None
    primer_apellido: Optional[str] = None
    segundo_apellido: Optional[str] = None
    telefono_uno: Optional[str] = None
    telefono_dos: Optional[str] = None
    email: Optional[str] = None


class PacienteResponseDto(BaseModel):
    """DTO para respuesta de paciente"""
    id: str
    id_tipo_documento: int
    tipo_documento_codigo: Optional[str] = None
    tipo_documento_descripcion: Optional[str] = None
    primer_nombre: str
    segundo_nombre: Optional[str] = None
    primer_apellido: str
    segundo_apellido: Optional[str] = None
    telefono_uno: Optional[str] = None
    telefono_dos: Optional[str] = None
    email: Optional[str] = None
    nombre_completo: Optional[str] = None

    class Config:
        from_attributes = True
