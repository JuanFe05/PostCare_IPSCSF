"""seed tipos empresas

Revision ID: 0004_seed_tipos_empresas
Revises: 0003_add_descripcion_servicios
Create Date: 2025-12-02

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0002_seed_tipos_empresas'
down_revision = '0001_initial'
branch_labels = None
depends_on = None


def upgrade():
    """
    Insertar datos de tipos de empresas con IDs específicos (0-22).
    La tabla ya fue creada sin AUTO_INCREMENT en migración 0001.
    """
    
    # Lista de tipos de empresas con sus IDs específicos
    seeds = [
        (0, 'Vacio'),
        (1, 'Plan de beneficios en salud financiados por UPC'),
        (2, 'Particular'),
        (3, 'Prima EPS/ EOC, no asegurados SOAT'),
        (4, 'Cobertura Póliza SOAT'),
        (5, 'Cobertura ARL'),
        (6, 'Cobertura ADRES'),
        (7, 'NA'),
        (8, 'NA'),
        (9, 'NA'),
        (10, 'NA'),
        (11, 'AFP'),
        (12, 'Otras Pólizas en salud'),
        (13, 'Cobertura Régimen Especial o Excepción'),
        (14, 'NA'),
        (15, 'NA'),
        (16, 'NA'),
        (17, 'NA'),
        (18, 'NA'),
        (19, 'NA'),
        (20, 'NA'),
        (21, 'NA'),
        (22, 'Presupuesto Máximo')
    ]
    
    # Insertar cada registro (INSERT IGNORE evita errores si ya existen)
    for tipo_id, nombre in seeds:
        safe_nombre = nombre.replace("'", "''")
        op.execute(f"INSERT IGNORE INTO tipos_empresas (id, nombre) VALUES ({tipo_id}, '{safe_nombre}');")


def downgrade():
    """Eliminar los datos insertados."""
    
    # Eliminar los registros insertados
    ids_list = ",".join(str(i) for i in range(23))
    op.execute(f"DELETE FROM tipos_empresas WHERE id IN ({ids_list});")
