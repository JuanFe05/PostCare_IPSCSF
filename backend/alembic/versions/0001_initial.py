from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0001_initial'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    """
    Crear todas las tablas de la base de datos en su estructura inicial.
    Los IDs de pacientes y atenciones son INT en esta versión inicial.
    """
    
    # ===== TABLAS DE AUTENTICACIÓN Y ROLES =====
    
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
    
    # ===== TABLAS DE CATÁLOGOS =====
    
    # tipos_documentos (id provided by app, not autoincrement)
    op.create_table(
        'tipos_documentos',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=False),
        sa.Column('siglas', sa.String(length=10), nullable=False),
        sa.Column('descripcion', sa.String(length=255), nullable=True),
    )

    # tipos_empresas (sin autoincrement - IDs específicos se insertan en migración 0004)
    op.create_table(
        'tipos_empresas',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=False),
        sa.Column('nombre', sa.String(length=100), nullable=False),
    )

    # servicios (autoincrement) - sin columna descripcion en esta versión
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
    
    # ===== TABLAS DE NEGOCIO =====

    # empresas (id provided by app)
    op.create_table(
        'empresas',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=False),
        sa.Column('id_tipo_empresa', sa.Integer(), sa.ForeignKey('tipos_empresas.id'), nullable=False),
        sa.Column('nombre', sa.String(length=255), nullable=False),
    )

    # pacientes (id provided by app) - ID es INT en esta versión
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

    # atenciones (id provided by app) - ID e id_paciente son INT en esta versión
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

    # atenciones_servicios (join table) - id_atencion es INT en esta versión
    op.create_table(
        'atenciones_servicios',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('id_servicio', sa.Integer(), sa.ForeignKey('servicios.id'), nullable=False),
        sa.Column('id_atencion', sa.Integer(), sa.ForeignKey('atenciones.id'), nullable=False),
    )


def downgrade():
    """Eliminar todas las tablas en orden inverso."""
    op.drop_table('atenciones_servicios')
    op.drop_table('atenciones')
    op.drop_table('pacientes')
    op.drop_table('empresas')
    op.drop_table('seguimientos_atenciones')
    op.drop_table('estados_atenciones')
    op.drop_table('servicios')
    op.drop_table('tipos_empresas')
    op.drop_table('tipos_documentos')
    op.drop_table('usuarios_roles')
    op.drop_table('usuarios')
    op.drop_table('roles')
