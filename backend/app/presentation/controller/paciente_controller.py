from fastapi import APIRouter, Depends, HTTPException, Query
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


router = APIRouter(prefix="/pacientes", dependencies=[Depends(get_current_user)])


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
def create_paciente(
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
        return _map_to_response_dto(paciente)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creando paciente: {str(e)}")


@router.put("/{paciente_id}", response_model=PacienteResponseDto, tags=["Pacientes"])
def update_paciente(
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
        return _map_to_response_dto(paciente)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error actualizando paciente: {str(e)}")


@router.delete("/{paciente_id}", tags=["Pacientes"], status_code=204)
def delete_paciente(
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
