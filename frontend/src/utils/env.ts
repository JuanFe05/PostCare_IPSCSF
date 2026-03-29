const runtimeBackendUrl = (window as any).APP_CONFIG?.BACKEND_URL;
const buildTimeBackendUrl = import.meta.env.VITE_BACKEND_URL;

export const BACKEND_URL = runtimeBackendUrl || buildTimeBackendUrl || 'http://localhost:48555';