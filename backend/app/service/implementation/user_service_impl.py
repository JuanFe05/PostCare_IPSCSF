from app.service.interface.user_service_interface import UserServiceInterface
from app.persistence.entity.user_entity import User
from app.persistence.repository.user_repository import UserRepository
from app.configuration.app.database import SessionLocal
from app.configuration.security.password_utils import hash_password
from app.presentation.dto.user_dto import UserCreateDto, UserUpdateDto
from app.persistence.entity.user_role_entity import UserRole


class UserServiceImpl(UserServiceInterface):

    def __init__(self):
        self.repo = UserRepository()

    def create_user(self, data: UserCreateDto):
        db = SessionLocal()
        try:
            # Crear usuario
            user = User(
                username=data.username,
                email=data.email,
                password_hash=hash_password(data.password)
            )
            db.add(user)
            db.commit()
            db.refresh(user)

            # Asignar rol
            user_role = UserRole(id_usuario=user.id, id_rol=data.role_id)
            db.add(user_role)
            db.commit()

            # Agregar role_id al response (opcional)
            user.role_id = data.role_id

            return user
        finally:
            db.close()

    def get_all_users(self):
        db = SessionLocal()
        result = self.repo.get_all(db)
        db.close()
        return result

    def update_user(self, user_id: int, data: UserUpdateDto):
        db = SessionLocal()
        try:
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                raise Exception("Usuario no encontrado")

            update_data = data.dict(exclude_unset=True)
            if "password" in update_data:
                update_data["password_hash"] = hash_password(update_data.pop("password"))

            # Actualizar usuario
            self.repo.update(db, user, update_data)

            # Cambiar rol si se envía role_id
            if "role_id" in update_data:
                user_role = db.query(UserRole).filter(UserRole.id_usuario == user.id).first()
                if user_role:
                    user_role.id_rol = update_data["role_id"]
                else:
                    db.add(UserRole(id_usuario=user.id, id_rol=update_data["role_id"]))
                db.commit()

            return user
        finally:
            db.close()

    def delete_user(self, user_id: int):
        db = SessionLocal()
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            db.close()
            raise Exception("Usuario no encontrado")
        self.repo.delete(db, user)
        db.close()
