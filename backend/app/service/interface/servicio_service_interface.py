from abc import ABC, abstractmethod
from app.presentation.dto.servicio_dto import ServicioCreateDto, ServicioUpdateDto


class ServicioServiceInterface(ABC):

    @abstractmethod
    def create_servicio(self, data: ServicioCreateDto): ...

    @abstractmethod
    def get_all_servicios(self): ...

    @abstractmethod
    def get_servicio(self, servicio_id: int): ...

    @abstractmethod
    def update_servicio(self, servicio_id: int, data: ServicioUpdateDto): ...

    @abstractmethod
    def delete_servicio(self, servicio_id: int): ...
