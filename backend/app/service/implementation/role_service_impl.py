from app.persistence.repository.role_repository import RoleRepository
from app.persistence.entity.role_entity import Role
from app.configuration.app.database import SessionLocal
from app.presentation.dto.role_dto import RoleCreateDto, RoleUpdateDto


class RoleServiceImpl:
    def __init__(self):
        self.repo = RoleRepository()

    def create_role(self, data: RoleCreateDto):
        db = SessionLocal()
        role = Role(nombre=data.nombre, descripcion=data.descripcion)
        result = self.repo.create(db, role)
        db.close()
        return result

    def get_all_roles(self):
        db = SessionLocal()
        result = self.repo.get_all(db)
        db.close()
        return result

    def update_role(self, role_id: int, data: RoleUpdateDto):
        db = SessionLocal()
        role = db.query(Role).filter(Role.id == role_id).first()
        if not role:
            db.close()
            raise Exception("Rol no encontrado")
        update_data = data.dict(exclude_unset=True)
        result = self.repo.update(db, role, update_data)
        db.close()
        return result

    def delete_role(self, role_id: int):
        db = SessionLocal()
        role = db.query(Role).filter(Role.id == role_id).first()
        if not role:
            db.close()
            raise Exception("Rol no encontrado")
        self.repo.delete(db, role)
        db.close()
