from fastapi import APIRouter, Depends, HTTPException
from app.configuration.app.database import get_db
from sqlalchemy.orm import Session
from app.presentation.dto.sync_dto import SyncClinicaResponseDto
from app.service.implementation.sync_clinica_service import SyncClinicaService
from app.configuration.security.security_dependencies import get_current_admin

router = APIRouter(prefix="/sync", dependencies=[Depends(get_current_admin)])

# Endpoint genérico deshabilitado - falta implementar SyncService
# @router.post("/external-db", response_model=SyncResponseDto)
# def sync_from_external_database(data: SyncRequestDto, db: Session = Depends(get_db)):
#     pass


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
