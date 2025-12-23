from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.configuration.app.database import Base


class Empresa(Base):
	__tablename__ = "empresas"

	id = Column(Integer, primary_key=True, autoincrement=False)
	id_tipo_empresa = Column(Integer, ForeignKey("tipos_empresas.id"), nullable=False)
	nombre = Column(String(255), nullable=False)

	tipo_empresa = relationship("TipoEmpresa", back_populates="empresas")
	atenciones = relationship("Atencion", back_populates="empresa")

