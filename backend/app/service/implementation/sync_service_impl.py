from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.persistence.repository.paciente_repository import create_paciente, get_paciente_by_id
from app.persistence.repository.atencion_repository import create_atencion, get_atencion_by_id
from app.persistence.entity.pacientes_entity import Paciente
from app.persistence.entity.atenciones_entity import Atencion
from app.service.interface.sync_service_interface import SyncServiceInterface


class SyncService(SyncServiceInterface):
    """
    Servicio para sincronizar datos desde una base de datos externa.
    """

    @staticmethod
    def sync_from_external_db(
        db_local: Session,
        external_db_url: str,
        query_pacientes: str,
        query_atenciones: str
    ) -> Dict[str, Any]:
        """
        Sincroniza pacientes y atenciones desde una BD externa (SQL Server).
        
        Args:
            db_local: Sesión de la BD local
            external_db_url: URL de conexión a la BD externa SQL Server
                Formato: mssql+pymssql://user:password@host:port/database
            query_pacientes: Query SQL para obtener pacientes de la BD externa
            query_atenciones: Query SQL para obtener atenciones de la BD externa
            
        Returns:
            Dict con contadores de registros sincronizados
        """
        external_engine = None
        try:
            # Conectar a la BD externa
            external_engine = create_engine(external_db_url, pool_pre_ping=True)
            
            pacientes_creados = 0
            pacientes_actualizados = 0
            atenciones_creadas = 0
            atenciones_actualizadas = 0
            
            with external_engine.connect() as external_conn:
                # Sincronizar pacientes
                result_pacientes = external_conn.execute(text(query_pacientes))
                pacientes_data = result_pacientes.mappings().all()
                
                for row in pacientes_data:
                    paciente_dict = dict(row)
                    paciente_id = paciente_dict.get("id")
                    
                    # Verificar si ya existe
                    existing = get_paciente_by_id(db_local, paciente_id)
                    
                    if existing:
                        # Actualizar campos
                        for key, value in paciente_dict.items():
                            if hasattr(existing, key) and key != "id":
                                setattr(existing, key, value)
                        pacientes_actualizados += 1
                    else:
                        # Crear nuevo
                        paciente = Paciente(**paciente_dict)
                        create_paciente(db_local, paciente)
                        pacientes_creados += 1
                
                # Sincronizar atenciones
                result_atenciones = external_conn.execute(text(query_atenciones))
                atenciones_data = result_atenciones.mappings().all()
                
                for row in atenciones_data:
                    atencion_dict = dict(row)
                    atencion_id = atencion_dict.get("id")
                    
                    # Verificar si ya existe
                    existing = get_atencion_by_id(db_local, atencion_id)
                    
                    if existing:
                        # Actualizar campos
                        for key, value in atencion_dict.items():
                            if hasattr(existing, key) and key != "id":
                                setattr(existing, key, value)
                        atenciones_actualizadas += 1
                    else:
                        # Crear nueva
                        atencion = Atencion(**atencion_dict)
                        create_atencion(db_local, atencion)
                        atenciones_creadas += 1
                
                # Commit de todos los cambios
                db_local.commit()
            
            return {
                "success": True,
                "pacientes": {
                    "creados": pacientes_creados,
                    "actualizados": pacientes_actualizados,
                    "total": pacientes_creados + pacientes_actualizados
                },
                "atenciones": {
                    "creadas": atenciones_creadas,
                    "actualizadas": atenciones_actualizadas,
                    "total": atenciones_creadas + atenciones_actualizadas
                }
            }
            
        except Exception as e:
            db_local.rollback()
            raise Exception(f"Error sincronizando datos: {str(e)}")
        
        finally:
            if external_engine:
                external_engine.dispose()
