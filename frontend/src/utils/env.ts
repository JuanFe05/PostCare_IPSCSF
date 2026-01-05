// Runtime configuration con fallback a variables de build
// window.APP_CONFIG se carga desde /config.js (generado en runtime por Nginx)
const runtimeBackendUrl = (window as any).APP_CONFIG?.BACKEND_URL;
const buildTimeBackendUrl = import.meta.env.VITE_BACKEND_URL;

// Default to the backend port used by the docker compose setup (48555)
export const BACKEND_URL = runtimeBackendUrl || buildTimeBackendUrl || 'http://localhost:48555';