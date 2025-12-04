from abc import ABC, abstractmethod
from sqlalchemy.orm import Session
from typing import Tuple
from app.persistence.entity.atenciones_entity import Atencion
from app.persistence.entity.pacientes_entity import Paciente


class AtencionServiceInterface(ABC):

    @staticmethod
    @abstractmethod
    def create_with_paciente(db: Session, atencion_data: dict, paciente_data: dict) -> Tuple[Atencion, Paciente]: ...

    @staticmethod
    @abstractmethod
    def update_with_paciente(db: Session, atencion_id: str, atencion_data: dict, paciente_data: dict) -> Tuple[Atencion, Paciente]: ...

    @staticmethod
    @abstractmethod
    def delete_with_paciente(db: Session, atencion_id: str, borrar_paciente: bool = False) -> None: ...
