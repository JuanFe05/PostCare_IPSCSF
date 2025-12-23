from fastapi import APIRouter, HTTPException, Depends
from app.presentation.dto.seguimiento_atencion_dto import (
    SeguimientoAtencionCreateDto,
    SeguimientoAtencionUpdateDto,
    SeguimientoAtencionResponseDto,
)
from app.service.implementation.seguimiento_atencion_service_impl import SeguimientoAtencionServiceImpl
from app.configuration.security.security_dependencies import get_current_admin, get_current_user_with_roles

router = APIRouter(prefix="/seguimientos_atenciones", tags=["SeguimientosAtenciones"])
service = SeguimientoAtencionServiceImpl()


@router.post("", response_model=SeguimientoAtencionResponseDto, dependencies=[Depends(get_current_admin)])
def create_seguimiento(data: SeguimientoAtencionCreateDto):
    return service.create_seguimiento(data)


@router.get("", response_model=list[SeguimientoAtencionResponseDto], dependencies=[Depends(get_current_user_with_roles)])
def list_seguimientos():
    return service.get_all_seguimientos()


@router.get("/{seguimiento_id}", response_model=SeguimientoAtencionResponseDto, dependencies=[Depends(get_current_user_with_roles)])
def get_seguimiento(seguimiento_id: int):
    try:
        return service.get_seguimiento(seguimiento_id)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.put("/{seguimiento_id}", response_model=SeguimientoAtencionResponseDto, dependencies=[Depends(get_current_admin)])
def update_seguimiento(seguimiento_id: int, data: SeguimientoAtencionUpdateDto):
    try:
        return service.update_seguimiento(seguimiento_id, data)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/{seguimiento_id}", dependencies=[Depends(get_current_admin)])
def delete_seguimiento(seguimiento_id: int):
    try:
        service.delete_seguimiento(seguimiento_id)
        return {"detail": "Seguimiento eliminado"}
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))
