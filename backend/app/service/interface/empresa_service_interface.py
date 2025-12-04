from abc import ABC, abstractmethod
from app.presentation.dto.empresa_dto import EmpresaCreateDto, EmpresaUpdateDto


class EmpresaServiceInterface(ABC):

    @abstractmethod
    def create_empresa(self, data: EmpresaCreateDto): ...

    @abstractmethod
    def get_all_empresas(self): ...

    @abstractmethod
    def get_empresa(self, empresa_id: int): ...

    @abstractmethod
    def update_empresa(self, empresa_id: int, data: EmpresaUpdateDto): ...

    @abstractmethod
    def delete_empresa(self, empresa_id: int): ...
