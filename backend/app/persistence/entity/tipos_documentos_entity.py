from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.configuration.app.database import Base


class TipoDocumento(Base):
    __tablename__ = "tipos_documentos"

    id = Column(Integer, primary_key=True, autoincrement=False)
    siglas = Column(String(10), nullable=False)
    descripcion = Column(String(255))

    # Relación con pacientes
    pacientes = relationship("Paciente", back_populates="tipo_documento")
