from sqlalchemy.orm import Session
from app.persistence.entity.user_entity import User


class UserRepository:

    def create(self, db: Session, user: User):
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    def get_by_username(self, db: Session, username: str):
        return db.query(User).filter(User.username == username).first()

    def get_all(self, db: Session):
        return db.query(User).all()

    def delete(self, db: Session, user: User):
        db.delete(user)
        db.commit()

    def update(self, db: Session, user: User, new_data: dict):
        for key, value in new_data.items():
            setattr(user, key, value)
        db.commit()
        db.refresh(user)
        return user
