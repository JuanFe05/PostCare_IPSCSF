from app.persistence.repository.empresa_repository import EmpresaRepository
from app.persistence.entity.empresas_entity import Empresa
from app.configuration.app.database import SessionLocal
from app.presentation.dto.empresa_dto import EmpresaCreateDto, EmpresaUpdateDto


class EmpresaServiceImpl:
    def __init__(self):
        self.repo = EmpresaRepository()

    def create_empresa(self, data: EmpresaCreateDto):
        db = SessionLocal()
        # If id provided, use it (autoincrement disabled for empresas)
        if getattr(data, 'id', None) is not None:
            empresa = Empresa(id=data.id, id_tipo_empresa=data.id_tipo_empresa, nombre=data.nombre)
        else:
            empresa = Empresa(id_tipo_empresa=data.id_tipo_empresa, nombre=data.nombre)
        result = self.repo.create(db, empresa)
        db.close()
        return result

    def get_all_empresas(self):
        db = SessionLocal()
        result = self.repo.get_all(db)
        # Attach the tipo_empresa name to each Empresa instance so the DTO can expose it
        for empresa in result:
            try:
                tipo_nombre = empresa.tipo_empresa.nombre if getattr(empresa, 'tipo_empresa', None) else None
            except Exception:
                tipo_nombre = None
            setattr(empresa, 'nombre_tipo_empresa', tipo_nombre)
        db.close()
        return result

    def get_empresa(self, empresa_id: int):
        db = SessionLocal()
        empresa = self.repo.get_by_id(db, empresa_id)
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
