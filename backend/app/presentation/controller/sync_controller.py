from fastapi import APIRouter, Depends, HTTPException
from app.configuration.app.database import get_db
from sqlalchemy.orm import Session
from app.presentation.dto.sync_dto import SyncRequestDto, SyncResponseDto, SyncClinicaResponseDto
from app.service.implementation.sync_service_impl import SyncService
from app.service.implementation.sync_clinica_service import SyncClinicaService
from app.configuration.security.security_dependencies import get_current_admin

router = APIRouter(prefix="/sync", dependencies=[Depends(get_current_admin)])


@router.post("/external-db", response_model=SyncResponseDto)
def sync_from_external_database(
    data: SyncRequestDto,
    db: Session = Depends(get_db)
):
    """
    Sincroniza pacientes y atenciones desde una base de datos externa SQL Server.
    
    Requiere rol de ADMINISTRADOR.
    
    La URL de conexión externa debe tener formato:
    mssql+pymssql://usuario:password@host:puerto/nombre_db
    
    Ejemplo:
    mssql+pymssql://sa:MyPassword123@192.168.1.100:1433/HospitalDB
    
    Las queries deben retornar columnas que coincidan con los campos de las entidades.
    """
    try:
        result = SyncService.sync_from_external_db(
            db_local=db,
            external_db_url=data.external_db_url,
            query_pacientes=data.query_pacientes,
            query_atenciones=data.query_atenciones
        )
        
        return SyncResponseDto(
            success=result["success"],
            pacientes=result["pacientes"],
            atenciones=result["atenciones"],
            mensaje="Sincronización completada exitosamente"
        )
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error en sincronización: {str(e)}")


@router.post("/clinica-florida", response_model=SyncClinicaResponseDto)
def sync_from_clinica_florida(
    db: Session = Depends(get_db),
    external_db_url: str = None
):
    """
    Sincroniza admisiones del día anterior desde bdClinicaFlorida_produccion_informes.
    
    Requiere rol de ADMINISTRADOR.
    
    Proceso automático:
    1. Conecta a SQL Server: 192.0.0.13\\bdClinicaFlorida_produccion_informes:1433
    2. Obtiene admisiones de ayer (tipos empresa 4 y 5)
    3. Crea/actualiza pacientes
    4. Crea/actualiza atenciones
    
    Parámetros opcionales:
    - external_db_url: URL de conexión externa (usa default si no se provee)
    """
    try:
        result = SyncClinicaService.sync_admisiones_dia_anterior(
            db_local=db,
            external_db_url=external_db_url
        )
        
        return SyncClinicaResponseDto(**result)
        
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error sincronizando desde Clínica Florida: {str(e)}"
        )
