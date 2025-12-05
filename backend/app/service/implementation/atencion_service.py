"""
Servicio para gestión de atenciones con toda la información relacionada.
"""
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime

from app.persistence.entity.atenciones_entity import Atencion
from app.persistence.entity.pacientes_entity import Paciente
from app.persistence.repository import atencion_repository
from app.presentation.dto.atencion_paciente_dto import (
    AtencionCreateDto,
    AtencionUpdateDto,
    AtencionDetalleResponseDto,
    AtencionListResponseDto,
    ServicioAtencionDto
)


class AtencionService:
    """Servicio de negocio para atenciones"""
    
    @staticmethod
    def _build_nombre_paciente(paciente: Paciente) -> str:
        """Construye el nombre completo del paciente"""
        partes = [
            paciente.primer_nombre,
            paciente.segundo_nombre or "",
            paciente.primer_apellido,
            paciente.segundo_apellido or ""
        ]
        return " ".join(filter(None, partes)).strip()
    
    @staticmethod
    def _atencion_to_detalle_dto(atencion: Atencion) -> AtencionDetalleResponseDto:
        """Convierte una entidad Atencion a AtencionDetalleResponseDto"""
        # Construir nombre del paciente
        nombre_paciente = AtencionService._build_nombre_paciente(atencion.paciente)
        
        # Construir lista de servicios
        servicios = [
            ServicioAtencionDto(
                id_servicio=as_rel.servicio.id,
                nombre_servicio=as_rel.servicio.nombre
            )
            for as_rel in atencion.servicios_rel
        ]
        
        return AtencionDetalleResponseDto(
            # Datos de la atención
            id_atencion=atencion.id,
            fecha_atencion=atencion.fecha_ingreso,
            observacion=atencion.observacion,
            
            # Datos del paciente
            id_paciente=atencion.paciente.id,
            nombre_paciente=nombre_paciente,
            telefono_uno=atencion.paciente.telefono_uno,
            telefono_dos=atencion.paciente.telefono_dos,
            email=atencion.paciente.email,
            
            # Datos de la empresa
            id_empresa=atencion.empresa.id,
            nombre_empresa=atencion.empresa.nombre,
            
            # Datos del estado
            id_estado_atencion=atencion.estado_atencion.id,
            nombre_estado_atencion=atencion.estado_atencion.nombre,
            
            # Datos del seguimiento
            id_seguimiento_atencion=atencion.seguimiento_atencion.id if atencion.seguimiento_atencion else None,
            nombre_seguimiento_atencion=atencion.seguimiento_atencion.nombre if atencion.seguimiento_atencion else None,
            
            # Servicios
            servicios=servicios
        )
    
    @staticmethod
    def _atencion_to_list_dto(atencion: Atencion) -> AtencionListResponseDto:
        """Convierte una entidad Atencion a AtencionListResponseDto"""
        nombre_paciente = AtencionService._build_nombre_paciente(atencion.paciente)
        
        # Construir lista de servicios
        servicios = [
            ServicioAtencionDto(
                id_servicio=as_rel.servicio.id,
                nombre_servicio=as_rel.servicio.nombre
            )
            for as_rel in atencion.servicios_rel
        ]
        
        return AtencionListResponseDto(
            id_atencion=atencion.id,
            fecha_atencion=atencion.fecha_ingreso,
            id_paciente=atencion.id_paciente,
            nombre_paciente=nombre_paciente,
            telefono_uno=atencion.paciente.telefono_uno,
            telefono_dos=atencion.paciente.telefono_dos,
            email=atencion.paciente.email,
            id_empresa=atencion.empresa.id,
            nombre_empresa=atencion.empresa.nombre,
            id_estado_atencion=atencion.estado_atencion.id,
            nombre_estado_atencion=atencion.estado_atencion.nombre,
            id_seguimiento_atencion=atencion.seguimiento_atencion.id if atencion.seguimiento_atencion else None,
            nombre_seguimiento_atencion=atencion.seguimiento_atencion.nombre if atencion.seguimiento_atencion else None,
            servicios=servicios
        )
    
    @staticmethod
    def get_atencion_by_id(db: Session, atencion_id: str) -> Optional[AtencionDetalleResponseDto]:
        """Obtiene una atención por ID con toda su información"""
        atencion = atencion_repository.get_atencion_with_relations(db, atencion_id)
        if not atencion:
            return None
        return AtencionService._atencion_to_detalle_dto(atencion)
    
    @staticmethod
    def get_all_atenciones(
        db: Session,
        skip: int = 0,
        limit: int = 100
    ) -> List[AtencionListResponseDto]:
        """Obtiene todas las atenciones"""
        atenciones = atencion_repository.get_all_atenciones(db, skip=skip, limit=limit)
        return [AtencionService._atencion_to_list_dto(a) for a in atenciones]
    
    @staticmethod
    def get_atenciones_by_paciente(
        db: Session,
        paciente_id: str
    ) -> List[AtencionDetalleResponseDto]:
        """Obtiene todas las atenciones de un paciente"""
        atenciones = atencion_repository.get_atenciones_by_paciente(db, paciente_id)
        return [AtencionService._atencion_to_detalle_dto(a) for a in atenciones]
    
    @staticmethod
    def get_atenciones_by_empresa(
        db: Session,
        empresa_id: int
    ) -> List[AtencionListResponseDto]:
        """Obtiene todas las atenciones de una empresa"""
        atenciones = atencion_repository.get_atenciones_by_empresa(db, empresa_id)
        return [AtencionService._atencion_to_list_dto(a) for a in atenciones]
    
    @staticmethod
    def get_atenciones_by_estado(
        db: Session,
        estado_id: int
    ) -> List[AtencionListResponseDto]:
        """Obtiene todas las atenciones por estado"""
        atenciones = atencion_repository.get_atenciones_by_estado(db, estado_id)
        return [AtencionService._atencion_to_list_dto(a) for a in atenciones]
    
    @staticmethod
    def search_atenciones(
        db: Session,
        search_term: Optional[str] = None,
        empresa_id: Optional[int] = None,
        estado_id: Optional[int] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[AtencionListResponseDto]:
        """Busca atenciones con filtros"""
        atenciones = atencion_repository.search_atenciones(
            db=db,
            search_term=search_term,
            empresa_id=empresa_id,
            estado_id=estado_id,
            skip=skip,
            limit=limit
        )
        return [AtencionService._atencion_to_list_dto(a) for a in atenciones]
    
    @staticmethod
    def create_atencion(
        db: Session,
        atencion_data: AtencionCreateDto
    ) -> AtencionDetalleResponseDto:
        """Crea una nueva atención"""
        # Generar ID si no se proporciona
        atencion_id = atencion_data.id
        if not atencion_id:
            # Generar ID automático basado en timestamp
            atencion_id = f"AT{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        # Crear entidad de atención
        nueva_atencion = Atencion(
            id=atencion_id,
            id_paciente=atencion_data.id_paciente,
            id_empresa=atencion_data.id_empresa,
            id_estado_atencion=atencion_data.id_estado_atencion,
            id_seguimiento_atencion=atencion_data.id_seguimiento_atencion,
            fecha_ingreso=atencion_data.fecha_ingreso or datetime.now(),
            observacion=atencion_data.observacion or ""
        )
        
        # Guardar atención
        atencion_repository.create_atencion(db, nueva_atencion)
        
        # Agregar servicios si existen
        if atencion_data.servicios:
            for servicio_id in atencion_data.servicios:
                atencion_repository.add_servicio_to_atencion(db, atencion_id, servicio_id)
        
        db.commit()
        
        # Obtener y retornar la atención completa
        return AtencionService.get_atencion_by_id(db, atencion_id)
    
    @staticmethod
    def update_atencion(
        db: Session,
        atencion_id: str,
        atencion_data: AtencionUpdateDto
    ) -> Optional[AtencionDetalleResponseDto]:
        """Actualiza una atención existente"""
        # Verificar que existe
        atencion = atencion_repository.get_atencion_by_id(db, atencion_id)
        if not atencion:
            return None
        
        # Preparar datos para actualizar
        update_data = atencion_data.model_dump(exclude_unset=True, exclude={'servicios'})
        
        # Actualizar campos básicos
        if update_data:
            atencion_repository.update_atencion(db, atencion, update_data)
        
        # Actualizar servicios si se proporcionan
        if atencion_data.servicios is not None:
            # Limpiar servicios existentes
            atencion_repository.clear_servicios_atencion(db, atencion_id)
            
            # Agregar nuevos servicios
            for servicio_id in atencion_data.servicios:
                atencion_repository.add_servicio_to_atencion(db, atencion_id, servicio_id)
        
        db.commit()
        
        # Obtener y retornar la atención actualizada
        return AtencionService.get_atencion_by_id(db, atencion_id)
    
    @staticmethod
    def delete_atencion(db: Session, atencion_id: str) -> bool:
        """Elimina una atención"""
        atencion = atencion_repository.get_atencion_by_id(db, atencion_id)
        if not atencion:
            return False
        
        # Primero eliminar los servicios asociados
        atencion_repository.clear_servicios_atencion(db, atencion_id)
        
        # Luego eliminar la atención
        atencion_repository.delete_atencion(db, atencion)
        db.commit()
        
        return True
