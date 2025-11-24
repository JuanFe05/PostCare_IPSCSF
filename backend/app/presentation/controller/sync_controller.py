from fastapi import APIRouter, Depends, HTTPException
from app.configuration.app.database import get_db
from sqlalchemy.orm import Session
from app.presentation.dto.sync_dto import SyncRequestDto, SyncResponseDto
from app.service.implementation.sync_service_impl import SyncService
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
