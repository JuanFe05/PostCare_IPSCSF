"""change ids to string

Revision ID: 0002_change_ids_to_string
Revises: 0001_initial
Create Date: 2025-12-02

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0002_change_ids_to_string'
down_revision = '0001_initial'
branch_labels = None
depends_on = None


def upgrade():
    """
    Cambiar los IDs de pacientes y atenciones de INT a VARCHAR(50)
    para soportar identificadores alfanuméricos.
    """
    
    # 1. Detectar y eliminar todas las foreign key constraints que referencian pacientes.id o atenciones.id
    conn = op.get_bind()
    fks = conn.execute(sa.text(
        "SELECT CONSTRAINT_NAME, TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME "
        "FROM information_schema.KEY_COLUMN_USAGE "
        "WHERE TABLE_SCHEMA = DATABASE() AND REFERENCED_COLUMN_NAME='id' "
        "AND REFERENCED_TABLE_NAME IN ('pacientes','atenciones')"
    )).fetchall()
    
    for fk in fks:
        fk_name = fk[0]
        table_name = fk[1]
        conn.execute(sa.text(f"ALTER TABLE `{table_name}` DROP FOREIGN KEY `{fk_name}`"))
    
    # 2. Modificar tabla pacientes - cambiar id a VARCHAR(50)
    op.alter_column('pacientes', 'id',
                    existing_type=sa.Integer(),
                    type_=sa.String(50),
                    existing_nullable=False,
                    autoincrement=False)
    
    # 3. Modificar tabla atenciones - cambiar id_paciente a VARCHAR(50)
    op.alter_column('atenciones', 'id_paciente',
                    existing_type=sa.Integer(),
                    type_=sa.String(50),
                    existing_nullable=False)
    
    # 4. Modificar tabla atenciones - cambiar id a VARCHAR(50)
    op.alter_column('atenciones', 'id',
                    existing_type=sa.Integer(),
                    type_=sa.String(50),
                    existing_nullable=False,
                    autoincrement=False)
    
    # 5. Modificar tabla atenciones_servicios - cambiar id_atencion a VARCHAR(50)
    op.alter_column('atenciones_servicios', 'id_atencion',
                    existing_type=sa.Integer(),
                    type_=sa.String(50),
                    existing_nullable=False)
    
    # 6. Recrear foreign key constraints
    op.create_foreign_key(None, 'atenciones', 'pacientes', ['id_paciente'], ['id'])
    op.create_foreign_key(None, 'atenciones_servicios', 'atenciones', ['id_atencion'], ['id'])


def downgrade():
    """Revertir cambios de VARCHAR(50) a INT."""
    
    # 1. Detectar y eliminar foreign key constraints
    conn = op.get_bind()
    fks = conn.execute(sa.text(
        "SELECT CONSTRAINT_NAME, TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME "
        "FROM information_schema.KEY_COLUMN_USAGE "
        "WHERE TABLE_SCHEMA = DATABASE() AND REFERENCED_COLUMN_NAME='id' "
        "AND REFERENCED_TABLE_NAME IN ('pacientes','atenciones')"
    )).fetchall()
    
    for fk in fks:
        fk_name = fk[0]
        table_name = fk[1]
        conn.execute(sa.text(f"ALTER TABLE `{table_name}` DROP FOREIGN KEY `{fk_name}`"))
    
    # 2. Revertir cambios en orden inverso
    op.alter_column('atenciones_servicios', 'id_atencion',
                    existing_type=sa.String(50),
                    type_=sa.Integer(),
                    existing_nullable=False)
    
    op.alter_column('atenciones', 'id',
                    existing_type=sa.String(50),
                    type_=sa.Integer(),
                    existing_nullable=False,
                    autoincrement=False)
    
    op.alter_column('atenciones', 'id_paciente',
                    existing_type=sa.String(50),
                    type_=sa.Integer(),
                    existing_nullable=False)
    
    op.alter_column('pacientes', 'id',
                    existing_type=sa.String(50),
                    type_=sa.Integer(),
                    existing_nullable=False,
                    autoincrement=False)
    
    # 3. Recrear foreign key constraints
    op.create_foreign_key(None, 'atenciones', 'pacientes', ['id_paciente'], ['id'])
    op.create_foreign_key(None, 'atenciones_servicios', 'atenciones', ['id_atencion'], ['id'])
