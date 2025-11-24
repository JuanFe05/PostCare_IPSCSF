"""
Revision environment template for Alembic.
"""
% from alembic import op
% from sqlalchemy import *

"""
Auto-generated Alembic script template.
"""

revision = '${rev_id}'
down_revision = ${repr(down_revision)}
branch_labels = ${repr(branch_labels)}
depends_on = ${repr(depends_on)}

def upgrade():
    ${upgrades if upgrades else 'pass'}


def downgrade():
    ${downgrades if downgrades else 'pass'}
