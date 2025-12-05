from fastapi import APIRouter
from app.presentation.dto.tipo_empresa_dto import TipoEmpresaResponseDto
from app.service.implementation.tipo_empresa_service_impl import TipoEmpresaServiceImpl

router = APIRouter(prefix="/tipos-empresas")
service = TipoEmpresaServiceImpl()


@router.get("", response_model=list[TipoEmpresaResponseDto])
def list_tipos_empresas():
    return service.get_all_tipos()
