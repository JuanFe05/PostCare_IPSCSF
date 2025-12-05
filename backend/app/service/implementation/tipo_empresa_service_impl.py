from app.persistence.repository.tipo_empresa_repository import TipoEmpresaRepository
from app.persistence.entity.tipos_empresas_entity import TipoEmpresa
from app.configuration.app.database import SessionLocal


class TipoEmpresaServiceImpl:
    def __init__(self):
        self.repo = TipoEmpresaRepository()

    def get_all_tipos(self):
        db = SessionLocal()
        result = self.repo.get_all(db)
        db.close()
        return result
