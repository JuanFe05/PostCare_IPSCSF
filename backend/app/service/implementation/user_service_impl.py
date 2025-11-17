from app.service.interface.user_service_interface import UserServiceInterface
from app.persistence.entity.user_entity import User
from app.persistence.repository.user_repository import UserRepository
from app.configuration.app.database import SessionLocal
from app.configuration.security.password_utils import hash_password


class UserServiceImpl(UserServiceInterface):

    def __init__(self):
        self.repo = UserRepository()

    def create_user(self, data):
        db = SessionLocal()
        user = User(
            username=data.username,
            password_hash=hash_password(data.password),
            email=data.email
        )
        result = self.repo.create(db, user)
        db.close()
        return result
