from alembic import op
import sqlalchemy as sa
import os
import bcrypt

# Identificadores de revisión, utilizados por Alembic.
revision = '0003_seed_roles_and_admin'
down_revision = '0002_seed_tipos_empresas'
branch_labels = None
depends_on = None


def upgrade():
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
    
    # Leer username y password desde variables de entorno (obligatorio)
    admin_username = os.environ['ADMIN_USERNAME']
    admin_password = os.environ['ADMIN_PASSWORD']

    # Generar hash bcrypt de la contraseña
    password_hash = bcrypt.hashpw(admin_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    # Sanitizar antes de construir SQL literal
    safe_username = admin_username.replace("'", "''")
    safe_password_hash = password_hash.replace("'", "''")

    # Insertar usuario admin (idempotente)
    op.execute(
        f"INSERT IGNORE INTO usuarios (username, email, password_hash, estado) "
        f"VALUES ('{safe_username}', 'admin@postcare.local', '{safe_password_hash}', 1);"
    )

    # Asignar rol ADMINISTRADOR (id=1) al usuario admin
    op.execute(
        "INSERT IGNORE INTO usuarios_roles (id_usuario, id_rol) "
        f"SELECT u.id, 1 FROM usuarios u WHERE u.username = '{safe_username}' LIMIT 1;"
    )


def downgrade():
    """Eliminar el usuario admin, su relación con roles y los tres roles insertados."""
    # Determinar username desde la variable de entorno (obligatorio)
    admin_username = os.environ['ADMIN_USERNAME']
    safe_username = admin_username.replace("'", "''")

    # Eliminar relación usuario-rol para admin
    op.execute(
        f"DELETE FROM usuarios_roles WHERE id_usuario IN (SELECT id FROM usuarios WHERE username = '{safe_username}');"
    )

    # Eliminar usuario admin
    op.execute(f"DELETE FROM usuarios WHERE username = '{safe_username}';")

    # Eliminar roles
    op.execute("DELETE FROM roles WHERE id IN (1, 2, 3);")
