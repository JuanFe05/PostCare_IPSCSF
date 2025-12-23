from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, and_
from datetime import datetime, timedelta
from typing import List, Optional
from app.persistence.entity.atenciones_entity import Atencion
from app.persistence.entity.atenciones_servicios_entity import AtencionServicio


def get_atencion_by_id(db: Session, atencion_id: str) -> Atencion | None:
    """Obtiene una atención por ID con todas sus relaciones"""
    return db.query(Atencion).filter(Atencion.id == atencion_id).first()


def get_atencion_with_relations(db: Session, atencion_id: str) -> Atencion | None:
    """Obtiene una atención con todas las relaciones cargadas"""
    return db.query(Atencion)\
        .options(
            joinedload(Atencion.paciente),
            joinedload(Atencion.empresa),
            joinedload(Atencion.estado_atencion),
            joinedload(Atencion.seguimiento_atencion),
            joinedload(Atencion.servicios_rel).joinedload(AtencionServicio.servicio)
        )\
        .filter(Atencion.id == atencion_id)\
        .first()


def get_all_atenciones(db: Session, skip: int = 0, limit: int = 100, fecha: datetime | None = None) -> List[Atencion]:
    """Obtiene todas las atenciones con paginación. Si `fecha` se provee (date/datetime), filtra por ese día."""
    query = db.query(Atencion)\
        .options(
            joinedload(Atencion.paciente),
            joinedload(Atencion.empresa),
            joinedload(Atencion.estado_atencion),
            joinedload(Atencion.seguimiento_atencion),
            joinedload(Atencion.usuario),
            joinedload(Atencion.servicios_rel).joinedload(AtencionServicio.servicio)
        )\
    
    # Aplicar filtro por fecha si fue proporcionada (comparar rango [fecha, fecha+1d))
    if fecha is not None:
        # Normalizar fecha: si vino como date, convertir a datetime al inicio del día
        if isinstance(fecha, datetime):
            start = datetime(fecha.year, fecha.month, fecha.day)
        else:
            # fecha puede ser objeto tipo date
            start = datetime(fecha.year, fecha.month, fecha.day)
        end = start + timedelta(days=1)
        query = query.filter(Atencion.fecha_ingreso >= start, Atencion.fecha_ingreso < end)

    return query.offset(skip).limit(limit).all()


def get_atenciones_by_paciente(db: Session, paciente_id: str) -> List[Atencion]:
    """Obtiene todas las atenciones de un paciente"""
    return db.query(Atencion)\
        .options(
            joinedload(Atencion.empresa),
            joinedload(Atencion.estado_atencion),
            joinedload(Atencion.seguimiento_atencion),
            joinedload(Atencion.servicios_rel).joinedload(AtencionServicio.servicio)
        )\
        .filter(Atencion.id_paciente == paciente_id)\
        .all()


def get_atenciones_by_empresa(db: Session, empresa_id: int) -> List[Atencion]:
    """Obtiene todas las atenciones de una empresa"""
    return db.query(Atencion)\
        .options(
            joinedload(Atencion.paciente),
            joinedload(Atencion.estado_atencion),
            joinedload(Atencion.seguimiento_atencion),
            joinedload(Atencion.servicios_rel).joinedload(AtencionServicio.servicio)
        )\
        .filter(Atencion.id_empresa == empresa_id)\
        .all()


def get_atenciones_by_estado(db: Session, estado_id: int) -> List[Atencion]:
    """Obtiene todas las atenciones por estado"""
    return db.query(Atencion)\
        .options(
            joinedload(Atencion.paciente),
            joinedload(Atencion.empresa),
            joinedload(Atencion.seguimiento_atencion),
            joinedload(Atencion.servicios_rel).joinedload(AtencionServicio.servicio)
        )\
        .filter(Atencion.id_estado_atencion == estado_id)\
        .all()


def search_atenciones(
    db: Session,
    search_term: Optional[str] = None,
    empresa_id: Optional[int] = None,
    estado_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100
) -> List[Atencion]:
    """Busca atenciones con filtros opcionales"""
    query = db.query(Atencion)\
        .options(
            joinedload(Atencion.paciente),
            joinedload(Atencion.empresa),
            joinedload(Atencion.estado_atencion),
            joinedload(Atencion.seguimiento_atencion),
            joinedload(Atencion.servicios_rel).joinedload(AtencionServicio.servicio)
        )
    
    # Aplicar filtros
    filters = []
    
    if search_term:
        # Buscar en ID de atención, nombre del paciente
        filters.append(
            or_(
                Atencion.id.ilike(f"%{search_term}%"),
                Atencion.paciente.has(
                    or_(
                        Atencion.paciente.property.mapper.class_.primer_nombre.ilike(f"%{search_term}%"),
                        Atencion.paciente.property.mapper.class_.primer_apellido.ilike(f"%{search_term}%")
                    )
                )
            )
        )
    
    if empresa_id:
        filters.append(Atencion.id_empresa == empresa_id)
    
    if estado_id:
        filters.append(Atencion.id_estado_atencion == estado_id)
    
    if filters:
        query = query.filter(and_(*filters))
    
    return query.offset(skip).limit(limit).all()


def create_atencion(db: Session, atencion: Atencion) -> Atencion:
    """Crea una nueva atención"""
    db.add(atencion)
    db.flush()
    return atencion


def update_atencion(db: Session, atencion_obj: Atencion, data: dict) -> Atencion:
    """Actualiza una atención existente"""
    for key, value in data.items():
        if key != 'servicios':  # Los servicios se manejan aparte
            setattr(atencion_obj, key, value)
    db.flush()
    return atencion_obj


def delete_atencion(db: Session, atencion_obj: Atencion) -> None:
    """Elimina una atención"""
    db.delete(atencion_obj)
    db.flush()


def add_servicio_to_atencion(db: Session, atencion_id: str, servicio_id: int) -> AtencionServicio:
    """Agrega un servicio a una atención"""
    atencion_servicio = AtencionServicio(
        id_atencion=atencion_id,
        id_servicio=servicio_id
    )
    db.add(atencion_servicio)
    db.flush()
    return atencion_servicio


def remove_servicio_from_atencion(db: Session, atencion_id: str, servicio_id: int) -> None:
    """Remueve un servicio de una atención"""
    db.query(AtencionServicio)\
        .filter(
            AtencionServicio.id_atencion == atencion_id,
            AtencionServicio.id_servicio == servicio_id
        )\
        .delete()
    db.flush()


def clear_servicios_atencion(db: Session, atencion_id: str) -> None:
    """Elimina todos los servicios de una atención"""
    db.query(AtencionServicio)\
        .filter(AtencionServicio.id_atencion == atencion_id)\
        .delete()
    db.flush()


def get_servicios_by_atencion(db: Session, atencion_id: str) -> List[AtencionServicio]:
    """Obtiene todos los servicios de una atención"""
    return db.query(AtencionServicio)\
        .filter(AtencionServicio.id_atencion == atencion_id)\
        .all()
