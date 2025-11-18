from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship
from app.configuration.app.database import Base


class User(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    estado = Column(Boolean, default=True)

    # Relación con UserRole
    roles = relationship("UserRole", back_populates="usuario")
