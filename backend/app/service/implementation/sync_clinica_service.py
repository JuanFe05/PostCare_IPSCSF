from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session
from typing import Dict, Any
from datetime import datetime, date
from app.persistence.entity.pacientes_entity import Paciente
from app.persistence.entity.atenciones_entity import Atencion
from app.persistence.entity.empresas_entity import Empresa
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
        AND ae.unco_emprsa <> 89
        AND CAST(adm.fcha_admsn AS DATE) = CAST(DATEADD(day, -1, GETDATE()) AS DATE)
        AND adm.cnsctvo_admsns IS NOT NULL
    """

    @staticmethod
    def _validar_url_externa(external_db_url: str = None) -> str:
        """Valida y obtiene la URL de conexión externa."""
        if not external_db_url:
            external_db_url = settings.get_external_db_url()
            
        if not external_db_url:
            raise Exception("No se ha configurado la conexión a la BD externa. Configure EXTERNAL_DB_USER y EXTERNAL_DB_PASSWORD en .env")
        
        return external_db_url

    @staticmethod
    def _crear_query_rango_fechas() -> str:
        """Genera el query SQL para obtener admisiones por rango de fechas."""
        return """
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
            AND ae.unco_emprsa <> 89
            AND CAST(adm.fcha_admsn AS DATE) BETWEEN :fecha_inicio AND :fecha_fin
            AND adm.cnsctvo_admsns IS NOT NULL
        """

    @staticmethod
    def _procesar_paciente(db_local: Session, data: dict, idx: int, errores: list) -> tuple[int, int, int]:
        """
        Procesa un paciente: lo crea si no existe, lo omite si ya existe.
        
        Returns:
            tuple: (creados, actualizados, omitidos)
        """
        paciente_id = data.get("numero_id")
        
        if not paciente_id:
            errores.append(f"Registro {idx}: numero_id vacío")
            return (0, 0, 0)
        
        # Verificar si paciente ya existe
        paciente_existente = get_paciente_by_id(db_local, paciente_id)
        
        if paciente_existente:
            logger.debug(f"Paciente {paciente_id} ya existe, omitiendo")
            return (0, 0, 1)
        
        # Crear nuevo paciente
        id_tipo_documento = data.get("id_tipo_doc")
        
        if not id_tipo_documento:
            errores.append(f"Registro {idx}: id_tipo_doc vacío")
            return (0, 0, 1)
        
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
        db_local.flush()
        logger.debug(f"Paciente {paciente_id} creado")
        return (1, 0, 0)

    @staticmethod
    def _procesar_atencion(db_local: Session, data: dict, idx: int, errores: list) -> tuple[int, int, int]:
        """
        Procesa una atención: la crea si no existe, la omite si ya existe.
        
        Returns:
            tuple: (creadas, actualizadas, omitidas)
        """
        atencion_id = data.get("consecutivo")
        
        if not atencion_id:
            errores.append(f"Registro {idx}: consecutivo vacío")
            return (0, 0, 0)
        
        # Verificar si atención ya existe
        atencion_existente = get_atencion_by_id(db_local, atencion_id)
        
        if atencion_existente:
            logger.debug(f"Atención {atencion_id} ya existe, omitiendo")
            return (0, 0, 1)
        
        # Crear nueva atención
        id_empresa = data.get("id_empresa")
        paciente_id = data.get("numero_id")
        
        if not id_empresa:
            errores.append(f"Registro {idx}: id_empresa vacío")
            return (0, 0, 1)
        
        # Asegurar que la empresa exista en la BD local (evita violaciones FK)
        empresa_existente = db_local.query(Empresa).filter(Empresa.id == id_empresa).first()
        if not empresa_existente:
            # Intentar crear una empresa mínima con la información disponible
            tipo_empresa_id = data.get("tipo_empresa_id")
            tipo_empresa_desc = data.get("tipo_empresa_desc") or f"Empresa {id_empresa}"
            nueva_empresa = Empresa(
                id=id_empresa,
                id_tipo_empresa=tipo_empresa_id or 0,
                nombre=tipo_empresa_desc
            )
            db_local.add(nueva_empresa)
            try:
                db_local.flush()
                logger.debug(f"Empresa {id_empresa} creada (mínima) para evitar FK")
            except Exception as e:
                # Si crear la empresa falla, registrar el error y omitir la atención
                errores.append(f"Registro {idx}: no se pudo crear empresa {id_empresa}: {e}")
                logger.error(f"Error creando empresa {id_empresa}: {e}")
                db_local.rollback()
                return (0, 0, 1)

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
        db_local.flush()
        logger.debug(f"Atención {atencion_id} creada")
        return (1, 0, 0)

    @staticmethod
    def _procesar_admisiones(
        db_local: Session,
        admisiones: list,
        errores: list
    ) -> dict:
        """
        Procesa una lista de admisiones: crea pacientes y atenciones.
        
        Returns:
            dict: Estadísticas de procesamiento
        """
        pacientes_creados = 0
        pacientes_actualizados = 0
        pacientes_omitidos = 0
        atenciones_creadas = 0
        atenciones_actualizadas = 0
        atenciones_omitidas = 0
        
        for idx, row in enumerate(admisiones, 1):
            try:
                data = dict(row)
                
                # Procesar paciente
                p_creados, p_actualizados, p_omitidos = SyncClinicaService._procesar_paciente(
                    db_local, data, idx, errores
                )
                pacientes_creados += p_creados
                pacientes_actualizados += p_actualizados
                pacientes_omitidos += p_omitidos
                
                # Procesar atención
                a_creadas, a_actualizadas, a_omitidas = SyncClinicaService._procesar_atencion(
                    db_local, data, idx, errores
                )
                atenciones_creadas += a_creadas
                atenciones_actualizadas += a_actualizadas
                atenciones_omitidas += a_omitidas
                
            except Exception as e:
                errores.append(f"Registro {idx}: {str(e)}")
                logger.error(f"Error procesando registro {idx}: {e}")
                # Asegurar que la sesión se restaure si hubo un fallo en flush/commit
                try:
                    db_local.rollback()
                except Exception:
                    logger.exception("Error al hacer rollback de la sesión después de excepción por registro")
                continue
        
        return {
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
            }
        }

    @staticmethod
    def _construir_respuesta(
        success: bool,
        registros_procesados: int,
        estadisticas: dict,
        errores: list,
        fecha_inicio: date = None,
        fecha_fin: date = None
    ) -> dict:
        """Construye la respuesta estándar de sincronización."""
        respuesta = {
            "success": success,
            "fecha_sincronizacion": datetime.now().isoformat(),
            "registros_procesados": registros_procesados,
            "pacientes": estadisticas["pacientes"],
            "atenciones": estadisticas["atenciones"],
            "errores": errores[:20]
        }
        
        if fecha_inicio and fecha_fin:
            respuesta["fecha_inicio"] = fecha_inicio.isoformat()
            respuesta["fecha_fin"] = fecha_fin.isoformat()
        
        return respuesta

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
        external_db_url = SyncClinicaService._validar_url_externa(external_db_url)
        errores = []
        external_engine = None
        
        try:
            # Conectar a SQL Server externo
            external_engine = create_engine(external_db_url, pool_pre_ping=True)
            logger.info(f"Conectado a BD externa: {external_db_url.split('@')[1]}")
            
            with external_engine.connect() as external_conn:
                # Ejecutar query de admisiones
                result = external_conn.execute(text(SyncClinicaService.QUERY_ADMISIONES))
                admisiones = result.mappings().all()
                
                logger.info(f"Obtenidas {len(admisiones)} admisiones del día anterior")
                
                # Procesar admisiones
                estadisticas = SyncClinicaService._procesar_admisiones(db_local, admisiones, errores)
            
            # Commit DESPUÉS de salir del contexto de conexión externa
            db_local.commit()
            logger.info("Sincronización completada y cambios guardados en BD local")
            
            return SyncClinicaService._construir_respuesta(
                success=True,
                registros_procesados=len(admisiones),
                estadisticas=estadisticas,
                errores=errores
            )
            
        except Exception as e:
            db_local.rollback()
            logger.error(f"Error en sincronización: {e}")
            raise Exception(f"Error sincronizando desde bdClinicaFlorida: {str(e)}")
        
        finally:
            if external_engine:
                external_engine.dispose()
                logger.info("Conexión externa cerrada")

    @staticmethod
    def sync_admisiones_rango_fechas(
        db_local: Session, 
        fecha_inicio: date, 
        fecha_fin: date,
        external_db_url: str = None
    ) -> Dict[str, Any]:
        """
        Sincroniza las admisiones en un rango de fechas desde SQL Server externo.
        
        Proceso:
        1. Conecta a bdClinicaFlorida_produccion_informes
        2. Ejecuta query para obtener admisiones del rango (tipos empresa 4 y 5)
        3. Crea pacientes si no existen (evita duplicados)
        4. Crea atenciones si no existen (evita duplicados)
        
        """
        # Validar fechas
        if fecha_inicio > fecha_fin:
            raise ValueError("La fecha de inicio no puede ser posterior a la fecha de fin")
        
        external_db_url = SyncClinicaService._validar_url_externa(external_db_url)
        query_rango = SyncClinicaService._crear_query_rango_fechas()
        errores = []
        external_engine = None
        
        try:
            # Conectar a SQL Server externo
            external_engine = create_engine(external_db_url, pool_pre_ping=True)
            logger.info(f"Conectado a BD externa para rango {fecha_inicio} - {fecha_fin}")
            
            with external_engine.connect() as external_conn:
                # Ejecutar query con parámetros de fecha
                result = external_conn.execute(
                    text(query_rango),
                    {"fecha_inicio": fecha_inicio, "fecha_fin": fecha_fin}
                )
                admisiones = result.mappings().all()
                
                logger.info(f"Obtenidas {len(admisiones)} admisiones entre {fecha_inicio} y {fecha_fin}")
                
                # Procesar admisiones
                estadisticas = SyncClinicaService._procesar_admisiones(db_local, admisiones, errores)
            
            # Commit DESPUÉS de salir del contexto de conexión externa
            db_local.commit()
            logger.info("Sincronización completada y cambios guardados en BD local")
            
            return SyncClinicaService._construir_respuesta(
                success=True,
                registros_procesados=len(admisiones),
                estadisticas=estadisticas,
                errores=errores,
                fecha_inicio=fecha_inicio,
                fecha_fin=fecha_fin
            )
            
        except Exception as e:
            db_local.rollback()
            logger.error(f"Error en sincronización: {e}")
            raise Exception(f"Error sincronizando desde bdClinicaFlorida: {str(e)}")
        
        finally:
            if external_engine:
                external_engine.dispose()
                logger.info("Conexión externa cerrada")
