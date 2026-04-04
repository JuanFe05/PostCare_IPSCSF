from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import JSONResponse
from app.presentation.dto.servicio_dto import ServicioCreateDto, ServicioUpdateDto, ServicioResponseDto
from app.service.implementation.servicio_service_impl import ServicioServiceImpl
from app.service.implementation.lock_service import get_lock_service
from app.configuration.security.security_dependencies import get_current_admin, get_current_user_with_roles, get_current_user

router = APIRouter(prefix="/servicios", tags=["Servicios"])
service = ServicioServiceImpl()
lock_service = get_lock_service()


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


# --- Lock endpoints para control de concurrencia de edición ---
@router.post("/{servicio_id}/lock", tags=["Servicios"])
def acquire_lock(servicio_id: int, current_user: dict = Depends(get_current_user)):
    try:
        locker = {'id': current_user.get('id'), 'username': current_user.get('sub') or current_user.get('username')}
        res = lock_service.acquire(str(servicio_id), locker)
        if res.get('ok'):
            return {'locked': True, 'lockedBy': res.get('lockedBy')}
        else:
            return JSONResponse(status_code=409, content={'locked': True, 'lockedBy': res.get('lockedBy')})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{servicio_id}/lock", tags=["Servicios"])
def status_lock(servicio_id: int):
    try:
        return lock_service.status(str(servicio_id))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{servicio_id}/lock", tags=["Servicios"])
def release_lock(servicio_id: int, current_user: dict = Depends(get_current_user)):
    try:
        locker_id = current_user.get('id')
        ok = lock_service.release(str(servicio_id), locker_id)
        if not ok:
            raise HTTPException(status_code=403, detail="Solo el dueño del lock puede liberarlo")
        return {'released': True}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
