from abc import ABC, abstractmethod
from app.presentation.dto.estado_atencion_dto import EstadoAtencionCreateDto, EstadoAtencionUpdateDto


class EstadoAtencionServiceInterface(ABC):

    @abstractmethod
    def create_estado(self, data: EstadoAtencionCreateDto): ...

    @abstractmethod
    def get_all_estados(self): ...

    @abstractmethod
    def get_estado(self, estado_id: int): ...

    @abstractmethod
    def update_estado(self, estado_id: int, data: EstadoAtencionUpdateDto): ...

    @abstractmethod
    def delete_estado(self, estado_id: int): ...
