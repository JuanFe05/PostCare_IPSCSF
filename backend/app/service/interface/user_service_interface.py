from abc import ABC, abstractmethod
from app.presentation.dto.user_dto import UserCreateDto, UserUpdateDto


class UserServiceInterface(ABC):

    @abstractmethod
    def create_user(self, data: UserCreateDto): ...

    @abstractmethod
    def get_all_users(self): ...

    @abstractmethod
    def update_user(self, user_id: int, data: UserUpdateDto): ...

    @abstractmethod
    def delete_user(self, user_id: int): ...
