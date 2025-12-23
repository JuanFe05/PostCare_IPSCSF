from fastapi import APIRouter, HTTPException , Depends
from app.presentation.dto.user_dto import UserCreateDto, UserResponseDto, UserUpdateDto
from app.service.implementation.user_service_impl import UserServiceImpl
from app.configuration.security.security_dependencies import get_current_admin
from app.service.implementation.lock_service import get_lock_service
from fastapi import Depends
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/users", tags=["Users"])
service = UserServiceImpl()
lock_service = get_lock_service()


@router.post("", response_model=UserResponseDto, dependencies=[Depends(get_current_admin)])
def create_user(data: UserCreateDto):
    try:
        return service.create_user(data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("", response_model=list[UserResponseDto], dependencies=[Depends(get_current_admin)])
def list_users():
    return service.get_all_users()


@router.put("/{user_id}", response_model=UserResponseDto, dependencies=[Depends(get_current_admin)])
def update_user(user_id: int, data: UserUpdateDto):
    try:
        return service.update_user(user_id, data)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/{user_id}", dependencies=[Depends(get_current_admin)])
def delete_user(user_id: int):
    try:
        service.delete_user(user_id)
        return {"detail": "Usuario eliminado"}
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


# --- Bloquear puntos finales para el control de concurrencia de edición ---
@router.post("/{user_id}/lock", dependencies=[Depends(get_current_admin)])
def acquire_lock(user_id: int, current_user: dict = Depends(get_current_admin)):
    try:
        locker = {'id': current_user.get('id'), 'username': current_user.get('sub') or current_user.get('username')}
        res = lock_service.acquire(str(user_id), locker)
        if res.get('ok'):
            return {'locked': True, 'lockedBy': res.get('lockedBy')}
        else:
            # already locked -> return 409 with top-level body
            return JSONResponse(status_code=409, content={'locked': True, 'lockedBy': res.get('lockedBy')})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{user_id}/lock", dependencies=[Depends(get_current_admin)])
def status_lock(user_id: int):
    try:
        st = lock_service.status(str(user_id))
        return st
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{user_id}/lock", dependencies=[Depends(get_current_admin)])
def release_lock(user_id: int, current_user: dict = Depends(get_current_admin)):
    try:
        locker_id = current_user.get('id')
        ok = lock_service.release(str(user_id), locker_id)
        if not ok:
            raise HTTPException(status_code=403, detail="Solo el dueño del lock puede liberarlo")
        return {'released': True}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
