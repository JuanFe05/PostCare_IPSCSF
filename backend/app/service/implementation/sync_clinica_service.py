from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session
from typing import Dict, Any
from datetime import datetime
from app.persistence.entity.pacientes_entity import Paciente
from app.persistence.entity.atenciones_entity import Atencion
from app.persistence.repository.paciente_repository import get_paciente_by_id
from app.persistence.repository.atencion_repository import get_atencion_by_id
from app.configuration.app.config import settings
import logging

logger = logging.getLogger(__name__)


class SyncClinicaService:
    """
    Servicio especializado para sincronizar datos desde bdClinicaFlorida_produccion_informes.
    """
    
    # Query SQL proporcionado para obtener admisiones del día anterior
    QUERY_ADMISIONES = """
    SELECT 
        consecutivo         = 'ADM' + CAST(adm.cnsctvo_admsns AS VARCHAR(20)), 
        fecha_atencion      = adm.fcha_admsn, 
        tipo_doc_codigo     = td.cdgo,
        id_tipo_doc         = td.unco,
        tipo_doc_desc       = td.dscrpcn, 
        numero_id           = afl.nmro_idntfccn, 
        primer_nombre       = afl.prmr_nmbre, 
        segundo_nombre      = afl.sgndo_nmbre, 
        primer_apellido     = afl.prmr_aplldo, 
        segundo_apellido    = afl.sgndo_aplldo, 
        telefono            = afl.tlfno, 
        email               = afl.eml, 
        id_empresa          = ae.unco_emprsa, 
        tipo_empresa_id     = emp.unco_tpo_emprsa, 
        tipo_empresa_desc   = te.dscrpcn
    FROM tbAdmisiones AS adm 
        INNER JOIN tbAfiliados            AS afl ON adm.unco_afldo = afl.unco 
        INNER JOIN tbTiposDocumentos      AS td  ON afl.unco_tpo_idntfccn = td.unco 
        INNER JOIN tbAdmisionesEmpresas   AS ae  ON adm.unco = ae.unco_admsns 
        INNER JOIN tbEmpresas             AS emp ON ae.unco_emprsa = emp.unco 
        INNER JOIN tbTipoEmpresa          AS te  ON emp.unco_tpo_emprsa = te.unco
    WHERE 
        emp.unco_tpo_emprsa IN (4, 5) 
        AND CAST(adm.fcha_admsn AS DATE) = '2025-12-01'
        AND adm.cnsctvo_admsns IS NOT NULL
    """

    @staticmethod
    def sync_admisiones_dia_anterior(db_local: Session, external_db_url: str = None) -> Dict[str, Any]:
        """
        Sincroniza las admisiones del día anterior desde SQL Server externo.
        
        Proceso:
        1. Conecta a bdClinicaFlorida_produccion_informes
        2. Ejecuta query para obtener admisiones de ayer (tipos empresa 4 y 5)
        3. Crea/actualiza pacientes en BD local
        4. Crea/actualiza atenciones en BD local
        
        """
        # Usar configuración si no se provee URL externa
        if not external_db_url:
            external_db_url = settings.get_external_db_url()
            
        if not external_db_url:
            raise Exception("No se ha configurado la conexión a la BD externa. Configure EXTERNAL_DB_USER y EXTERNAL_DB_PASSWORD en .env")
            
        external_engine = None
        pacientes_creados = 0
        pacientes_actualizados = 0
        pacientes_omitidos = 0
        atenciones_creadas = 0
        atenciones_actualizadas = 0
        atenciones_omitidas = 0
        errores = []
        
        try:
            # Conectar a SQL Server externo
            external_engine = create_engine(external_db_url, pool_pre_ping=True)
            logger.info(f"Conectado a BD externa: {external_db_url.split('@')[1]}")
            
            with external_engine.connect() as external_conn:
                # Ejecutar query de admisiones
                result = external_conn.execute(text(SyncClinicaService.QUERY_ADMISIONES))
                admisiones = result.mappings().all()
                
                logger.info(f"Obtenidas {len(admisiones)} admisiones del día anterior")
                
                for idx, row in enumerate(admisiones, 1):
                    try:
                        data = dict(row)
                        
                        # 1. PROCESAR PACIENTE
                        paciente_id = data.get("numero_id")
                        
                        if not paciente_id:
                            errores.append(f"Registro {idx}: numero_id vacío")
                            continue
                        
                        # Verificar si paciente ya existe
                        paciente_existente = get_paciente_by_id(db_local, paciente_id)
                        
                        if paciente_existente:
                            # Omitir paciente existente sin actualizar
                            pacientes_omitidos += 1
                            logger.debug(f"Paciente {paciente_id} ya existe, omitiendo")
                        else:
                            # Crear nuevo paciente - usar id_tipo_doc que viene del query
                            id_tipo_documento = data.get("id_tipo_doc")
                            
                            if not id_tipo_documento:
                                errores.append(f"Registro {idx}: id_tipo_doc vacío")
                                pacientes_omitidos += 1
                                continue
                            
                            nuevo_paciente = Paciente(
                                id=paciente_id,
                                id_tipo_documento=id_tipo_documento,
                                primer_nombre=data.get("primer_nombre"),
                                segundo_nombre=data.get("segundo_nombre"),
                                primer_apellido=data.get("primer_apellido"),
                                segundo_apellido=data.get("segundo_apellido"),
                                telefono_uno=data.get("telefono"),
                                email=data.get("email")
                            )
                            db_local.add(nuevo_paciente)
                            db_local.flush()  # Flush para obtener el ID
                            pacientes_creados += 1
                            logger.debug(f"Paciente {paciente_id} creado")
                        
                        # 2. PROCESAR ATENCIÓN
                        atencion_id = data.get("consecutivo")  # 'ADM' + consecutivo
                        
                        if not atencion_id:
                            errores.append(f"Registro {idx}: consecutivo vacío")
                            continue
                        
                        # Verificar si atención ya existe
                        atencion_existente = get_atencion_by_id(db_local, atencion_id)
                        
                        if atencion_existente:
                            # Omitir atención existente sin actualizar
                            atenciones_omitidas += 1
                            logger.debug(f"Atención {atencion_id} ya existe, omitiendo")
                        else:
                            # Crear nueva atención - usar id_empresa que viene del query
                            id_empresa = data.get("id_empresa")
                            
                            if not id_empresa:
                                errores.append(f"Registro {idx}: id_empresa vacío")
                                atenciones_omitidas += 1
                                continue
                            
                            # Estados por defecto
                            id_estado_atencion = 1  # Ingresado
                            id_seguimiento_atencion = 8
                            
                            nueva_atencion = Atencion(
                                id=atencion_id,
                                id_paciente=paciente_id,
                                id_empresa=id_empresa,
                                id_estado_atencion=id_estado_atencion,
                                id_seguimiento_atencion=id_seguimiento_atencion,
                                fecha_ingreso=data.get("fecha_atencion") or datetime.now(),
                                observacion=""
                            )
                            db_local.add(nueva_atencion)
                            db_local.flush()  # Flush para obtener el ID
                            atenciones_creadas += 1
                            logger.debug(f"Atención {atencion_id} creada")
                        
                    except Exception as e:
                        errores.append(f"Registro {idx}: {str(e)}")
                        logger.error(f"Error procesando registro {idx}: {e}")
                        continue
            
            # Commit DESPUÉS de salir del contexto de conexión externa
            db_local.commit()
            logger.info("Sincronización completada y cambios guardados en BD local")
            
            return {
                "success": True,
                "fecha_sincronizacion": datetime.now().isoformat(),
                "registros_procesados": len(admisiones),
                "pacientes": {
                    "creados": pacientes_creados,
                    "actualizados": pacientes_actualizados,
                    "omitidos": pacientes_omitidos,
                    "total": pacientes_creados + pacientes_actualizados
                },
                "atenciones": {
                    "creadas": atenciones_creadas,
                    "actualizadas": atenciones_actualizadas,
                    "omitidas": atenciones_omitidas,
                    "total": atenciones_creadas + atenciones_actualizadas
                },
                "errores": errores[:20]  # Limitamos a 20 errores para no saturar respuesta
            }
            
        except Exception as e:
            db_local.rollback()
            logger.error(f"Error en sincronización: {e}")
            raise Exception(f"Error sincronizando desde bdClinicaFlorida: {str(e)}")
        
        finally:
            if external_engine:
                external_engine.dispose()
                logger.info("Conexión externa cerrada")
