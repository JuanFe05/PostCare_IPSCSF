from fastapi import APIRouter, HTTPException, Depends
from app.presentation.dto.servicio_dto import ServicioCreateDto, ServicioUpdateDto, ServicioResponseDto
from app.service.implementation.servicio_service_impl import ServicioServiceImpl
from app.configuration.security.security_dependencies import get_current_admin, get_current_user_with_roles

router = APIRouter(prefix="/servicios", tags=["Servicios"])
service = ServicioServiceImpl()


@router.post("", response_model=ServicioResponseDto, dependencies=[Depends(get_current_admin)])
def create_servicio(data: ServicioCreateDto):
    return service.create_servicio(data)


@router.get("", response_model=list[ServicioResponseDto], dependencies=[Depends(get_current_user_with_roles)])
def list_servicios():
    return service.get_all_servicios()


@router.get("/{servicio_id}", response_model=ServicioResponseDto, dependencies=[Depends(get_current_user_with_roles)])
def get_servicio(servicio_id: int):
    try:
        return service.get_servicio(servicio_id)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.put("/{servicio_id}", response_model=ServicioResponseDto, dependencies=[Depends(get_current_admin)])
def update_servicio(servicio_id: int, data: ServicioUpdateDto):
    try:
        return service.update_servicio(servicio_id, data)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/{servicio_id}", dependencies=[Depends(get_current_admin)])
def delete_servicio(servicio_id: int):
    try:
        service.delete_servicio(servicio_id)
        return {"detail": "Servicio eliminado"}
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))
