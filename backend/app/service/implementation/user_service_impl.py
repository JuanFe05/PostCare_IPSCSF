from sqlalchemy.orm import Session
from app.configuration.app.database import SessionLocal
from app.persistence.repository.user_repository import UserRepository
from app.persistence.repository.user_role_repository import UserRoleRepository
from app.persistence.entity.role_entity import Role
from app.presentation.dto.user_dto import UserCreateDto, UserResponseDto, UserUpdateDto
from app.configuration.security.password_utils import hash_password
from app.persistence.entity.user_entity import User
from app.persistence.entity.user_role_entity import UserRole


class UserServiceImpl:

    def __init__(self):
        self.user_repo = UserRepository()
        self.user_role_repo = UserRoleRepository()

    def create_user(self, data: UserCreateDto):
        db: Session = SessionLocal()

        try:
            # Crear usuario
            new_user = User(
                username=data.username,
                email=data.email,
                password_hash=hash_password(data.password),
                estado=True
            )
            user = self.user_repo.create(db, new_user)

            # Asignar rol
            user_role = UserRole(
                id_usuario=user.id,
                id_rol=data.role_id
            )
            self.user_role_repo.assign_role(db, user_role)

            # Buscar nombre del rol
            role = db.query(Role).filter(Role.id == data.role_id).first()

            return UserResponseDto(
                id=user.id,
                username=user.username,
                email=user.email,
                estado=user.estado,
                role_id=role.id,
                role_name=role.nombre
            )

        finally:
            db.close()

    def get_all_users(self):
        db = SessionLocal()
        users = self.user_repo.get_all(db)

        result = []
        for u in users:
            rel = self.user_role_repo.get_role_of_user(db, u.id)
            role_name = rel.rol.nombre if rel else None

            result.append({
                "id": u.id,
                "username": u.username,
                "email": u.email,
                "estado": u.estado,
                "role_id": rel.id_rol if rel else None,
                "role_name": role_name
            })

        db.close()
        return result

    def update_user(self, user_id: int, data: UserUpdateDto):
        db: Session = SessionLocal()

        try:
            user = self.user_repo.get_by_id(db, user_id)
            if not user:
                raise Exception("Usuario no encontrado")

            update_data = {}

            if data.username:
                update_data["username"] = data.username
            if data.email:
                update_data["email"] = data.email
            if data.password:
                update_data["password_hash"] = hash_password(data.password)
            if data.estado is not None:
                update_data["estado"] = data.estado

            # Actualizar usuario
            updated_user = self.user_repo.update(db, user, update_data)

            # Actualizar rol (si cambió)
            role_id = None
            role_name = None

            if data.role_id is not None:
                # Borrar rol anterior
                db.query(UserRole).filter(UserRole.id_usuario == user_id).delete()
                db.commit()

                # Asignar nuevo
                new_role_rel = UserRole(id_usuario=user_id, id_rol=data.role_id)
                self.user_role_repo.assign_role(db, new_role_rel)

                role = db.query(Role).filter(Role.id == data.role_id).first()
                role_id = role.id
                role_name = role.nombre
            else:
                # Obtener rol actual
                role_rel = self.user_role_repo.get_role_of_user(db, user_id)
                if role_rel:
                    rr = role_rel[0]
                    role = db.query(Role).filter(Role.id == rr.id_rol).first()
                    role_id = role.id
                    role_name = role.nombre

            return UserResponseDto(
                id=updated_user.id,
                username=updated_user.username,
                email=updated_user.email,
                estado=updated_user.estado,
                role_id=role_id,
                role_name=role_name
            )

        finally:
            db.close()

    def delete_user(self, user_id: int):
        db: Session = SessionLocal()

        try:
            user = self.user_repo.get_by_id(db, user_id)
            if not user:
                raise Exception("Usuario no encontrado")

            # Eliminar relación rol primero
            db.query(UserRole).filter(UserRole.id_usuario == user_id).delete()
            db.commit()

            self.user_repo.delete(db, user)

        finally:
            db.close()
