from app.persistence.repository.seguimiento_atencion_repository import SeguimientoAtencionRepository
from app.persistence.entity.seguimientos_atenciones_entity import SeguimientoAtencion
from app.configuration.app.database import SessionLocal
from app.presentation.dto.seguimiento_atencion_dto import (
    SeguimientoAtencionCreateDto,
    SeguimientoAtencionUpdateDto,
)


class SeguimientoAtencionServiceImpl:
    def __init__(self):
        self.repo = SeguimientoAtencionRepository()

    def create_seguimiento(self, data: SeguimientoAtencionCreateDto):
        db = SessionLocal()
        entidad = SeguimientoAtencion(nombre=data.nombre, descripcion=data.descripcion)
        result = self.repo.create(db, entidad)
        db.close()
        return result

    def get_all_seguimientos(self):
        db = SessionLocal()
        result = self.repo.get_all(db)
        db.close()
        return result

    def get_seguimiento(self, seguimiento_id: int):
        db = SessionLocal()
        entidad = self.repo.get_by_id(db, seguimiento_id)
        db.close()
        if not entidad:
            raise Exception("Seguimiento no encontrado")
        return entidad

    def update_seguimiento(self, seguimiento_id: int, data: SeguimientoAtencionUpdateDto):
        db = SessionLocal()
        entidad = self.repo.get_by_id(db, seguimiento_id)
        if not entidad:
            db.close()
            raise Exception("Seguimiento no encontrado")
        update_data = data.dict(exclude_unset=True)
        result = self.repo.update(db, entidad, update_data)
        db.close()
        return result

    def delete_seguimiento(self, seguimiento_id: int):
        db = SessionLocal()
        entidad = self.repo.get_by_id(db, seguimiento_id)
        if not entidad:
            db.close()
            raise Exception("Seguimiento no encontrado")
        self.repo.delete(db, entidad)
        db.close()
