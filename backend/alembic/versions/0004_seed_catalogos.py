from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0004_seed_catalogos'
down_revision = '0003_seed_roles_and_admin'
branch_labels = None
depends_on = None


def upgrade():
    """
    Insertar datos de catálogo para:
    - Servicios (7 registros)
    - Estados de atención (3 registros)
    - Seguimientos de atención (9 registros)
    """
    
    # Servicios
    servicios = [
        ("Radiografía", "Estudios imagenológicos mediante rayos X"),
        ("Ecografía", "Estudios diagnósticos con ultrasonido."),
        ("Terapias Física", "Intervenciones de recuperación y rehabilitación física."),
        ("Medicamentos", "Suministro o entrega de fármacos."),
        ("Procedimientos Menores", "Intervenciones médicas de baja complejidad."),
        ("Consulta Medicina General", "Atención primaria por médico general."),
        ("Ayudas Diagnósticas", "Pruebas complementarias para apoyar el diagnóstico clínico."),
    ]
    
    for nombre, descripcion in servicios:
        safe_nombre = nombre.replace("'", "''")
        safe_desc = descripcion.replace("'", "''")
        op.execute(
            f"INSERT IGNORE INTO servicios (nombre, descripcion) "
            f"VALUES ('{safe_nombre}', '{safe_desc}');"
        )
    
    # Estados de atención
    estados = [
        ("Urgencias", "Atención inmediata por condiciones agudas."),
        ("Remisión", "Envío o referencia a otro nivel de atención o especialidad."),
        ("Seguimiento Ambulatorio", "Control o evaluación continua fuera del ámbito hospitalario."),
    ]
    
    for nombre, descripcion in estados:
        safe_nombre = nombre.replace("'", "''")
        safe_desc = descripcion.replace("'", "''")
        op.execute(
            f"INSERT IGNORE INTO estados_atenciones (nombre, descripcion) "
            f"VALUES ('{safe_nombre}', '{safe_desc}');"
        )
    
    # Seguimientos de atención
    seguimientos = [
        ("Medicina General", "Seguimiento realizado por un médico general para evaluar la evolución del paciente y continuar el plan de manejo."),
        ("Terapia Física", "Control y vigilancia del avance en procesos de rehabilitación física."),
        ("Procedimientos Menores", "Revisión posterior a procedimientos médicos de baja complejidad."),
        ("Ayudas Diagnósticas", "Seguimiento relacionado con resultados o necesidad de nuevas pruebas diagnósticas."),
        ("Consulta Especializada", "Evaluación por un especialista para dar continuidad al diagnóstico o tratamiento."),
        ("Finalizado", "El proceso de seguimiento se da por concluido; no se requieren más controles."),
        ("Por Asistir", "El paciente tiene una cita programada que aún no ha atendido."),
        ("No Contactado", "No ha sido posible establecer comunicación con el paciente para su seguimiento."),
        ("No Asiste", "El paciente no acudió a la cita o control establecido."),
    ]
    
    for nombre, descripcion in seguimientos:
        safe_nombre = nombre.replace("'", "''")
        safe_desc = descripcion.replace("'", "''")
        op.execute(
            f"INSERT IGNORE INTO seguimientos_atenciones (nombre, descripcion) "
            f"VALUES ('{safe_nombre}', '{safe_desc}');"
        )


def downgrade():
    """Eliminar los datos insertados."""
    
    # Eliminar seguimientos
    seguimientos_nombres = [
        'Medicina General', 'Terapia Física', 'Procedimientos Menores',
        'Ayudas Diagnósticas', 'Consulta Especializada', 'Finalizado',
        'Por Asistir', 'No Contactado', 'No Asiste'
    ]
    for nombre in seguimientos_nombres:
        safe_nombre = nombre.replace("'", "''")
        op.execute(f"DELETE FROM seguimientos_atenciones WHERE nombre = '{safe_nombre}';")
    
    # Eliminar estados
    estados_nombres = ['Urgencias', 'Remisión', 'Seguimiento Ambulatorio']
    for nombre in estados_nombres:
        safe_nombre = nombre.replace("'", "''")
        op.execute(f"DELETE FROM estados_atenciones WHERE nombre = '{safe_nombre}';")
    
    # Eliminar servicios
    servicios_nombres = [
        'Radiografía', 'Ecografía', 'Terapias Física',
        'Medicamentos', 'Procedimientos Menores', 
        'Consulta Medicina General', 'Ayudas Diagnósticas'
    ]
    for nombre in servicios_nombres:
        safe_nombre = nombre.replace("'", "''")
        op.execute(f"DELETE FROM servicios WHERE nombre = '{safe_nombre}';")
