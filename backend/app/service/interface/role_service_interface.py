from abc import ABC, abstractmethod
from app.presentation.dto.role_dto import RoleCreateDto, RoleUpdateDto


class RoleServiceInterface(ABC):

    @abstractmethod
    def create_role(self, data: RoleCreateDto): ...

    @abstractmethod
    def get_all_roles(self): ...

    @abstractmethod
    def update_role(self, role_id: int, data: RoleUpdateDto): ...

    @abstractmethod
    def delete_role(self, role_id: int): ...
