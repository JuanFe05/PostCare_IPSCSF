from sqlalchemy.orm import Session
from app.persistence.entity.estados_atenciones_entity import EstadoAtencion


class EstadoAtencionRepository:

    def create(self, db: Session, entidad: EstadoAtencion):
        db.add(entidad)
        db.commit()
        db.refresh(entidad)
        return entidad

    def get_all(self, db: Session):
        return db.query(EstadoAtencion).all()

    def get_by_id(self, db: Session, entidad_id: int):
        return db.query(EstadoAtencion).filter(EstadoAtencion.id == entidad_id).first()

    def update(self, db: Session, entidad: EstadoAtencion, new_data: dict):
        for key, value in new_data.items():
            setattr(entidad, key, value)
        db.commit()
        db.refresh(entidad)
        return entidad

    def delete(self, db: Session, entidad: EstadoAtencion):
        db.delete(entidad)
        db.commit()
