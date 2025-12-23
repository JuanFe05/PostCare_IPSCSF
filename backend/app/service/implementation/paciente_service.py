from sqlalchemy.orm import Session
from typing import List
from app.persistence.entity.pacientes_entity import Paciente
from app.persistence.repository import paciente_repository


class PacienteService:
    """Servicio para manejo de pacientes"""

    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 100) -> List[Paciente]:
        """Obtiene todos los pacientes"""
        return paciente_repository.get_all_pacientes(db, skip, limit)

    @staticmethod
    def search(db: Session, search_term: str, skip: int = 0, limit: int = 100) -> List[Paciente]:
        """Busca pacientes por término de búsqueda"""
        if not search_term or not search_term.strip():
            return PacienteService.get_all(db, skip, limit)
        return paciente_repository.search_pacientes(db, search_term.strip(), skip, limit)

    @staticmethod
    def get_by_id(db: Session, paciente_id: str) -> Paciente | None:
        """Obtiene un paciente por ID"""
        return paciente_repository.get_paciente_by_id(db, paciente_id)

    @staticmethod
    def create(db: Session, data: dict) -> Paciente:
        """Crea un nuevo paciente"""
        # Verificar que no exista un paciente con el mismo ID
        existing = paciente_repository.get_paciente_by_id(db, data["id"])
        if existing:
            raise ValueError(f"Ya existe un paciente con el ID {data['id']}")

        paciente = Paciente(**data)
        return paciente_repository.create_paciente(db, paciente)

    @staticmethod
    def update(db: Session, paciente_id: str, data: dict) -> Paciente:
        """Actualiza un paciente existente"""
        paciente = paciente_repository.get_paciente_by_id(db, paciente_id)
        if not paciente:
            raise ValueError(f"Paciente con ID {paciente_id} no encontrado")

        # Filtrar solo los campos que se pueden actualizar
        update_data = {k: v for k, v in data.items() if v is not None}
        
        return paciente_repository.update_paciente(db, paciente, update_data)

    @staticmethod
    def delete(db: Session, paciente_id: str) -> None:
        """Elimina un paciente"""
        paciente = paciente_repository.get_paciente_by_id(db, paciente_id)
        if not paciente:
            raise ValueError(f"Paciente con ID {paciente_id} no encontrado")

        # Verificar si tiene atenciones asociadas
        if paciente.atenciones and len(paciente.atenciones) > 0:
            raise ValueError(f"No se puede eliminar el paciente porque tiene {len(paciente.atenciones)} atenciones asociadas")

        paciente_repository.delete_paciente(db, paciente)
