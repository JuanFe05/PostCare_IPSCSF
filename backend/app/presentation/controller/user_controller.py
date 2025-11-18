from fastapi import APIRouter, HTTPException
from app.presentation.dto.user_dto import UserCreateDto, UserResponseDto, UserUpdateDto
from app.service.implementation.user_service_impl import UserServiceImpl
from fastapi import APIRouter, HTTPException, Depends
from app.configuration.security.security_dependencies import get_current_admin

router = APIRouter(prefix="/users", tags=["Users"])
service = UserServiceImpl()


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
