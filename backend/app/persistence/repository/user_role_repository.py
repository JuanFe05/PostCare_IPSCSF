from sqlalchemy.orm import Session
from app.persistence.entity.user_role_entity import UserRole

class UserRoleRepository:

    def assign_role(self, db: Session, user_role: UserRole):
        db.add(user_role)
        db.commit()
        return user_role

    def get_roles_of_user(self, db: Session, user_id: int):
        return db.query(UserRole).filter(UserRole.id_usuario == user_id).all()
