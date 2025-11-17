from sqlalchemy.orm import Session
from app.persistence.entity.role_entity import Role


class RoleRepository:

    def create(self, db: Session, role: Role):
        db.add(role)
        db.commit()
        db.refresh(role)
        return role

    def get_all(self, db: Session):
        return db.query(Role).all()

    def get_by_name(self, db: Session, name: str):
        return db.query(Role).filter(Role.nombre == name).first()

    def delete(self, db: Session, role: Role):
        db.delete(role)
        db.commit()
