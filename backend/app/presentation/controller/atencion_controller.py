from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from app.configuration.app.database import get_db
from app.configuration.security.security_dependencies import get_current_user
from app.presentation.dto.atencion_paciente_dto import (
    AtencionCreateDto,
    AtencionUpdateDto,
    AtencionDetalleResponseDto,
    AtencionListResponseDto,
    AtencionConPacienteCreateDto,
)
from app.service.implementation.atencion_service import AtencionService
from app.service.implementation.lock_service import get_lock_service
from app.service.implementation.websocket_manager import get_websocket_manager


router = APIRouter(prefix="/atenciones", dependencies=[Depends(get_current_user)])
lock_service = get_lock_service()
ws_manager = get_websocket_manager()


# ==================== NUEVOS ENDPOINTS ====================

@router.get("", response_model=List[AtencionListResponseDto], tags=["Atenciones"])
def get_all_atenciones(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100000),
    fecha: Optional[date] = Query(None, description="Filtrar por fecha (YYYY-MM-DD)"),
    fecha_inicio: Optional[date] = Query(None, description="Fecha inicio del rango (YYYY-MM-DD)"),
    fecha_fin: Optional[date] = Query(None, description="Fecha fin del rango (YYYY-MM-DD)"),
    db: Session = Depends(get_db)
):
    """Obtiene todas las atenciones con información resumida"""
    try:
        return AtencionService.get_all_atenciones(
            db, 
            skip=skip, 
            limit=limit, 
            fecha=fecha,
            fecha_inicio=fecha_inicio,
            fecha_fin=fecha_fin
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo atenciones: {str(e)}")


@router.get("/{atencion_id}", response_model=AtencionDetalleResponseDto, tags=["Atenciones"])
def get_atencion_by_id(
    atencion_id: str,
    db: Session = Depends(get_db)
):
    """
    Obtiene una atención por ID con toda la información:
    - Datos de la atención
    - Datos completos del paciente
    - Datos de la empresa
    - Estado y seguimiento
    - Lista de servicios
    """
    atencion = AtencionService.get_atencion_by_id(db, atencion_id)
    if not atencion:
        raise HTTPException(status_code=404, detail="Atención no encontrada")
    return atencion


@router.get("/paciente/{paciente_id}", response_model=List[AtencionDetalleResponseDto], tags=["Atenciones"])
def get_atenciones_by_paciente(
    paciente_id: str,
    db: Session = Depends(get_db)
):
    """Obtiene todas las atenciones de un paciente específico"""
    try:
        return AtencionService.get_atenciones_by_paciente(db, paciente_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo atenciones del paciente: {str(e)}")


@router.get("/empresa/{empresa_id}", response_model=List[AtencionListResponseDto], tags=["Atenciones"])
def get_atenciones_by_empresa(
    empresa_id: int,
    db: Session = Depends(get_db)
):
    """Obtiene todas las atenciones de una empresa específica"""
    try:
        return AtencionService.get_atenciones_by_empresa(db, empresa_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo atenciones de la empresa: {str(e)}")


@router.get("/estado/{estado_id}", response_model=List[AtencionListResponseDto], tags=["Atenciones"])
def get_atenciones_by_estado(
    estado_id: int,
    db: Session = Depends(get_db)
):
    """Obtiene todas las atenciones por estado"""
    try:
        return AtencionService.get_atenciones_by_estado(db, estado_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo atenciones por estado: {str(e)}")


@router.get("/buscar", response_model=List[AtencionListResponseDto], tags=["Atenciones"])
def search_atenciones(
    search: Optional[str] = Query(None, description="Término de búsqueda (ID, nombre paciente)"),
    empresa_id: Optional[int] = Query(None, description="Filtrar por empresa"),
    estado_id: Optional[int] = Query(None, description="Filtrar por estado"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db)
):
    """Busca atenciones con filtros opcionales"""
    try:
        return AtencionService.search_atenciones(
            db=db,
            search_term=search,
            empresa_id=empresa_id,
            estado_id=estado_id,
            skip=skip,
            limit=limit
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error buscando atenciones: {str(e)}")


@router.post("/con-paciente", response_model=AtencionDetalleResponseDto, tags=["Atenciones"], status_code=201)
async def create_atencion_con_paciente(
    data: AtencionConPacienteCreateDto,
    db: Session = Depends(get_db)
):
    """
    Crea una nueva atención junto con el paciente.
    
    Si el paciente ya existe, solo se crea la atención.
    Si el paciente no existe, se crea primero y luego la atención.
    """
    try:
        result = AtencionService.create_atencion_con_paciente(db, data)
        # Emitir evento WebSocket
        await ws_manager.send_event("create", "atenciones", result.model_dump(mode='json') if hasattr(result, 'model_dump') else dict(result))
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creando atención con paciente: {str(e)}")


@router.post("", response_model=AtencionDetalleResponseDto, tags=["Atenciones"], status_code=201)
async def create_atencion(
    atencion_data: AtencionCreateDto,
    db: Session = Depends(get_db)
):
    """
    Crea una nueva atención.
    
    El paciente debe existir previamente.
    Se pueden asignar servicios en la creación.
    """
    try:
        result = AtencionService.create_atencion(db, atencion_data)
        # Emitir evento WebSocket
        await ws_manager.send_event("create", "atenciones", result.model_dump(mode='json') if hasattr(result, 'model_dump') else dict(result))
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creando atención: {str(e)}")


@router.put("/{atencion_id}", response_model=AtencionDetalleResponseDto, tags=["Atenciones"])
async def update_atencion(
    atencion_id: str,
    atencion_data: AtencionUpdateDto,
    db: Session = Depends(get_db)
):
    """
    Actualiza una atención existente.
    
    Se pueden actualizar todos los campos incluyendo los servicios.
    """
    atencion = AtencionService.update_atencion(db, atencion_id, atencion_data)
    if not atencion:
        raise HTTPException(status_code=404, detail="Atención no encontrada")
    # Emitir evento WebSocket
    await ws_manager.send_event("update", "atenciones", atencion.model_dump(mode='json') if hasattr(atencion, 'model_dump') else dict(atencion))
    return atencion


@router.delete("/{atencion_id}", tags=["Atenciones"], status_code=204)
async def delete_atencion(
    atencion_id: str,
    db: Session = Depends(get_db)
):
    """Elimina una atención y sus servicios asociados"""
    success = AtencionService.delete_atencion(db, atencion_id)
    if not success:
        raise HTTPException(status_code=404, detail="Atención no encontrada")
    # Emitir evento WebSocket
    await ws_manager.send_event("delete", "atenciones", {"id_atencion": atencion_id})
    return None


# --- Lock endpoints para control de concurrencia de edición ---
@router.post("/{atencion_id}/lock", tags=["Atenciones"])
def acquire_lock(atencion_id: str, current_user: dict = Depends(get_current_user)):
    try:
        locker = {'id': current_user.get('id'), 'username': current_user.get('sub') or current_user.get('username')}
        res = lock_service.acquire(str(atencion_id), locker)
        if res.get('ok'):
            return {'locked': True, 'lockedBy': res.get('lockedBy')}
        else:
            return JSONResponse(status_code=409, content={'locked': True, 'lockedBy': res.get('lockedBy')})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{atencion_id}/lock", tags=["Atenciones"])
def status_lock(atencion_id: str):
    try:
        st = lock_service.status(str(atencion_id))
        return st
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{atencion_id}/lock", tags=["Atenciones"])
def release_lock(atencion_id: str, current_user: dict = Depends(get_current_user)):
    try:
        locker_id = current_user.get('id')
        ok = lock_service.release(str(atencion_id), locker_id)
        if not ok:
            raise HTTPException(status_code=403, detail="Solo el dueño del lock puede liberarlo")
        return {'released': True}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
