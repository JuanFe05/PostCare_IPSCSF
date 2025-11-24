from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.configuration.app.database import Base


class Paciente(Base):
	__tablename__ = "pacientes"

	id = Column(Integer, primary_key=True, autoincrement=False)
	id_tipo_documento = Column(Integer, ForeignKey("tipos_documentos.id"), nullable=False)
	primer_nombre = Column(String(100), nullable=False)
	segundo_nombre = Column(String(100))
	primer_apellido = Column(String(100), nullable=False)
	segundo_apellido = Column(String(100))
	telefono_uno = Column(String(50))
	telefono_dos = Column(String(50))
	email = Column(String(255))

	tipo_documento = relationship("TipoDocumento", back_populates="pacientes")
	atenciones = relationship("Atencion", back_populates="paciente")

