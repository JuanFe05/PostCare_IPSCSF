from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.configuration.app.database import get_db
from app.configuration.security.security_dependencies import get_current_user
from app.presentation.dto.atencion_paciente_dto import (
    AtencionCreateDto,
    AtencionUpdateDto,
    AtencionDetalleResponseDto,
    AtencionListResponseDto,
)
from app.service.implementation.atencion_service import AtencionService


router = APIRouter(prefix="/atenciones", dependencies=[Depends(get_current_user)])


# ==================== NUEVOS ENDPOINTS ====================

@router.get("", response_model=List[AtencionListResponseDto], tags=["Atenciones"])
def get_all_atenciones(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db)
):
    """Obtiene todas las atenciones con información resumida"""
    try:
        return AtencionService.get_all_atenciones(db, skip=skip, limit=limit)
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


@router.post("", response_model=AtencionDetalleResponseDto, tags=["Atenciones"], status_code=201)
def create_atencion(
    atencion_data: AtencionCreateDto,
    db: Session = Depends(get_db)
):
    """
    Crea una nueva atención.
    
    El paciente debe existir previamente.
    Se pueden asignar servicios en la creación.
    """
    try:
        return AtencionService.create_atencion(db, atencion_data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creando atención: {str(e)}")


@router.put("/{atencion_id}", response_model=AtencionDetalleResponseDto, tags=["Atenciones"])
def update_atencion(
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
    return atencion


@router.delete("/{atencion_id}", tags=["Atenciones"], status_code=204)
def delete_atencion(
    atencion_id: str,
    db: Session = Depends(get_db)
):
    """Elimina una atención y sus servicios asociados"""
    success = AtencionService.delete_atencion(db, atencion_id)
    if not success:
        raise HTTPException(status_code=404, detail="Atención no encontrada")
    return None
