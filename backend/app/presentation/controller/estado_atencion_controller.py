from fastapi import APIRouter, HTTPException, Depends
from app.presentation.dto.estado_atencion_dto import (
    EstadoAtencionCreateDto,
    EstadoAtencionUpdateDto,
    EstadoAtencionResponseDto,
)
from app.service.implementation.estado_atencion_service_impl import EstadoAtencionServiceImpl
from app.configuration.security.security_dependencies import get_current_admin

router = APIRouter(prefix="/estados_atenciones", tags=["EstadosAtenciones"])
service = EstadoAtencionServiceImpl()


@router.post("", response_model=EstadoAtencionResponseDto, dependencies=[Depends(get_current_admin)])
def create_estado(data: EstadoAtencionCreateDto):
    return service.create_estado(data)


@router.get("", response_model=list[EstadoAtencionResponseDto], dependencies=[Depends(get_current_admin)])
def list_estados():
    return service.get_all_estados()


@router.get("/{estado_id}", response_model=EstadoAtencionResponseDto, dependencies=[Depends(get_current_admin)])
def get_estado(estado_id: int):
    try:
        return service.get_estado(estado_id)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.put("/{estado_id}", response_model=EstadoAtencionResponseDto, dependencies=[Depends(get_current_admin)])
def update_estado(estado_id: int, data: EstadoAtencionUpdateDto):
    try:
        return service.update_estado(estado_id, data)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/{estado_id}", dependencies=[Depends(get_current_admin)])
def delete_estado(estado_id: int):
    try:
        service.delete_estado(estado_id)
        return {"detail": "Estado eliminado"}
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))
