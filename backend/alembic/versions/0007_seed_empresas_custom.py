from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0007_seed_empresas_custom'
down_revision = '0006_seed_empresas'
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()

    # Replace existing empresas with the exact provided list.
    # WARNING: destructive operation; this deletes existing rows in the table.
    conn.execute(sa.text("DELETE FROM empresas;"))

    empresas = [
        (1, 2, 'PARTICULAR'),
        (4, 5, 'COLMENA RIESGOS PROFESIONALES'),
        (5, 5, 'SEGUROS DE VIDA SURAMERICANA S.A.'),
        (6, 4, 'ASEGURADORA SOLIDARIA DE COLOMBIA'),
        (10, 5, 'AXA COLPATRIA SEGUROS DE VIDA S.A.'),
        (16, 5, 'COMPAÑIA DE SEGUROS DE VIDA AURORA S.A.'),
        (17, 4, 'COMPAÑIA MUNDIAL DE SEGUROS S.A'),
        (36, 5, 'LA EQUIDAD SEGUROS DE VIDA O.C.'),
        (37, 4, 'LA PREVISORA S.A'),
        (38, 5, 'LIBERTY SEGUROS DE VIDA S.A. - ( A.R.L .)'),
        (39, 4, 'HDI SEGUROS COLOMBIA S.A.'),
        (40, 4, 'MAPFRE COLOMBIA SEGUROS GENERALES S.A.'),
        (41, 5, 'MAPFRE COLOMBIA VIDA SEGUROS S.A.'),
        (46, 5, 'POSITIVA COMPAÑIA DE SEGUROS'),
        (50, 5, 'S.O.S. EVENTO ARL'),
        (60, 5, 'SEGUROS BOLIVAR'),
        (61, 4, 'SEGUROS COMERCIALES BOLIVAR S.A.'),
        (64, 4, 'SEGUROS DEL ESTADO'),
        (65, 4, 'SEGUROS GENERALES SURAMERICANA S.A.'),
        (73, 4, 'AXA COLPATRIA SEGUROS S.A.'),
        (80, 4, 'LA EQUIDAD SEGUROS (SOAT)'),
        (84, 4, 'CARDIF COLOMBIA SEGUROS GENERALES S.A.'),
        (85, 4, 'ALLIANZ SEGUROS S.A.'),
        (159, 4, 'ZLS ASEGURADORA DE COLOMBIA S.A.'),
        (241, 5, 'ARP COLMENA'),
        (252, 5, 'POSITIVA VIDA AP ESCOLARES'),
        (255, 4, 'COLOMBIANA DE ASISTENCIA S.A.S'),
    ]

    for empresa_id, tipo_empresa_id, nombre in empresas:
        safe_nombre = nombre.replace("'", "''")
        conn.execute(sa.text(
            f"INSERT INTO empresas (id, id_tipo_empresa, nombre) VALUES ({empresa_id}, {tipo_empresa_id}, '{safe_nombre}');"
        ))


def downgrade():
    conn = op.get_bind()
    ids = [
        1,4,5,6,10,16,17,36,37,38,39,40,41,46,50,60,61,64,65,73,80,84,85,159,241,252,255
    ]
    ids_str = ','.join(str(i) for i in ids)
    conn.execute(sa.text(f"DELETE FROM empresas WHERE id IN ({ids_str});"))
