from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List, Optional

from app.configuration.app.database import get_db
from app.configuration.security.security_dependencies import get_current_user
from app.presentation.dto.paciente_dto import (
    PacienteCreateDto,
    PacienteUpdateDto,
    PacienteResponseDto
)
from app.service.implementation.paciente_service import PacienteService
from app.service.implementation.lock_service import get_lock_service
from app.service.implementation.websocket_manager import get_websocket_manager


router = APIRouter(prefix="/pacientes", dependencies=[Depends(get_current_user)])
lock_service = get_lock_service()
ws_manager = get_websocket_manager()


@router.get("", response_model=List[PacienteResponseDto], tags=["Pacientes"])
def get_all_pacientes(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    search: Optional[str] = Query(None, description="Búsqueda por ID, nombre o apellido"),
    db: Session = Depends(get_db)
):
    """
    Obtiene todos los pacientes con opción de búsqueda.
    
    - **skip**: Número de registros a omitir (paginación)
    - **limit**: Número máximo de registros a retornar
    - **search**: Término de búsqueda (ID, nombre o apellido)
    """
    try:
        if search:
            pacientes = PacienteService.search(db, search, skip, limit)
        else:
            pacientes = PacienteService.get_all(db, skip, limit)
        
        # Mapear a DTO con información adicional
        return [_map_to_response_dto(p) for p in pacientes]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo pacientes: {str(e)}")


@router.get("/{paciente_id}", response_model=PacienteResponseDto, tags=["Pacientes"])
def get_paciente_by_id(
    paciente_id: str,
    db: Session = Depends(get_db)
):
    """
    Obtiene un paciente por su ID.
    
    - **paciente_id**: ID del paciente (número de documento)
    """
    paciente = PacienteService.get_by_id(db, paciente_id)
    if not paciente:
        raise HTTPException(status_code=404, detail=f"Paciente con ID {paciente_id} no encontrado")
    
    return _map_to_response_dto(paciente)


@router.post("", response_model=PacienteResponseDto, tags=["Pacientes"], status_code=201)
async def create_paciente(
    data: PacienteCreateDto,
    db: Session = Depends(get_db)
):
    """
    Crea un nuevo paciente.
    
    El ID del paciente (número de documento) debe ser único.
    """
    try:
        paciente = PacienteService.create(db, data.model_dump())
        db.commit()
        db.refresh(paciente)
        result = _map_to_response_dto(paciente)
        # Emitir evento WebSocket
        await ws_manager.send_event("create", "pacientes", result.model_dump(mode='json') if hasattr(result, 'model_dump') else dict(result))
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creando paciente: {str(e)}")


@router.put("/{paciente_id}", response_model=PacienteResponseDto, tags=["Pacientes"])
async def update_paciente(
    paciente_id: str,
    data: PacienteUpdateDto,
    db: Session = Depends(get_db)
):
    """
    Actualiza un paciente existente.
    
    - **paciente_id**: ID del paciente a actualizar
    - Solo se actualizan los campos proporcionados (no nulos)
    """
    try:
        paciente = PacienteService.update(db, paciente_id, data.model_dump(exclude_none=True))
        db.commit()
        db.refresh(paciente)
        result = _map_to_response_dto(paciente)
        # Emitir evento WebSocket
        await ws_manager.send_event("update", "pacientes", result.model_dump(mode='json') if hasattr(result, 'model_dump') else dict(result))
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error actualizando paciente: {str(e)}")


@router.delete("/{paciente_id}", tags=["Pacientes"], status_code=204)
async def delete_paciente(
    paciente_id: str,
    db: Session = Depends(get_db)
):
    """
    Elimina un paciente.
    
    - **paciente_id**: ID del paciente a eliminar
    - No se puede eliminar si tiene atenciones asociadas
    """
    try:
        PacienteService.delete(db, paciente_id)
        db.commit()
        # Emitir evento WebSocket
        await ws_manager.send_event("delete", "pacientes", {"id": paciente_id})
        return None
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error eliminando paciente: {str(e)}")


def _map_to_response_dto(paciente) -> PacienteResponseDto:
    """Mapea entidad Paciente a DTO de respuesta"""
    # Construir nombre completo
    nombre_completo = f"{paciente.primer_nombre or ''}"
    if paciente.segundo_nombre:
        nombre_completo += f" {paciente.segundo_nombre}"
    nombre_completo += f" {paciente.primer_apellido or ''}"
    if paciente.segundo_apellido:
        nombre_completo += f" {paciente.segundo_apellido}"
    
    return PacienteResponseDto(
        id=paciente.id,
        id_tipo_documento=paciente.id_tipo_documento,
        tipo_documento_codigo=paciente.tipo_documento.siglas if paciente.tipo_documento else None,
        tipo_documento_descripcion=paciente.tipo_documento.descripcion if paciente.tipo_documento else None,
        primer_nombre=paciente.primer_nombre,
        segundo_nombre=paciente.segundo_nombre,
        primer_apellido=paciente.primer_apellido,
        segundo_apellido=paciente.segundo_apellido,
        telefono_uno=paciente.telefono_uno,
        telefono_dos=paciente.telefono_dos,
        email=paciente.email,
        nombre_completo=nombre_completo.strip()
    )


# --- Lock endpoints para control de concurrencia de edición ---
@router.post("/{paciente_id}/lock", tags=["Pacientes"])
def acquire_lock(paciente_id: str, current_user: dict = Depends(get_current_user)):
    try:
        locker = {'id': current_user.get('id'), 'username': current_user.get('sub') or current_user.get('username')}
        res = lock_service.acquire(str(paciente_id), locker)
        if res.get('ok'):
            return {'locked': True, 'lockedBy': res.get('lockedBy')}
        else:
            return JSONResponse(status_code=409, content={'locked': True, 'lockedBy': res.get('lockedBy')})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{paciente_id}/lock", tags=["Pacientes"])
def status_lock(paciente_id: str):
    try:
        st = lock_service.status(str(paciente_id))
        return st
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{paciente_id}/lock", tags=["Pacientes"])
def release_lock(paciente_id: str, current_user: dict = Depends(get_current_user)):
    try:
        locker_id = current_user.get('id')
        ok = lock_service.release(str(paciente_id), locker_id)
        if not ok:
            raise HTTPException(status_code=403, detail="Solo el dueño del lock puede liberarlo")
        return {'released': True}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
