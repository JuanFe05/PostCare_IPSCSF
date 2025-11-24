from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class PacienteDto(BaseModel):
    id: int
    id_tipo_documento: int
    primer_nombre: str
    segundo_nombre: Optional[str] = None
    primer_apellido: str
    segundo_apellido: Optional[str] = None
    telefono_uno: Optional[str] = None
    telefono_dos: Optional[str] = None
    email: Optional[str] = None


class AtencionDto(BaseModel):
    id: int
    id_paciente: int
    id_empresa: int
    id_estado_atencion: int
    id_seguimiento_atencion: Optional[int] = None
    fecha_ingreso: Optional[datetime] = None
    id_usuario: Optional[int] = None
    fecha_modificacion: Optional[datetime] = None
    observacion: Optional[str] = None


class AtencionPacienteCreateDto(BaseModel):
    atencion: AtencionDto
    paciente: PacienteDto


class AtencionPacienteResponseDto(BaseModel):
    atencion_id: int
    paciente_id: int

    class Config:
        orm_mode = True
