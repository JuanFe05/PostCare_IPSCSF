**Setup y Cómo Correr el Proyecto**

**Descripción:**
- Instrucciones para ejecutar el proyecto localmente sin usar Docker. Las instrucciones específicas de Docker están en **documentation/docker.md**.

**Requisitos y Tecnologías usadas**
- **Backend:** Python (3.10+ recomendado), FastAPI, Uvicorn, SQLAlchemy, Alembic, MySQL (8.x compatible).
- **Frontend:** Node.js (18+ recomendado), npm, Vite, React, TypeScript, TailwindCSS.
- **Herramientas opcionales:** Git, npm, pip, virtualenv/venv.

**Archivos importantes**
- Archivo de dependencias backend: [backend/requirements.txt](backend/requirements.txt#L1)
- Configuración de frontend: [frontend/package.json](frontend/package.json#L1)

**Git**
1. Configurar identidad
```
git config --global user.name "John Doe"
git config --global user.email johndoe@example.com
```
2. Clonar un repositorio existente
```
cd ruta-local
git clone URL_DEL_REPOSITORIO
cd nombre-del-repo
```
3. Traer todas las ramas remotas
```
git fetch --all
```
4. Ver ramas disponibles
```
git branch -a
git branch        # (solo ramas locales)
git branch -a     # (locales + remotas)
```
5. Crear ramas locales desde ramas remotas
```
git checkout -b develop origin/develop
git checkout -b feature/backend-develop origin/feature/backend-develop
```
6. Trabajar normalmente
```
git status
git add .
git commit -m "Mensaje claro"
git push origin develop
```

**Cómo correr el proyecto (sin Docker)**

- Nota previa: Asegúrate de que el archivo `.env` esté en la raíz del proyecto y contenga las variables necesarias (base de datos, secretos, etc.).

Backend (API)
- Recomendado: crear un entorno virtual en la carpeta del proyecto
```
python -m venv .venv
```
- Activar el entorno virtual (Windows PowerShell)
```
.venv\Scripts\Activate
```
- Instalar dependencias
```
pip install -r backend/requirements.txt
```
- Ejecutar migraciones de base de datos (Alembic)
```
cd backend
alembic upgrade head
```
- Ejecutar la API en modo desarrollo
```
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Frontend (UI)
- Requerimientos: Node.js (18+), npm
```
cd frontend
npm install
npm run dev
```
- Para construir la versión de producción
```
npm run build
# y para previsualizar el build
npm run preview
```

**Verificación básica**
- Backend: abrir http://localhost:8000/docs para verificar rutas OpenAPI (si está disponible).
- Frontend: por defecto Vite mostrará la URL local (ej. http://localhost:5173) en la consola.

**Mantenimiento y notas**
- Si cambias dependencias de Python, crea o actualiza `backend/requirements.txt`.
- Si el frontend requiere variables de entorno en `public/config.js`, revisa el proceso de build y/o la documentación interna del proyecto.
- Para despliegues y empaquetado con contenedores, usar [documentation/docker.md](docker.md).