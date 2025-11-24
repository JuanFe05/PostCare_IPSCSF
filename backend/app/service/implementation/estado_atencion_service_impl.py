from app.persistence.repository.estado_atencion_repository import EstadoAtencionRepository
from app.persistence.entity.estados_atenciones_entity import EstadoAtencion
from app.configuration.app.database import SessionLocal
from app.presentation.dto.estado_atencion_dto import EstadoAtencionCreateDto, EstadoAtencionUpdateDto


class EstadoAtencionServiceImpl:
    def __init__(self):
        self.repo = EstadoAtencionRepository()

    def create_estado(self, data: EstadoAtencionCreateDto):
        db = SessionLocal()
        entidad = EstadoAtencion(nombre=data.nombre, descripcion=data.descripcion)
        result = self.repo.create(db, entidad)
        db.close()
        return result

    def get_all_estados(self):
        db = SessionLocal()
        result = self.repo.get_all(db)
        db.close()
        return result

    def get_estado(self, estado_id: int):
        db = SessionLocal()
        entidad = self.repo.get_by_id(db, estado_id)
        db.close()
        if not entidad:
            raise Exception("Estado no encontrado")
        return entidad

    def update_estado(self, estado_id: int, data: EstadoAtencionUpdateDto):
        db = SessionLocal()
        entidad = self.repo.get_by_id(db, estado_id)
        if not entidad:
            db.close()
            raise Exception("Estado no encontrado")
        update_data = data.dict(exclude_unset=True)
        result = self.repo.update(db, entidad, update_data)
        db.close()
        return result

    def delete_estado(self, estado_id: int):
        db = SessionLocal()
        entidad = self.repo.get_by_id(db, estado_id)
        if not entidad:
            db.close()
            raise Exception("Estado no encontrado")
        self.repo.delete(db, entidad)
        db.close()
