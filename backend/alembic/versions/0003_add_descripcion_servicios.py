"""add descripcion to servicios

Revision ID: 0003_add_descripcion_servicios
Revises: 0002_change_ids_to_string
Create Date: 2025-12-02

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0003_add_descripcion_servicios'
down_revision = '0002_change_ids_to_string'
branch_labels = None
depends_on = None


def upgrade():
    """Agregar columna descripcion a la tabla servicios."""
    
    # Verificar si la columna ya existe (idempotencia)
    conn = op.get_bind()
    result = conn.execute(sa.text(
        "SELECT COUNT(*) FROM information_schema.COLUMNS "
        "WHERE TABLE_SCHEMA = DATABASE() "
        "AND TABLE_NAME = 'servicios' "
        "AND COLUMN_NAME = 'descripcion'"
    )).scalar()
    
    if result == 0:
        op.add_column('servicios', sa.Column('descripcion', sa.Text(), nullable=True))


def downgrade():
    """Eliminar columna descripcion de la tabla servicios."""
    
    # Verificar si la columna existe antes de eliminarla
    conn = op.get_bind()
    result = conn.execute(sa.text(
        "SELECT COUNT(*) FROM information_schema.COLUMNS "
        "WHERE TABLE_SCHEMA = DATABASE() "
        "AND TABLE_NAME = 'servicios' "
        "AND COLUMN_NAME = 'descripcion'"
    )).scalar()
    
    if result > 0:
        op.drop_column('servicios', 'descripcion')
