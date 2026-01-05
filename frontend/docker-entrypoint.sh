#!/bin/sh
set -e

# Generar config.js dinámicamente con la URL del backend desde variable de entorno
cat > /usr/share/nginx/html/config.js << 'EOF'
window.APP_CONFIG = {
  BACKEND_URL: '${VITE_BACKEND_URL:-http://localhost:48555}'
};
EOF

echo "Generated runtime config.js with BACKEND_URL=${VITE_BACKEND_URL:-http://localhost:48555}"

# Iniciar nginx
exec nginx -g 'daemon off;'
