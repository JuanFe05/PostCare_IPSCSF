from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0002_add_atenciones'
down_revision = '0001_initial'
branch_labels = None
depends_on = None


def upgrade():
    # tipos_documentos (id provided by app, not autoincrement)
    op.create_table(
        'tipos_documentos',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=False),
        sa.Column('siglas', sa.String(length=10), nullable=False),
        sa.Column('descripcion', sa.String(length=255), nullable=True),
    )

    # tipos_empresas (autoincrement)
    op.create_table(
        'tipos_empresas',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('nombre', sa.String(length=100), nullable=False),
    )

    # empresas (id provided by app)
    op.create_table(
        'empresas',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=False),
        sa.Column('id_tipo_empresa', sa.Integer(), sa.ForeignKey('tipos_empresas.id'), nullable=False),
        sa.Column('nombre', sa.String(length=255), nullable=False),
    )

    # pacientes (id provided by app)
    op.create_table(
        'pacientes',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=False),
        sa.Column('id_tipo_documento', sa.Integer(), sa.ForeignKey('tipos_documentos.id'), nullable=False),
        sa.Column('primer_nombre', sa.String(length=100), nullable=False),
        sa.Column('segundo_nombre', sa.String(length=100), nullable=True),
        sa.Column('primer_apellido', sa.String(length=100), nullable=False),
        sa.Column('segundo_apellido', sa.String(length=100), nullable=True),
        sa.Column('telefono_uno', sa.String(length=50), nullable=True),
        sa.Column('telefono_dos', sa.String(length=50), nullable=True),
        sa.Column('email', sa.String(length=255), nullable=True),
    )

    # servicios (autoincrement)
    op.create_table(
        'servicios',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('nombre', sa.String(length=255), nullable=False),
    )

    # estados_atenciones (autoincrement)
    op.create_table(
        'estados_atenciones',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('nombre', sa.String(length=100), nullable=False),
        sa.Column('descripcion', sa.String(length=255), nullable=True),
    )

    # seguimientos_atenciones (autoincrement)
    op.create_table(
        'seguimientos_atenciones',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('nombre', sa.String(length=100), nullable=False),
        sa.Column('descripcion', sa.String(length=255), nullable=True),
    )

    # atenciones (id provided by app)
    op.create_table(
        'atenciones',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=False),
        sa.Column('id_paciente', sa.Integer(), sa.ForeignKey('pacientes.id'), nullable=False),
        sa.Column('id_empresa', sa.Integer(), sa.ForeignKey('empresas.id'), nullable=False),
        sa.Column('id_estado_atencion', sa.Integer(), sa.ForeignKey('estados_atenciones.id'), nullable=False),
        sa.Column('id_seguimiento_atencion', sa.Integer(), sa.ForeignKey('seguimientos_atenciones.id'), nullable=True),
        sa.Column('fecha_ingreso', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('id_usuario', sa.Integer(), sa.ForeignKey('usuarios.id'), nullable=True),
        sa.Column('fecha_modificacion', sa.DateTime(), nullable=True),
        sa.Column('observacion', sa.Text(), nullable=True),
    )

    # atenciones_servicios (join table) — explicit id autoincrement
    op.create_table(
        'atenciones_servicios',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('id_servicio', sa.Integer(), sa.ForeignKey('servicios.id'), nullable=False),
        sa.Column('id_atencion', sa.Integer(), sa.ForeignKey('atenciones.id'), nullable=False),
    )


def downgrade():
    op.drop_table('atenciones_servicios')
    op.drop_table('atenciones')
    op.drop_table('seguimientos_atenciones')
    op.drop_table('estados_atenciones')
    op.drop_table('servicios')
    op.drop_table('pacientes')
    op.drop_table('empresas')
    op.drop_table('tipos_empresas')
    op.drop_table('tipos_documentos')
