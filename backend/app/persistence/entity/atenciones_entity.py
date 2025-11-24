from sqlalchemy import Column, Integer, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from app.configuration.app.database import Base
from datetime import datetime


class Atencion(Base):
    __tablename__ = "atenciones"

    id = Column(Integer, primary_key=True, autoincrement=False)
    id_paciente = Column(Integer, ForeignKey("pacientes.id"), nullable=False)
    id_empresa = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    id_estado_atencion = Column(Integer, ForeignKey("estados_atenciones.id"), nullable=False)
    id_seguimiento_atencion = Column(Integer, ForeignKey("seguimientos_atenciones.id"), nullable=True)
    fecha_ingreso = Column(DateTime, default=datetime.utcnow)
    id_usuario = Column(Integer, ForeignKey("usuarios.id"), nullable=True)
    fecha_modificacion = Column(DateTime, nullable=True)
    observacion = Column(Text)

    paciente = relationship("Paciente", back_populates="atenciones")
    empresa = relationship("Empresa", back_populates="atenciones")
    estado_atencion = relationship("EstadoAtencion", back_populates="atenciones")
    seguimiento_atencion = relationship("SeguimientoAtencion", back_populates="atenciones")
    usuario = relationship("User")

    servicios_rel = relationship("AtencionServicio", back_populates="atencion")
