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


class AtencionService:
    @staticmethod
    def create_with_paciente(db: Session, atencion_data: dict, paciente_data: dict) -> tuple[Atencion, Paciente]:
        # Transactional: create paciente, then atencion
        try:
            with db.begin():
                paciente = Paciente(**paciente_data)
                create_paciente(db, paciente)

                # Ensure the atencion references the paciente id
                atencion_data["id_paciente"] = paciente.id
                atencion = Atencion(**atencion_data)
                create_atencion(db, atencion)

            return atencion, paciente
        except Exception:
            db.rollback()
            raise

    @staticmethod
    def update_with_paciente(db: Session, atencion_id: int, atencion_data: dict, paciente_data: dict) -> tuple[Atencion, Paciente]:
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
    def delete_with_paciente(db: Session, atencion_id: int, borrar_paciente: bool = False) -> None:
        try:
            with db.begin():
                atencion = get_atencion_by_id(db, atencion_id)
                if not atencion:
                    raise ValueError("Atencion no encontrada")

                paciente = get_paciente_by_id(db, atencion.id_paciente)

                delete_atencion(db, atencion)
                if borrar_paciente and paciente:
                    # call the repository function to delete the paciente
                    delete_paciente(db, paciente)

        except Exception:
            db.rollback()
            raise
