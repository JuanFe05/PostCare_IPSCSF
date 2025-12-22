from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.service.implementation.websocket_manager import get_websocket_manager
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ws", tags=["WebSocket"])


@router.websocket("/updates")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint para recibir actualizaciones en tiempo real.
    Los clientes pueden conectarse sin autenticación para recibir eventos.
    """
    manager = get_websocket_manager()
    await manager.connect(websocket, "all")
    
    try:
        while True:
            # Mantener conexión abierta y recibir mensajes del cliente si es necesario
            data = await websocket.receive_text()
            # El cliente puede enviar pings para mantener la conexión viva
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        manager.disconnect(websocket, "all")
        logger.info("Cliente WebSocket desconectado")
    except Exception as e:
        logger.error(f"Error en WebSocket: {e}")
        manager.disconnect(websocket, "all")


@router.websocket("/updates/atenciones")
async def websocket_atenciones(websocket: WebSocket):
    """
    WebSocket endpoint específico para actualizaciones de atenciones.
    """
    manager = get_websocket_manager()
    await manager.connect(websocket, "atenciones")
    
    try:
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        manager.disconnect(websocket, "atenciones")
    except Exception as e:
        logger.error(f"Error en WebSocket atenciones: {e}")
        manager.disconnect(websocket, "atenciones")


@router.websocket("/updates/pacientes")
async def websocket_pacientes(websocket: WebSocket):
    """
    WebSocket endpoint específico para actualizaciones de pacientes.
    """
    manager = get_websocket_manager()
    await manager.connect(websocket, "pacientes")
    
    try:
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        manager.disconnect(websocket, "pacientes")
    except Exception as e:
        logger.error(f"Error en WebSocket pacientes: {e}")
        manager.disconnect(websocket, "pacientes")
