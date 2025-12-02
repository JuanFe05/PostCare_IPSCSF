from fastapi import APIRouter, HTTPException, Depends
from app.presentation.dto.role_dto import RoleCreateDto, RoleUpdateDto, RoleResponseDto
from app.service.implementation.role_service_impl import RoleServiceImpl
from app.configuration.security.security_dependencies import get_current_admin
from app.service.implementation.lock_service import get_lock_service
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/roles", tags=["Roles"])
service = RoleServiceImpl()
lock_service = get_lock_service()


@router.post("", response_model=RoleResponseDto, dependencies=[Depends(get_current_admin)])
def create_role(data: RoleCreateDto):
    return service.create_role(data)


@router.get("", response_model=list[RoleResponseDto], dependencies=[Depends(get_current_admin)])
def list_roles():
    return service.get_all_roles()


@router.put("/{role_id}", response_model=RoleResponseDto, dependencies=[Depends(get_current_admin)])
def update_role(role_id: int, data: RoleUpdateDto):
    try:
        return service.update_role(role_id, data)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/{role_id}", dependencies=[Depends(get_current_admin)])
def delete_role(role_id: int):
    try:
        service.delete_role(role_id)
        return {"detail": "Rol eliminado"}
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


<<<<<<< HEAD
# --- Lock endpoints for edit concurrency control (admin only) ---
=======
# --- Lock endpoints for edit-concurrency control (admin only) ---
>>>>>>> develop
@router.post("/{role_id}/lock", dependencies=[Depends(get_current_admin)])
def acquire_lock(role_id: int, current_user: dict = Depends(get_current_admin)):
    try:
        locker = {'id': current_user.get('id'), 'username': current_user.get('sub') or current_user.get('username')}
        res = lock_service.acquire(str(role_id), locker)
        if res.get('ok'):
            return {'locked': True, 'lockedBy': res.get('lockedBy')}
        else:
            return JSONResponse(status_code=409, content={'locked': True, 'lockedBy': res.get('lockedBy')})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{role_id}/lock", dependencies=[Depends(get_current_admin)])
def status_lock(role_id: int):
    try:
        st = lock_service.status(str(role_id))
        return st
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{role_id}/lock", dependencies=[Depends(get_current_admin)])
def release_lock(role_id: int, current_user: dict = Depends(get_current_admin)):
    try:
        locker_id = current_user.get('id')
        ok = lock_service.release(str(role_id), locker_id)
        if not ok:
            raise HTTPException(status_code=403, detail="Solo el dueño del lock puede liberarlo")
        return {'released': True}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
