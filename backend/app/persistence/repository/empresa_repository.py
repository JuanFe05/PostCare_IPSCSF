from sqlalchemy.orm import Session, joinedload
from app.persistence.entity.empresas_entity import Empresa
from app.persistence.entity.tipos_empresas_entity import TipoEmpresa


class EmpresaRepository:

    def create(self, db: Session, empresa: Empresa):
        db.add(empresa)
        db.commit()
        db.refresh(empresa)
        return empresa

    def get_all(self, db: Session):
        return db.query(Empresa).options(joinedload(Empresa.tipo_empresa)).all()

    def get_by_id(self, db: Session, empresa_id: int):
        return db.query(Empresa).filter(Empresa.id == empresa_id).first()

    def update(self, db: Session, empresa: Empresa, new_data: dict):
        for key, value in new_data.items():
            setattr(empresa, key, value)
        db.commit()
        db.refresh(empresa)
        return empresa

    def delete(self, db: Session, empresa: Empresa):
        db.delete(empresa)
        db.commit()
