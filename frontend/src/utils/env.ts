// Default to the backend port used by the docker compose setup (48555)
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:48555';