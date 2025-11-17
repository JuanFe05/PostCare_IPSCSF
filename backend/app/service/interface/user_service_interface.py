from abc import ABC, abstractmethod
from app.presentation.dto.user_dto import UserCreateDto


class UserServiceInterface(ABC):

    @abstractmethod
    def create_user(self, data: UserCreateDto): ...
