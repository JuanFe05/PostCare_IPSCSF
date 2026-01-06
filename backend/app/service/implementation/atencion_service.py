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
    ServicioAtencionDto,
    AtencionConPacienteCreateDto
)
from app.persistence.repository import paciente_repository


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
                ,
                fecha_modificacion=atencion.fecha_modificacion,
                nombre_usuario_modificacion=(atencion.usuario.username if getattr(atencion, 'usuario', None) else None)
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
        
        # Obtener nombre del usuario que modificó (si existe)
        nombre_usuario_modificacion = None
        if atencion.usuario:
            nombre_usuario_modificacion = atencion.usuario.username
        
        return AtencionListResponseDto(
            id_atencion=atencion.id,
            fecha_atencion=atencion.fecha_ingreso,
            observacion=atencion.observacion,
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
            servicios=servicios,
            fecha_modificacion=atencion.fecha_modificacion,
            nombre_usuario_modificacion=nombre_usuario_modificacion
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
        limit: int = 100,
        fecha: Optional[datetime] = None
    ) -> List[AtencionListResponseDto]:
        """Obtiene todas las atenciones. Si `fecha` se provee, filtra por ese día."""
        atenciones = atencion_repository.get_all_atenciones(db, skip=skip, limit=limit, fecha=fecha)
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
    def create_atencion_con_paciente(
        db: Session,
        data: AtencionConPacienteCreateDto
    ) -> AtencionDetalleResponseDto:
        """Crea una atención junto con el paciente (si no existe)"""
        try:
            # 1. Verificar si el paciente existe
            paciente_existente = paciente_repository.get_paciente_by_id(db, data.id_paciente)
            
            # 2. Si no existe, crear el paciente
            if not paciente_existente:
                nuevo_paciente = Paciente(
                    id=data.id_paciente,
                    id_tipo_documento=data.id_tipo_documento,
                    primer_nombre=data.primer_nombre,
                    segundo_nombre=data.segundo_nombre,
                    primer_apellido=data.primer_apellido,
                    segundo_apellido=data.segundo_apellido,
                    telefono_uno=data.telefono_uno,
                    telefono_dos=data.telefono_dos,
                    email=data.email
                )
                paciente_repository.create_paciente(db, nuevo_paciente)
            
            # 3. Usar el ID proporcionado (ya viene con T al principio desde el frontend)
            atencion_id = data.id_atencion
            
            # 4. Crear la atención
            nueva_atencion = Atencion(
                id=atencion_id,
                id_paciente=data.id_paciente,
                id_empresa=data.id_empresa,
                id_estado_atencion=data.id_estado_atencion,
                id_seguimiento_atencion=data.id_seguimiento_atencion,
                fecha_ingreso=data.fecha_ingreso or datetime.now(),
                id_usuario=data.id_usuario,
                observacion=data.observacion or ""
            )
            atencion_repository.create_atencion(db, nueva_atencion)
            
            # 5. Agregar servicios si existen
            if data.servicios:
                for servicio_id in data.servicios:
                    atencion_repository.add_servicio_to_atencion(db, atencion_id, servicio_id)
            
            # 6. Commit de la transacción
            db.commit()
            
            # 7. Retornar la atención completa
            return AtencionService.get_atencion_by_id(db, atencion_id)
            
        except Exception as e:
            db.rollback()
            raise e
    
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
            id_usuario=atencion_data.id_usuario,
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
        """Actualiza una atención existente y datos del paciente"""
        # Verificar que existe
        atencion = atencion_repository.get_atencion_by_id(db, atencion_id)
        if not atencion:
            return None
        
        # Separar datos del paciente de datos de la atención
        paciente_fields = {
            'id_paciente', 'id_tipo_documento', 'telefono_uno', 'telefono_dos', 'email',
            'primer_nombre', 'segundo_nombre', 'primer_apellido', 'segundo_apellido'
        }
        update_data = atencion_data.model_dump(exclude_unset=True, exclude={'servicios'})

        # Extraer datos del paciente
        paciente_data = {k: v for k, v in update_data.items() if k in paciente_fields}
        if paciente_data:
            paciente = paciente_repository.get_paciente_by_id(db, atencion.id_paciente)
            if paciente:
                # Si se cambia el ID del paciente, verificar colisiones y actualizar FK en atencion
                new_id = paciente_data.get('id_paciente')
                if new_id and new_id != paciente.id:
                    existing = paciente_repository.get_paciente_by_id(db, new_id)
                    if existing:
                        raise ValueError(f"Ya existe un paciente con id '{new_id}'")
                    # actualizar el id del paciente (clave primaria) y la FK en la atención
                    paciente.id = new_id
                    atencion.id_paciente = new_id

                # Actualizar restantes campos del paciente
                for key, value in paciente_data.items():
                    if key == 'id_paciente':
                        continue
                    setattr(paciente, key, value)

        # Agregar fecha de modificación
        update_data['fecha_modificacion'] = datetime.now()

        # Remover campos de paciente de update_data para atención
        atencion_update = {k: v for k, v in update_data.items() if k not in paciente_fields}
        
        # Actualizar campos básicos de la atención
        if atencion_update:
            atencion_repository.update_atencion(db, atencion, atencion_update)
        
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
