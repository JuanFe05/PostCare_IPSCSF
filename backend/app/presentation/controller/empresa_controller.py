from fastapi import APIRouter, HTTPException, Depends
from app.presentation.dto.empresa_dto import (
    EmpresaCreateDto, EmpresaUpdateDto, EmpresaResponseDto
)
from app.service.implementation.empresa_service_impl import EmpresaServiceImpl
from app.configuration.security.security_dependencies import get_current_admin, get_current_user_with_roles

router = APIRouter(prefix="/empresas", tags=["Empresas"])
service = EmpresaServiceImpl()


@router.post("", response_model=EmpresaResponseDto, dependencies=[Depends(get_current_admin)])
def create_empresa(data: EmpresaCreateDto):
    return service.create_empresa(data)


@router.get("", response_model=list[EmpresaResponseDto], dependencies=[Depends(get_current_user_with_roles)])
def list_empresas():
    return service.get_all_empresas()


@router.get("/{empresa_id}", response_model=EmpresaResponseDto, dependencies=[Depends(get_current_user_with_roles)])
def get_empresa(empresa_id: int):
    try:
        return service.get_empresa(empresa_id)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.put("/{empresa_id}", response_model=EmpresaResponseDto, dependencies=[Depends(get_current_admin)])
def update_empresa(empresa_id: int, data: EmpresaUpdateDto):
    try:
        return service.update_empresa(empresa_id, data)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/{empresa_id}", dependencies=[Depends(get_current_admin)])
def delete_empresa(empresa_id: int):
    try:
        service.delete_empresa(empresa_id)
        return {"detail": "Empresa eliminada"}
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))
