from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.configuration.app.database import Base


class Servicio(Base):
	__tablename__ = "servicios"

	id = Column(Integer, primary_key=True, autoincrement=True)
	nombre = Column(String(255), nullable=False)

	atenciones_rel = relationship("AtencionServicio", back_populates="servicio")

