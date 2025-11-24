"""initial

Revision ID: 0001_initial
Revises: 
Create Date: 2025-11-23
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0001_initial'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # create roles table
    op.create_table(
        'roles',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('nombre', sa.String(length=50), nullable=False, unique=True),
        sa.Column('descripcion', sa.String(length=255), nullable=True),
    )

    # create usuarios table
    op.create_table(
        'usuarios',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('username', sa.String(length=50), nullable=False, unique=True),
        sa.Column('email', sa.String(length=255), nullable=False, unique=True),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('estado', sa.Boolean(), nullable=True, server_default=sa.text('1')),
    )

    # create association usuarios_roles
    op.create_table(
        'usuarios_roles',
        sa.Column('id_usuario', sa.Integer(), sa.ForeignKey('usuarios.id'), primary_key=True),
        sa.Column('id_rol', sa.Integer(), sa.ForeignKey('roles.id'), primary_key=True),
    )


def downgrade():
    op.drop_table('usuarios_roles')
    op.drop_table('usuarios')
    op.drop_table('roles')
