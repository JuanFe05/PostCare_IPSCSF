from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.configuration.app.database import Base


class AtencionServicio(Base):
    __tablename__ = "atenciones_servicios"

    id = Column(Integer, primary_key=True, autoincrement=True)
    id_servicio = Column(Integer, ForeignKey("servicios.id"), nullable=False)
    id_atencion = Column(Integer, ForeignKey("atenciones.id"), nullable=False)

    servicio = relationship("Servicio", back_populates="atenciones_rel")
    atencion = relationship("Atencion", back_populates="servicios_rel")
