"""change_ids_to_string

Revision ID: 0003_change_ids_to_string
Revises: 0002_add_atenciones_and_related
Create Date: 2025-11-24

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0003_change_ids_to_string'
down_revision = '0002_add_atenciones_and_related'
branch_labels = None
depends_on = None


def upgrade():
    # Deshabilitar restricciones de FK temporalmente
    op.execute('SET FOREIGN_KEY_CHECKS=0')
    
    # Modificar tabla pacientes - cambiar id a VARCHAR(50)
    op.alter_column('pacientes', 'id',
                    existing_type=sa.Integer(),
                    type_=sa.String(50),
                    existing_nullable=False)
    
    # Modificar tabla atenciones - cambiar id y id_paciente a VARCHAR(50)
    op.alter_column('atenciones', 'id',
                    existing_type=sa.Integer(),
                    type_=sa.String(50),
                    existing_nullable=False)
    
    op.alter_column('atenciones', 'id_paciente',
                    existing_type=sa.Integer(),
                    type_=sa.String(50),
                    existing_nullable=False)
    
    # Reactivar restricciones de FK
    op.execute('SET FOREIGN_KEY_CHECKS=1')


def downgrade():
    # Deshabilitar restricciones de FK temporalmente
    op.execute('SET FOREIGN_KEY_CHECKS=0')
    
    # Revertir cambios
    op.alter_column('atenciones', 'id_paciente',
                    existing_type=sa.String(50),
                    type_=sa.Integer(),
                    existing_nullable=False)
    
    op.alter_column('atenciones', 'id',
                    existing_type=sa.String(50),
                    type_=sa.Integer(),
                    existing_nullable=False)
    
    op.alter_column('pacientes', 'id',
                    existing_type=sa.String(50),
                    type_=sa.Integer(),
                    existing_nullable=False)
    
    # Reactivar restricciones de FK
    op.execute('SET FOREIGN_KEY_CHECKS=1')
