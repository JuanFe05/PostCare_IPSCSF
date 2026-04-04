const runtimeBackendUrl = (window as any).APP_CONFIG?.BACKEND_URL;
const buildTimeBackendUrl = import.meta.env.VITE_BACKEND_URL;

export const BACKEND_URL = runtimeBackendUrl || buildTimeBackendUrl || 'http://localhost:48555';

const runtimeApiPrefix = (window as any).APP_CONFIG?.API_PREFIX;
const buildTimeApiPrefix = import.meta.env.VITE_API_PREFIX;

export const API_PREFIX = runtimeApiPrefix || buildTimeApiPrefix || '/api/v2';