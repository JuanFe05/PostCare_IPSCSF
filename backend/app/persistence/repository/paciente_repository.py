from sqlalchemy.orm import Session
from app.persistence.entity.pacientes_entity import Paciente


def get_paciente_by_id(db: Session, paciente_id: int) -> Paciente | None:
    return db.query(Paciente).filter(Paciente.id == paciente_id).first()


def create_paciente(db: Session, paciente: Paciente) -> Paciente:
    db.add(paciente)
    db.flush()
    return paciente


def update_paciente(db: Session, paciente_obj: Paciente, data: dict) -> Paciente:
    for key, value in data.items():
        setattr(paciente_obj, key, value)
    db.flush()
    return paciente_obj


def delete_paciente(db: Session, paciente_obj: Paciente) -> None:
    db.delete(paciente_obj)
    db.flush()
