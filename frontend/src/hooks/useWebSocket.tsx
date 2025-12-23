import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import type { ReactNode } from 'react';
import { BACKEND_URL } from '../utils/env';

interface WebSocketMessage {
  event: 'create' | 'update' | 'delete';
  resource: 'atenciones' | 'pacientes' | string;
  data: any;
}

type WebSocketListener = (message: WebSocketMessage) => void;

interface WebSocketContextType {
  isConnected: boolean;
  subscribe: (resource: string, listener: WebSocketListener) => () => void;
  lastMessage: WebSocketMessage | null;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const listenersRef = useRef<Map<string, Set<WebSocketListener>>>(new Map());
  const reconnectTimeoutRef = useRef<number | undefined>(undefined);
  const reconnectAttemptsRef = useRef(0);

  const connect = useCallback(() => {
    // Convertir http/https a ws/wss
    const wsUrl = BACKEND_URL.replace(/^http/, 'ws') + '/ws/updates';
    
    console.log('[WebSocket] Conectando a:', wsUrl);
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('[WebSocket] Conectado');
      setIsConnected(true);
      reconnectAttemptsRef.current = 0;
      
      // Enviar ping cada 30 segundos para mantener conexión
      const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send('ping');
        } else {
          clearInterval(pingInterval);
        }
      }, 30000);
    };

    ws.onmessage = (event) => {
      if (event.data === 'pong') return; // Ignorar respuestas de ping
      
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        console.log('[WebSocket] Mensaje recibido:', message);
        
        setLastMessage(message);
        
        // Notificar a listeners específicos del recurso
        const resourceListeners = listenersRef.current.get(message.resource);
        if (resourceListeners) {
          resourceListeners.forEach(listener => listener(message));
        }
        
        // Notificar a listeners globales (*)
        const globalListeners = listenersRef.current.get('*');
        if (globalListeners) {
          globalListeners.forEach(listener => listener(message));
        }
      } catch (error) {
        console.error('[WebSocket] Error parseando mensaje:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('[WebSocket] Error:', error);
    };

    ws.onclose = () => {
      console.log('[WebSocket] Desconectado');
      setIsConnected(false);
      wsRef.current = null;
      
      // Reconectar con backoff exponencial
      const maxAttempts = 10;
      if (reconnectAttemptsRef.current < maxAttempts) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
        console.log(`[WebSocket] Reconectando en ${delay}ms (intento ${reconnectAttemptsRef.current + 1}/${maxAttempts})`);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current++;
          connect();
        }, delay);
      }
    };
  }, []);

  useEffect(() => {
    connect();
    
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  const subscribe = useCallback((resource: string, listener: WebSocketListener) => {
    if (!listenersRef.current.has(resource)) {
      listenersRef.current.set(resource, new Set());
    }
    listenersRef.current.get(resource)!.add(listener);
    
    console.log(`[WebSocket] Suscrito a "${resource}". Total listeners:`, listenersRef.current.get(resource)!.size);
    
    // Retornar función de cleanup
    return () => {
      const listeners = listenersRef.current.get(resource);
      if (listeners) {
        listeners.delete(listener);
        console.log(`[WebSocket] Desuscrito de "${resource}". Total listeners:`, listeners.size);
        if (listeners.size === 0) {
          listenersRef.current.delete(resource);
        }
      }
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ isConnected, subscribe, lastMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket debe ser usado dentro de WebSocketProvider');
  }
  return context;
}

export type { WebSocketMessage, WebSocketListener };
