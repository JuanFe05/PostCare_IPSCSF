from app.persistence.repository.empresa_repository import EmpresaRepository
from app.persistence.entity.empresas_entity import Empresa
from app.configuration.app.database import SessionLocal
from app.presentation.dto.empresa_dto import EmpresaCreateDto, EmpresaUpdateDto
from app.service.interface.empresa_service_interface import EmpresaServiceInterface


class EmpresaServiceImpl(EmpresaServiceInterface):
    def __init__(self):
        self.repo = EmpresaRepository()

    def create_empresa(self, data: EmpresaCreateDto):
        db = SessionLocal()
        if getattr(data, 'id', None) is not None:
            empresa = Empresa(id=data.id, id_tipo_empresa=data.id_tipo_empresa, nombre=data.nombre)
        else:
            empresa = Empresa(id_tipo_empresa=data.id_tipo_empresa, nombre=data.nombre)
        result = self.repo.create(db, empresa)
        # attach tipo_empresa_nombre so response contains the name
        try:
            tipo = None
            if getattr(result, 'tipo_empresa', None):
                tipo = result.tipo_empresa.nombre
            else:
                from app.persistence.entity.tipos_empresas_entity import TipoEmpresa
                tipo_row = db.query(TipoEmpresa).filter(TipoEmpresa.id == result.id_tipo_empresa).first()
                tipo = tipo_row.nombre if tipo_row else None
            setattr(result, 'tipo_empresa_nombre', tipo)
        except Exception:
            pass
        db.close()
        return result

    def get_all_empresas(self):
        db = SessionLocal()
        result = self.repo.get_all(db)
        # Adjuntar el nombre del tipo de empresa a cada instancia de Empresa para que el DTO pueda exponerlo
        for empresa in result:
            try:
                tipo_nombre = empresa.tipo_empresa.nombre if getattr(empresa, 'tipo_empresa', None) else None
            except Exception:
                tipo_nombre = None
            setattr(empresa, 'tipo_empresa_nombre', tipo_nombre)
        db.close()
        return result

    def get_empresa(self, empresa_id: int):
        db = SessionLocal()
        empresa = self.repo.get_by_id(db, empresa_id)
        # attach tipo_empresa_nombre for single fetch
        if empresa:
            try:
                tipo_nombre = empresa.tipo_empresa.nombre if getattr(empresa, 'tipo_empresa', None) else None
            except Exception:
                tipo_nombre = None
            setattr(empresa, 'tipo_empresa_nombre', tipo_nombre)
        db.close()
        if not empresa:
            raise Exception("Empresa no encontrada")
        return empresa

    def update_empresa(self, empresa_id: int, data: EmpresaUpdateDto):
        db = SessionLocal()
        empresa = self.repo.get_by_id(db, empresa_id)
        if not empresa:
            db.close()
            raise Exception("Empresa no encontrada")
        update_data = data.dict(exclude_unset=True)
        result = self.repo.update(db, empresa, update_data)
        # attach tipo_empresa_nombre
        try:
            tipo_nombre = result.tipo_empresa.nombre if getattr(result, 'tipo_empresa', None) else None
        except Exception:
            tipo_nombre = None
        setattr(result, 'tipo_empresa_nombre', tipo_nombre)
        db.close()
        return result

    def delete_empresa(self, empresa_id: int):
        db = SessionLocal()
        empresa = self.repo.get_by_id(db, empresa_id)
        if not empresa:
            db.close()
            raise Exception("Empresa no encontrada")
        self.repo.delete(db, empresa)
        db.close()
