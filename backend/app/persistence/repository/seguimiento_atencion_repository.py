from sqlalchemy.orm import Session
from app.persistence.entity.seguimientos_atenciones_entity import SeguimientoAtencion


class SeguimientoAtencionRepository:

    def create(self, db: Session, entidad: SeguimientoAtencion):
        db.add(entidad)
        db.commit()
        db.refresh(entidad)
        return entidad

    def get_all(self, db: Session):
        return db.query(SeguimientoAtencion).all()

    def get_by_id(self, db: Session, entidad_id: int):
        return db.query(SeguimientoAtencion).filter(SeguimientoAtencion.id == entidad_id).first()

    def update(self, db: Session, entidad: SeguimientoAtencion, new_data: dict):
        for key, value in new_data.items():
            setattr(entidad, key, value)
        db.commit()
        db.refresh(entidad)
        return entidad

    def delete(self, db: Session, entidad: SeguimientoAtencion):
        db.delete(entidad)
        db.commit()
