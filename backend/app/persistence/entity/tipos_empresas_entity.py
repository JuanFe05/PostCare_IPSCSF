from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.configuration.app.database import Base


class TipoEmpresa(Base):
	__tablename__ = "tipos_empresas"

	id = Column(Integer, primary_key=True, autoincrement=False)
	nombre = Column(String(100), nullable=False)

	empresas = relationship("Empresa", back_populates="tipo_empresa")

