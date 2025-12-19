from typing import Dict, Set
from fastapi import WebSocket
import json
import logging
from datetime import datetime, date
from decimal import Decimal

logger = logging.getLogger(__name__)


def json_serializer(obj):
    """
    Custom JSON serializer for objects not serializable by default json code.
    """
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError(f"Type {type(obj)} not serializable")


class WebSocketManager:
    """
    Gestiona conexiones WebSocket y broadcasting de eventos en tiempo real.
    """
    
    def __init__(self):
        # Almacena conexiones activas: {resource_type: {connection_id: WebSocket}}
        self.active_connections: Dict[str, Set[WebSocket]] = {
            "atenciones": set(),
            "pacientes": set(),
            "all": set()  # Usuarios suscritos a todos los eventos
        }
    
    async def connect(self, websocket: WebSocket, resource_type: str = "all"):
        """
        Acepta una nueva conexión WebSocket y la registra.
        """
        await websocket.accept()
        
        if resource_type not in self.active_connections:
            self.active_connections[resource_type] = set()
        
        self.active_connections[resource_type].add(websocket)
        logger.info(f"Nueva conexión WebSocket para {resource_type}. Total: {len(self.active_connections[resource_type])}")
    
    def disconnect(self, websocket: WebSocket, resource_type: str = "all"):
        """
        Desconecta y remueve una conexión WebSocket.
        """
        if resource_type in self.active_connections:
            self.active_connections[resource_type].discard(websocket)
            logger.info(f"Conexión WebSocket cerrada para {resource_type}. Total: {len(self.active_connections[resource_type])}")
    
    async def broadcast(self, message: dict, resource_type: str):
        """
        Envía un mensaje a todos los clientes conectados a un tipo de recurso.
        """
        message_json = json.dumps(message, default=json_serializer)
        
        # Enviar a conexiones específicas del recurso
        connections_to_remove = set()
        
        total_sent = 0
        if resource_type in self.active_connections:
            for connection in self.active_connections[resource_type]:
                try:
                    await connection.send_text(message_json)
                    total_sent += 1
                except Exception as e:
                    logger.error(f"Error enviando mensaje por WebSocket: {e}")
                    connections_to_remove.add(connection)
        
        # También enviar a conexiones "all"
        if "all" in self.active_connections:
            for connection in self.active_connections["all"]:
                try:
                    await connection.send_text(message_json)
                    total_sent += 1
                except Exception as e:
                    logger.error(f"Error enviando mensaje por WebSocket: {e}")
                    connections_to_remove.add(connection)
        
        logger.info(f"Broadcast enviado a {total_sent} clientes ({resource_type}): {message.get('event')} - {message.get('resource')}")
        
        # Limpiar conexiones rotas
        for connection in connections_to_remove:
            for conn_type in self.active_connections:
                self.active_connections[conn_type].discard(connection)
    
    async def send_event(self, event_type: str, resource_type: str, data: dict):
        """
        Envía un evento específico (create, update, delete) a los clientes.
        
        Args:
            event_type: 'create', 'update', 'delete'
            resource_type: 'atenciones', 'pacientes', etc.
            data: Datos del recurso afectado
        """
        logger.info(f"Enviando evento WebSocket: {event_type} - {resource_type}")
        message = {
            "event": event_type,
            "resource": resource_type,
            "data": data
        }
        await self.broadcast(message, resource_type)


# Singleton
_websocket_manager: WebSocketManager | None = None


def get_websocket_manager() -> WebSocketManager:
    """
    Retorna la instancia singleton del WebSocketManager.
    """
    global _websocket_manager
    if _websocket_manager is None:
        _websocket_manager = WebSocketManager()
    return _websocket_manager
