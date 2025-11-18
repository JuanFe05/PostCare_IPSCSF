from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.configuration.app.database import Base


class UserRole(Base):
    __tablename__ = "usuarios_roles"

    id_usuario = Column(Integer, ForeignKey("usuarios.id"), primary_key=True)
    id_rol = Column(Integer, ForeignKey("roles.id"), primary_key=True)

    # Relaciones
    usuario = relationship("User", back_populates="roles")
    rol = relationship("Role", back_populates="usuarios")
