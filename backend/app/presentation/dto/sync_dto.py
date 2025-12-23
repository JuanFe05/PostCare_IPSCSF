from pydantic import BaseModel, field_validator
from typing import Optional, List
from datetime import date


class SyncRequestDto(BaseModel):
    """DTO para solicitar sincronización desde BD externa SQL Server"""
    external_db_url: str  # Format: mssql+pymssql://user:pass@host:port/database
    query_pacientes: Optional[str] = "SELECT * FROM pacientes"
    query_atenciones: Optional[str] = "SELECT * FROM atenciones"


class SyncRangoFechasDto(BaseModel):
    """DTO para solicitar sincronización por rango de fechas"""
    fecha_inicio: date
    fecha_fin: date
    external_db_url: Optional[str] = None
    
    @field_validator('fecha_fin')
    @classmethod
    def validar_rango_fechas(cls, fecha_fin, info):
        if 'fecha_inicio' in info.data and fecha_fin < info.data['fecha_inicio']:
            raise ValueError('La fecha de fin no puede ser anterior a la fecha de inicio')
        return fecha_fin


class SyncResponseDto(BaseModel):
    """DTO para respuesta de sincronización"""
    success: bool
    pacientes: dict
    atenciones: dict
    mensaje: Optional[str] = None

    class Config:
        from_attributes = True


class SyncClinicaResponseDto(BaseModel):
    """DTO para respuesta de sincronización desde Clínica Florida"""
    success: bool
    fecha_sincronizacion: str
    fecha_inicio: Optional[str] = None
    fecha_fin: Optional[str] = None
    registros_procesados: int
    pacientes: dict
    atenciones: dict
    errores: List[str] = []
    
    class Config:
        from_attributes = True
