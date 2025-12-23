from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from datetime import datetime
import logging
from typing import Optional

from app.service.implementation.sync_clinica_service import SyncClinicaService
from app.configuration.app.database import SessionLocal
from app.configuration.app.config import settings

logger = logging.getLogger(__name__)


class SchedulerService:
    """Servicio para gestionar tareas programadas."""
    
    _scheduler: Optional[AsyncIOScheduler] = None
    
    @classmethod
    def get_scheduler(cls) -> AsyncIOScheduler:
        """Obtiene o crea la instancia del scheduler."""
        if cls._scheduler is None:
            cls._scheduler = AsyncIOScheduler()
        return cls._scheduler
    
    @classmethod
    def start(cls):
        """Inicia el scheduler y registra todas las tareas programadas."""
        print("[SCHEDULER] Iniciando scheduler...")
        scheduler = cls.get_scheduler()
        
        # Registrar tarea de sincronización diaria a las 6:00 AM (hora del servidor)
        scheduler.add_job(
            func=cls.sync_clinica_florida_job,
            trigger=CronTrigger(hour=11, minute=00),
            id='sync_clinica_florida',
            name='Sincronización Clínica Florida',
            replace_existing=True
        )
        
        scheduler.start()
        logger.info("Scheduler iniciado - Sincronización diaria a las 6:00 AM")
    
    @classmethod
    def shutdown(cls):
        """Detiene el scheduler de forma ordenada."""
        if cls._scheduler is not None:
            cls._scheduler.shutdown(wait=True)
            logger.info("Scheduler detenido")
    
    @staticmethod
    def sync_clinica_florida_job():
        """
        Tarea programada: Sincronización de admisiones desde Clínica Florida.
        Se ejecuta todos los días a las 6:00 AM.
        """
        print("="*60)
        print(f"[SYNC JOB] Iniciando sincronización automática - {datetime.now()}")
        print("="*60)
        logger.info("="*60)
        logger.info(f"Iniciando sincronización automática - {datetime.now()}")
        logger.info("="*60)
        
        db = SessionLocal()
        try:
            # Obtener URL de la base de datos externa
            external_db_url = settings.get_external_db_url()
            
            if not external_db_url:
                logger.error("No se ha configurado la conexión a la BD externa")
                return
            
            # Ejecutar sincronización
            result = SyncClinicaService.sync_admisiones_dia_anterior(
                db_local=db,
                external_db_url=external_db_url
            )
            
            # Log del resultado
            if result['success']:
                logger.info("Sincronización completada exitosamente:")
                logger.info(f"Registros procesados: {result['registros_procesados']}")
                logger.info(f"Pacientes - Creados: {result['pacientes']['creados']}, "
                          f"Omitidos: {result['pacientes']['omitidos']}")
                logger.info(f"Atenciones - Creadas: {result['atenciones']['creadas']}, "
                          f"Omitidas: {result['atenciones']['omitidas']}")
                
                if result['errores']:
                    logger.warning(f"Se encontraron {len(result['errores'])} errores:")
                    for error in result['errores'][:5]:  # Mostrar solo los primeros 5
                        logger.warning(f"     - {error}")
            else:
                logger.error("Error en la sincronización")
                if result['errores']:
                    for error in result['errores'][:10]:
                        logger.error(f"   {error}")
        
        except Exception as e:
            logger.error(f"Error crítico en tarea de sincronización: {e}", exc_info=True)
        
        finally:
            db.close()
            print("="*60)
            print(f"[SYNC JOB] Sincronización automática finalizada - {datetime.now()}")
            print("="*60)
            logger.info("="*60)
            logger.info("Sincronización automática finalizada")
            logger.info("="*60)
