from sqlalchemy.orm import Session
from app.persistence.repository.paciente_repository import (
    get_paciente_by_id,
    create_paciente,
    update_paciente,
    delete_paciente,
)
from app.persistence.repository.atencion_repository import (
    get_atencion_by_id,
    create_atencion,
    update_atencion,
    delete_atencion,
)
from app.persistence.entity.pacientes_entity import Paciente
from app.persistence.entity.atenciones_entity import Atencion
from app.service.interface.atencion_service_interface import AtencionServiceInterface


class AtencionService(AtencionServiceInterface):
    @staticmethod
    def create_with_paciente(db: Session, atencion_data: dict, paciente_data: dict) -> tuple[Atencion, Paciente]:
        # Transaccional: crear paciente, luego atención.
        try:
            with db.begin():
                paciente = Paciente(**paciente_data)
                create_paciente(db, paciente)

                # Asegurar que la atención referencia el id del paciente
                atencion_data["id_paciente"] = paciente.id
                atencion = Atencion(**atencion_data)
                create_atencion(db, atencion)

            return atencion, paciente
        except Exception:
            db.rollback()
            raise

    @staticmethod
    def update_with_paciente(db: Session, atencion_id: str, atencion_data: dict, paciente_data: dict) -> tuple[Atencion, Paciente]:
        try:
            with db.begin():
                atencion = get_atencion_by_id(db, atencion_id)
                if not atencion:
                    raise ValueError("Atencion no encontrada")

                paciente = get_paciente_by_id(db, paciente_data.get("id"))
                if not paciente:
                    raise ValueError("Paciente no encontrado")

                update_paciente(db, paciente, paciente_data)
                update_atencion(db, atencion, atencion_data)

            return atencion, paciente
        except Exception:
            db.rollback()
            raise

    @staticmethod
    def delete_with_paciente(db: Session, atencion_id: str, borrar_paciente: bool = False) -> None:
        try:
            with db.begin():
                atencion = get_atencion_by_id(db, atencion_id)
                if not atencion:
                    raise ValueError("Atencion no encontrada")

                paciente = get_paciente_by_id(db, atencion.id_paciente)

                delete_atencion(db, atencion)
                if borrar_paciente and paciente:
                    # llamar a la función del repositorio para eliminar el paciente
                    delete_paciente(db, paciente)

        except Exception:
            db.rollback()
            raise
