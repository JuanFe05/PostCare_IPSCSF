from app.service.interface.user_service_interface import UserServiceInterface
from app.persistence.entity.user_entity import User
from app.persistence.repository.user_repository import UserRepository
from app.configuration.app.database import SessionLocal
from app.configuration.security.password_utils import hash_password
from app.presentation.dto.user_dto import UserCreateDto, UserUpdateDto


class UserServiceImpl(UserServiceInterface):

    def __init__(self):
        self.repo = UserRepository()

    def create_user(self, data: UserCreateDto):
        db = SessionLocal()
        user = User(
            username=data.username,
            email=data.email,
            password_hash=hash_password(data.password)
        )
        result = self.repo.create(db, user)
        db.close()
        return result

    def get_all_users(self):
        db = SessionLocal()
        result = self.repo.get_all(db)
        db.close()
        return result

    def update_user(self, user_id: int, data: UserUpdateDto):
        db = SessionLocal()
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            db.close()
            raise Exception("Usuario no encontrado")
        update_data = data.dict(exclude_unset=True)
        if "password" in update_data:
            update_data["password_hash"] = hash_password(update_data.pop("password"))
        result = self.repo.update(db, user, update_data)
        db.close()
        return result

    def delete_user(self, user_id: int):
        db = SessionLocal()
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            db.close()
            raise Exception("Usuario no encontrado")
        self.repo.delete(db, user)
        db.close()
