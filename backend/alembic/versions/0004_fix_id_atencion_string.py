from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0004_fix_id_atencion_string'
down_revision = '0003_change_ids_to_string'
branch_labels = None
depends_on = None

def upgrade():
    # MySQL: need to drop/disable FK checks to alter FK column types safely
    op.execute('SET FOREIGN_KEY_CHECKS=0')
    # Alter atenciones_servicios.id_atencion from INTEGER to VARCHAR(50)
    op.alter_column('atenciones_servicios', 'id_atencion',
                    existing_type=sa.Integer(),
                    type_=sa.String(50),
                    existing_nullable=False)
    op.execute('SET FOREIGN_KEY_CHECKS=1')


def downgrade():
    op.execute('SET FOREIGN_KEY_CHECKS=0')
    op.alter_column('atenciones_servicios', 'id_atencion',
                    existing_type=sa.String(50),
                    type_=sa.Integer(),
                    existing_nullable=False)
    op.execute('SET FOREIGN_KEY_CHECKS=1')
