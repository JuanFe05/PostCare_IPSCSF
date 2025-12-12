from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class ServicioAtencionDto(BaseModel):
    """Servicio asociado a una atención"""
    id_servicio: int
    nombre_servicio: str

    class Config:
        from_attributes = True


class AtencionCreateDto(BaseModel):
    """DTO para crear una nueva atención"""
    id: Optional[str] = None  # Opcional, puede generarse automáticamente
    id_paciente: str
    id_empresa: int
    id_estado_atencion: int
    id_seguimiento_atencion: Optional[int] = None
    fecha_ingreso: Optional[datetime] = None
    id_usuario: Optional[int] = None  # Usuario que registra
    observacion: Optional[str] = None
    servicios: Optional[List[int]] = []  # Lista de IDs de servicios

    class Config:
        from_attributes = True


class AtencionUpdateDto(BaseModel):
    """DTO para actualizar una atención existente"""
    id_empresa: Optional[int] = None
    id_estado_atencion: Optional[int] = None
    id_seguimiento_atencion: Optional[int] = None
    fecha_ingreso: Optional[datetime] = None
    id_usuario: Optional[int] = None  # Usuario que modifica
    observacion: Optional[str] = None
    servicios: Optional[List[int]] = None  # Lista de IDs de servicios
    # Campos del paciente que se pueden actualizar
    # Campos del paciente que se pueden actualizar
    id_paciente: Optional[str] = None
    id_tipo_documento: Optional[int] = None
    telefono_uno: Optional[str] = None
    telefono_dos: Optional[str] = None
    email: Optional[str] = None
    primer_nombre: Optional[str] = None
    segundo_nombre: Optional[str] = None
    primer_apellido: Optional[str] = None
    segundo_apellido: Optional[str] = None

    class Config:
        from_attributes = True


class AtencionDetalleResponseDto(BaseModel):
    """DTO completo con toda la información de la atención"""
    # Datos de la atención
    id_atencion: str
    fecha_atencion: datetime
    observacion: Optional[str] = None
    
    # Datos del paciente
    id_paciente: str
    nombre_paciente: str  # Concatenado: primer_nombre segundo_nombre primer_apellido segundo_apellido
    telefono_uno: Optional[str] = None
    telefono_dos: Optional[str] = None
    email: Optional[str] = None
    
    # Datos de la empresa
    id_empresa: int
    nombre_empresa: str
    
    # Datos del estado
    id_estado_atencion: int
    nombre_estado_atencion: str
    
    # Datos del seguimiento
    id_seguimiento_atencion: Optional[int] = None
    nombre_seguimiento_atencion: Optional[str] = None
    
    # Servicios
    servicios: List[ServicioAtencionDto] = []

    class Config:
        from_attributes = True


class AtencionListResponseDto(BaseModel):
    """DTO para lista de atenciones"""
    id_atencion: str
    fecha_atencion: datetime
    
    # Datos del paciente
    id_paciente: str
    nombre_paciente: str
    telefono_uno: Optional[str] = None
    telefono_dos: Optional[str] = None
    email: Optional[str] = None
    
    # Datos de la empresa
    id_empresa: int
    nombre_empresa: str
    
    # Datos del estado
    id_estado_atencion: int
    nombre_estado_atencion: str
    
    # Datos del seguimiento
    id_seguimiento_atencion: Optional[int] = None
    nombre_seguimiento_atencion: Optional[str] = None
    
    # Servicios
    servicios: List[ServicioAtencionDto] = []  # Agregado: servicios en lista

    class Config:
        from_attributes = True


# Mantener compatibilidad con código existente
class PacienteDto(BaseModel):
    id: str
    id_tipo_documento: int
    primer_nombre: str
    segundo_nombre: Optional[str] = None
    primer_apellido: str
    segundo_apellido: Optional[str] = None
    telefono_uno: Optional[str] = None
    telefono_dos: Optional[str] = None
    email: Optional[str] = None


class AtencionDto(BaseModel):
    id: str
    id_paciente: str
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
    atencion_id: str
    paciente_id: str

    class Config:
        orm_mode = True


class AtencionConPacienteCreateDto(BaseModel):
    """DTO para crear atención y paciente simultáneamente"""
    # Datos del paciente
    id_paciente: str
    id_tipo_documento: int
    primer_nombre: str
    segundo_nombre: Optional[str] = None
    primer_apellido: str
    segundo_apellido: Optional[str] = None
    telefono_uno: Optional[str] = None
    telefono_dos: Optional[str] = None
    email: Optional[str] = None
    
    # Datos de la atención
    id_atencion: str  # ID de la atención (debe incluir la T al principio)
    id_empresa: int
    id_estado_atencion: int
    id_seguimiento_atencion: Optional[int] = None
    fecha_ingreso: Optional[datetime] = None
    id_usuario: Optional[int] = None  # Usuario que registra
    observacion: Optional[str] = None
    servicios: Optional[List[int]] = []  # Lista de IDs de servicios

    class Config:
        from_attributes = True
