from sqlalchemy.orm import Session
from app.persistence.entity.tipos_empresas_entity import TipoEmpresa


class TipoEmpresaRepository:

    def get_all(self, db: Session):
        return db.query(TipoEmpresa).all()

    def get_by_id(self, db: Session, tipo_id: int):
        return db.query(TipoEmpresa).filter(TipoEmpresa.id == tipo_id).first()
