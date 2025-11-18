from fastapi import APIRouter, HTTPException
from app.presentation.dto.role_dto import RoleCreateDto, RoleUpdateDto, RoleResponseDto
from app.service.implementation.role_service_impl import RoleServiceImpl
from fastapi import APIRouter, HTTPException, Depends
from app.configuration.security.security_dependencies import get_current_admin

router = APIRouter(prefix="/roles", tags=["Roles"])
service = RoleServiceImpl()


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
