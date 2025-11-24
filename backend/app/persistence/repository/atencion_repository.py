from sqlalchemy.orm import Session
from app.persistence.entity.atenciones_entity import Atencion


def get_atencion_by_id(db: Session, atencion_id: int) -> Atencion | None:
    return db.query(Atencion).filter(Atencion.id == atencion_id).first()


def create_atencion(db: Session, atencion: Atencion) -> Atencion:
    db.add(atencion)
    db.flush()
    return atencion


def update_atencion(db: Session, atencion_obj: Atencion, data: dict) -> Atencion:
    for key, value in data.items():
        setattr(atencion_obj, key, value)
    db.flush()
    return atencion_obj


def delete_atencion(db: Session, atencion_obj: Atencion) -> None:
    db.delete(atencion_obj)
    db.flush()
