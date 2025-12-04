from abc import ABC, abstractmethod
from sqlalchemy.orm import Session
from typing import Dict, Any


class SyncServiceInterface(ABC):

    @staticmethod
    @abstractmethod
    def sync_from_external_db(
        db_local: Session,
        external_db_url: str,
        query_pacientes: str,
        query_atenciones: str
    ) -> Dict[str, Any]: ...
