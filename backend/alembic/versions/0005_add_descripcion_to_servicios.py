from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0005_add_descripcion_to_servicios'
down_revision = '0004_fix_id_atencion_string'
branch_labels = None
depends_on = None


def upgrade():
    # Add nullable text column 'descripcion' to 'servicios'
    op.add_column('servicios', sa.Column('descripcion', sa.Text(), nullable=True))


def downgrade():
    # Remove the 'descripcion' column
    op.drop_column('servicios', 'descripcion')
