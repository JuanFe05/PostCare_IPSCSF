from pydantic import BaseModel
from typing import Optional, List


class SyncRequestDto(BaseModel):
    """DTO para solicitar sincronización desde BD externa SQL Server"""
    external_db_url: str  # Format: mssql+pymssql://user:pass@host:port/database
    query_pacientes: Optional[str] = "SELECT * FROM pacientes"
    query_atenciones: Optional[str] = "SELECT * FROM atenciones"


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
    registros_procesados: int
    pacientes: dict
    atenciones: dict
    errores: List[str] = []
    
    class Config:
        from_attributes = True
