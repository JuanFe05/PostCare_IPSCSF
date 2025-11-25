from app.persistence.repository.servicio_repository import ServicioRepository
from app.persistence.entity.servicios_entity import Servicio
from app.configuration.app.database import SessionLocal
from app.presentation.dto.servicio_dto import ServicioCreateDto, ServicioUpdateDto


class ServicioServiceImpl:
    def __init__(self):
        self.repo = ServicioRepository()

    def create_servicio(self, data: ServicioCreateDto):
        db = SessionLocal()
        servicio = Servicio(nombre=data.nombre, descripcion=getattr(data, 'descripcion', None))
        result = self.repo.create(db, servicio)
        db.close()
        return result

    def get_all_servicios(self):
        db = SessionLocal()
        result = self.repo.get_all(db)
        db.close()
        return result

    def get_servicio(self, servicio_id: int):
        db = SessionLocal()
        servicio = self.repo.get_by_id(db, servicio_id)
        db.close()
        if not servicio:
            raise Exception("Servicio no encontrado")
        return servicio

    def update_servicio(self, servicio_id: int, data: ServicioUpdateDto):
        db = SessionLocal()
        servicio = self.repo.get_by_id(db, servicio_id)
        if not servicio:
            db.close()
            raise Exception("Servicio no encontrado")
        update_data = data.dict(exclude_unset=True)
        # allow updating descripcion as well
        result = self.repo.update(db, servicio, update_data)
        db.close()
        return result

    def delete_servicio(self, servicio_id: int):
        db = SessionLocal()
        servicio = self.repo.get_by_id(db, servicio_id)
        if not servicio:
            db.close()
            raise Exception("Servicio no encontrado")
        self.repo.delete(db, servicio)
        db.close()
