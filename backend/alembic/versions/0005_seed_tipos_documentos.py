"""seed tipos_documentos

Revision ID: 0005_seed_tipos_documentos
Revises: 0004_seed_catalogos
Create Date: 2025-12-03 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0005_seed_tipos_documentos'
down_revision = '0004_seed_catalogos'
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()
    # Insertar varias filas de forma idempotente (MySQL: ON DUPLICATE KEY UPDATE)
    conn.execute(sa.text("""
        INSERT INTO tipos_documentos (id, siglas, descripcion) VALUES
            (0, 'VA', 'Vacio'),
            (1, 'NA', 'NA'),
            (2, 'NA', 'NA'),
            (3, 'AS', 'Adulto sin Identificación'),
            (4, 'CC', 'Cédula de ciudadania'),
            (5, 'CE', 'Cédula de extranjeria'),
            (6, 'MS', 'Menor sin Identificación'),
            (7, 'NIT', 'Número Tributario'),
            (8, 'NU', 'Número Único'),
            (9, 'PA', 'Pasaporte'),
            (10, 'RC', 'Registro Civil'),
            (11, 'TI', 'Tarjeta de Identidad'),
            (12, 'NA', 'NA'),
            (13, 'PE', 'Permiso Especial de Permanencia'),
            (14, 'PT', 'Permiso por Protección Temporal'),
            (15, 'DE', 'Documento de Identificación de Extranjero'),
            (16, 'CN', 'Certificado de Nacido Vivo')
        ON DUPLICATE KEY UPDATE
            siglas = VALUES(siglas),
            descripcion = VALUES(descripcion);
    """))


def downgrade():
    conn = op.get_bind()
    conn.execute(sa.text("""
        DELETE FROM tipos_documentos
        WHERE id IN (0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16);
    """))
