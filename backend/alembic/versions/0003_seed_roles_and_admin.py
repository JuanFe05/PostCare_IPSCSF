"""seed roles and admin user

Revision ID: 0005_seed_roles_and_admin
Revises: 0004_seed_tipos_empresas
Create Date: 2025-12-02

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0003_seed_roles_and_admin'
down_revision = '0002_seed_tipos_empresas'
branch_labels = None
depends_on = None


def upgrade():
    """
    Insertar roles (ADMINISTRADOR, FACTURADOR, ASESOR) y 
    crear usuario administrador por defecto.
    Username: admin
    Password: admin_2025*
    """
    
    # Insertar roles con IDs específicos (idempotente con INSERT IGNORE)
    roles = [
        (1, 'ADMINISTRADOR', 'Es el responsable de coordinar, supervisar y asegurar el funcionamiento eficiente de los procesos administrativos.'),
        (2, 'FACTURADOR', 'Es el Encargado de gestionar y garantizar el proceso de facturación de los servicios de salud prestados a los pacientes'),
        (3, 'ASESOR', 'Es el encargado de orientar y brindar apoyo a los usuarios o áreas internas, ofreciendo información clara, acompañamiento y soluciones.'),
    ]
    
    for role_id, nombre, descripcion in roles:
        safe_nombre = nombre.replace("'", "''")
        safe_desc = descripcion.replace("'", "''")
        op.execute(
            f"INSERT IGNORE INTO roles (id, nombre, descripcion) "
            f"VALUES ({role_id}, '{safe_nombre}', '{safe_desc}');"
        )
    
    # Hash bcrypt de 'admin_2025*'
    password_hash = '$2a$12$VYemNlvR2u4U2CrS9nTpXeNB3BhAl6xny9d2VG4z3A4.kc5/8X1bW'
    
    # Insertar usuario admin (idempotente)
    op.execute(
        f"INSERT IGNORE INTO usuarios (username, email, password_hash, estado) "
        f"VALUES ('admin', 'admin@postcare.local', '{password_hash}', 1);"
    )
    
    # Asignar rol ADMINISTRADOR (id=1) al usuario admin
    op.execute(
        "INSERT IGNORE INTO usuarios_roles (id_usuario, id_rol) "
        "SELECT u.id, 1 FROM usuarios u WHERE u.username = 'admin' LIMIT 1;"
    )


def downgrade():
    """Eliminar el usuario admin, su relación con roles y los tres roles insertados."""
    
    # Eliminar relación usuario-rol para admin
    op.execute(
        "DELETE FROM usuarios_roles WHERE id_usuario IN (SELECT id FROM usuarios WHERE username = 'admin');"
    )
    
    # Eliminar usuario admin
    op.execute("DELETE FROM usuarios WHERE username = 'admin';")
    
    # Eliminar roles
    op.execute("DELETE FROM roles WHERE id IN (1, 2, 3);")
