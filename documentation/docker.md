# Docker — Construir, limpiar y levantar el proyecto

ℹ️ Resumen rápido

- Ir al directorio del proyecto y usar `docker-compose` para reconstruir y levantar los servicios.
- Las instrucciones abajo incluyen comandos rápidos, un procedimiento recomendado para entornos locales/servidores y pasos de verificación.

--------------------------------------------------

## Comandos rápidos

🛠️ Ir al directorio del proyecto

```powershell
cd d:\Apps\PostCare_IPSCSF
```

⏹️ Detener y eliminar contenedores + volúmenes

```powershell
docker-compose down --volumes --remove-orphans
```

🧹 Opcional - eliminar imágenes generadas por `docker-compose`

```powershell
docker-compose down --rmi all
```

🔨 Reconstruir sin caché (importante si hay cambios en Dockerfile/asset builds)

```powershell
docker-compose build --no-cache
```

⚡ Levantar servicios (en primer plano)

```powershell
docker-compose up --build
```

📜 Ver logs en tiempo real (backend)

```powershell
docker-compose logs -f backend
```

--------------------------------------------------

## Paso a paso recomendado (local - servidor)

Sigue este flujo cuando necesites asegurarte de limpiar artefactos antiguos y desplegar una versión limpia.

1. ✅ Asegúrate de tener el archivo `.env` correcto en la raíz del proyecto.

2. ⏹️ Parar y quitar contenedores (si ya existen)

```powershell
cd D:\Apps\PostCare_IPSCSF
docker-compose down
```

3. 🧾 Eliminar imágenes antiguas relacionadas con el proyecto

- Listar imágenes relacionadas

```powershell
docker images | Select-String "postcare|mysql"
```

- Eliminar imágenes del proyecto (forzar si es necesario)

```powershell
docker image rm postcare_ipscsf-frontend:latest -f
docker image rm postcare_ipscsf-backend:latest -f
```

- Eliminar la imagen oficial de MySQL si quieres forzar recreación

```powershell
docker image rm mysql:8.0 -f
```

⚠️ **Nota:** si `docker image rm mysql:8.0` falla porque la imagen está en uso, asegúrate de haber detenido y eliminado el contenedor (`docker-compose down`) y vuelve a intentarlo.

4. 🧼 Limpiar redes y builder cache (opcional)

```powershell
docker network prune -f
docker builder prune -f
```

5. 🧩 Construir frontend localmente y exportar la imagen (cuando el build requiere npm en una máquina separada)

```powershell
cd D:\Apps\PostCare_IPSCSF
docker-compose build --no-cache frontend
docker save postcare_ipscsf-frontend:latest -o frontend.tar
```

6. 📦 Transferir `frontend.tar` al servidor (copiar a `C:\Images-Docker\Postcare_IPSCSF` o usar WinSCP)

7. 🖥️ En el servidor: cargar la imagen y reconstruir backend (o todo)

```powershell
docker load -i C:\Images-Docker\Postcare_IPSCSF\frontend.tar
cd C:\ruta\del\proyecto\PostCare_IPSCSF
docker-compose build --no-cache backend
# o, si prefieres, reconstruir todo
docker-compose build --no-cache
```

8. 🚀 Levantar servicios en segundo plano

```powershell
docker-compose up -d
```

9. 🔍 Verificar estado y revisar logs / archivos de configuración

```powershell
docker-compose ps
docker exec postcare_frontend cat /usr/share/nginx/html/config.js
docker-compose logs --tail=200 frontend
docker-compose logs --tail=200 backend
docker-compose logs --tail=200 mysql
```

10. 🌐 Probar en navegador

```text
Abrir http://<TU_IP>:41777
Forzar recarga sin caché (Ctrl+Shift+R) o DevTools → Network → Disable cache
```

--------------------------------------------------

## Troubleshooting (problemas comunes)

- ❗ Contenedor no arranca: revisa `docker-compose logs backend` y `docker-compose logs mysql` para errores de conexión a DB o migraciones.
- 🔐 Variables de entorno: confirma que `.env` contenga `MYSQL_*`, `VITE_*` y `JWT_SECRET` correctos.
- 🧩 Error en build del frontend: prueba ejecutar `npm run build` localmente para ver errores de compilación antes de crear la imagen.
- 🗑️ Recursos ocupados: si no puedes eliminar imágenes, verifica contenedores corriendo con `docker ps -a` y detén/elimínalos.

--------------------------------------------------

## Consejos útiles

- Mantén una carpeta en el servidor para imágenes transferidas, por ejemplo `C:\Images-Docker\Postcare_IPSCSF`.
- Si trabajas en Windows, usa PowerShell con permisos elevados cuando gestiones imágenes y redes.
- Para deploys repetibles en servidores, considera usar tags (por ejemplo `postcare_ipscsf-backend:v1.2.3`) en lugar de `latest`.