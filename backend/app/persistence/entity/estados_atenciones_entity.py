from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.configuration.app.database import Base


class EstadoAtencion(Base):
    __tablename__ = "estados_atenciones"

    id = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(100), nullable=False)
    descripcion = Column(String(255))

    atenciones = relationship("Atencion", back_populates="estado_atencion")
