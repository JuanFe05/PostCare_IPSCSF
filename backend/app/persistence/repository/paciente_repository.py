from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from typing import List
from app.persistence.entity.pacientes_entity import Paciente


def get_all_pacientes(db: Session, skip: int = 0, limit: int = 100) -> List[Paciente]:
    """Obtiene todos los pacientes con paginación"""
    return db.query(Paciente)\
        .options(joinedload(Paciente.tipo_documento))\
        .offset(skip)\
        .limit(limit)\
        .all()


def search_pacientes(db: Session, search_term: str, skip: int = 0, limit: int = 100) -> List[Paciente]:
    """Busca pacientes por ID, nombre o apellido"""
    search_pattern = f"%{search_term}%"
    return db.query(Paciente)\
        .options(joinedload(Paciente.tipo_documento))\
        .filter(
            or_(
                Paciente.id.ilike(search_pattern),
                Paciente.primer_nombre.ilike(search_pattern),
                Paciente.segundo_nombre.ilike(search_pattern),
                Paciente.primer_apellido.ilike(search_pattern),
                Paciente.segundo_apellido.ilike(search_pattern)
            )
        )\
        .offset(skip)\
        .limit(limit)\
        .all()


def get_paciente_by_id(db: Session, paciente_id: str) -> Paciente | None:
    """Obtiene un paciente por su ID"""
    return db.query(Paciente)\
        .options(joinedload(Paciente.tipo_documento))\
        .filter(Paciente.id == paciente_id)\
        .first()


def create_paciente(db: Session, paciente: Paciente) -> Paciente:
    """Crea un nuevo paciente"""
    db.add(paciente)
    db.flush()
    db.refresh(paciente)
    return paciente


def update_paciente(db: Session, paciente_obj: Paciente, data: dict) -> Paciente:
    """Actualiza un paciente existente"""
    for key, value in data.items():
        if value is not None:  # Solo actualizar campos no nulos
            setattr(paciente_obj, key, value)
    db.flush()
    db.refresh(paciente_obj)
    return paciente_obj


def delete_paciente(db: Session, paciente_obj: Paciente) -> None:
    """Elimina un paciente"""
    db.delete(paciente_obj)
    db.flush()
