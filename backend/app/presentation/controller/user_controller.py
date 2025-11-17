from fastapi import APIRouter
from app.presentation.dto.user_dto import UserCreateDto, UserResponseDto
from app.service.implementation.user_service_impl import UserServiceImpl

router = APIRouter(prefix="/users", tags=["Users"])
service = UserServiceImpl()


@router.post("", response_model=UserResponseDto)
def create_user(data: UserCreateDto):
    return service.create_user(data)
