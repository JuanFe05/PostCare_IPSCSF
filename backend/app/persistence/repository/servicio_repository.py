from sqlalchemy.orm import Session
from app.persistence.entity.servicios_entity import Servicio


class ServicioRepository:

    def create(self, db: Session, servicio: Servicio):
        db.add(servicio)
        db.commit()
        db.refresh(servicio)
        return servicio

    def get_all(self, db: Session):
        return db.query(Servicio).all()

    def get_by_id(self, db: Session, servicio_id: int):
        return db.query(Servicio).filter(Servicio.id == servicio_id).first()

    def update(self, db: Session, servicio: Servicio, new_data: dict):
        for key, value in new_data.items():
            setattr(servicio, key, value)
        db.commit()
        db.refresh(servicio)
        return servicio

    def delete(self, db: Session, servicio: Servicio):
        db.delete(servicio)
        db.commit()
