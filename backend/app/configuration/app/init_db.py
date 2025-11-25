import pkgutil
import importlib
from app.configuration.app.database import Base, engine
import app.persistence.entity
from app.configuration.app.database import SessionLocal

# Entities used for seeding
from app.persistence.entity.servicios_entity import Servicio
from app.persistence.entity.estados_atenciones_entity import EstadoAtencion
from app.persistence.entity.seguimientos_atenciones_entity import SeguimientoAtencion


def init_db():
    # Importar dinámicamente todas las entidades
    found = []
    for loader, module_name, is_pkg in pkgutil.iter_modules(app.persistence.entity.__path__):
        found.append(module_name)
        try:
            importlib.import_module(f"app.persistence.entity.{module_name}")
            print(f"Imported entity module: app.persistence.entity.{module_name}")
        except Exception as e:
            print(f"Error importing module app.persistence.entity.{module_name}: {e}")

    print(f"Entity modules discovered: {found}")

    # Crear todas las tablas
    try:
        Base.metadata.create_all(bind=engine)
        print("Todas las tablas creadas (create_all ejecutado)")
    except Exception as e:
        print(f"Error ejecutando create_all: {e}")

    # Insertar datos semilla idempotentes
    try:
        db = SessionLocal()

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
        for name, desc in servicios:
            exists = db.query(Servicio).filter(Servicio.nombre == name).first()
            if not exists:
                db.add(Servicio(nombre=name, descripcion=desc))
                print(f"Insertando servicio: {name}")

        # Estados de atención
        estados = [
            ("Urgencias", "Atención inmediata por condiciones agudas."),
            ("Remisión", "Envío o referencia a otro nivel de atención o especialidad."),
            ("Seguimiento Ambulatorio", "Control o evaluación continua fuera del ámbito hospitalario."),
        ]
        for name, desc in estados:
            exists = db.query(EstadoAtencion).filter(EstadoAtencion.nombre == name).first()
            if not exists:
                db.add(EstadoAtencion(nombre=name, descripcion=desc))
                print(f"Insertando estado de atención: {name}")

        # Seguimientos
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
        for name, desc in seguimientos:
            exists = db.query(SeguimientoAtencion).filter(SeguimientoAtencion.nombre == name).first()
            if not exists:
                db.add(SeguimientoAtencion(nombre=name, descripcion=desc))
                print(f"Insertando seguimiento: {name}")

        db.commit()
        db.close()
        print("Datos semilla insertados/verificados correctamente")
    except Exception as e:
        print(f"Error insertando datos semilla: {e}")
