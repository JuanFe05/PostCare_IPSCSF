from abc import ABC, abstractmethod
from app.presentation.dto.seguimiento_atencion_dto import (
    SeguimientoAtencionCreateDto,
    SeguimientoAtencionUpdateDto,
)


class SeguimientoAtencionServiceInterface(ABC):

    @abstractmethod
    def create_seguimiento(self, data: SeguimientoAtencionCreateDto): ...

    @abstractmethod
    def get_all_seguimientos(self): ...

    @abstractmethod
    def get_seguimiento(self, seguimiento_id: int): ...

    @abstractmethod
    def update_seguimiento(self, seguimiento_id: int, data: SeguimientoAtencionUpdateDto): ...

    @abstractmethod
    def delete_seguimiento(self, seguimiento_id: int): ...
