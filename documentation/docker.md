# Docker; construir, limpiar y levantar el proyecto

### 1. Ir al directorio
```
cd d:\Apps\PostCare_IPSCSF
```

### 2. Detener y limpiar TODO (contenedores + volúmenes)
```
docker-compose down --volumes --remove-orphans
```

### 3. Opcional: Limpiar imágenes viejas
```
docker-compose down --rmi all
```

### 4. Reconstruir sin caché (importante para que tome los cambios)
```
docker-compose build --no-cache
```

### 5. Levantar servicios
```
docker-compose up --build
```

### 6. Ver logs en tiempo real para confirmar que todo funciona
```
docker-compose logs -f backend
```


## Paso a Paso Recomendado (más detallado)

### 1. Asegurarse que el (.env) este en la raíz

### 2. Parar y quitar contenedores (si ya existen)
```
cd D:\Apps\PostCare_IPSCSF
docker-compose down
```

### 3. Eliminar imágenes antiguas (frontend, backend y mysql)

#### listar imágenes relacionadas
```
docker images | Select-String "postcare|mysql"
```
#### eliminar imágenes del proyecto (fuerza la eliminación)
```
docker image rm postcare_ipscsf-frontend:latest -f
docker image rm postcare_ipscsf-backend:latest -f
```
#### eliminar la imagen oficial de MySQL para recrearla desde docker hub
```
docker image rm mysql:8.0 -f
```
**Nota:** Si `docker image rm mysql:8.0` falla porque la imagen está en uso, asegurarse de haber detenido y eliminado el contenedor (`docker-compose down`) y luego vuelve a intentarlo.

### 4. Limpiar redes y builder cache (opcional)
```
docker network prune -f
docker builder prune -f
```

### 5. En la máquina local: construir el frontend y exportar imagen
#### en máquina local (donde npm funciona)
```
cd D:\Apps\PostCare_IPSCSF
docker-compose build --no-cache frontend
docker save postcare_ipscsf-frontend:latest -o frontend.tar
```

### 6. Transferir 
Transferir `frontend.tar` al servidor (copiar manualmente a `C:\Images-Docker\Postcare_IPSCSF` o usar WinSCP)

### 7. En el servidor: cargar la imagen y reconstruir backend
#### Ajustar ruta donde pusiste frontend.tar
```
docker load -i C:\Images-Docker\Postcare_IPSCSF\frontend.tar
```
#### Reconstruir backend en servidor (frontend ya disponible)
```
cd C:\ruta\del\proyecto\PostCare_IPSCSF
docker-compose build --no-cache backend
```
#### O reconstruir todo si prefieres
```
docker-compose build --no-cache
```

### 8. Levantar servicios
```
docker-compose up -d
```

### 9. Verificar estado y contenido de config.js
```
docker-compose ps
docker exec postcare_frontend cat /usr/share/nginx/html/config.js
docker-compose logs --tail=200 frontend
docker-compose logs --tail=200 backend
docker-compose logs --tail=200 mysql
```

### 10. Probar en navegador
```
Abrir http://192.0.0.16:41777
Forzar recarga sin caché (Ctrl+Shift+R) o DevTools → Network → Disable cache
```