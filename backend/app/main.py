from fastapi import FastAPI
from app.presentation.controller.auth_controller import router as auth_router
from app.presentation.controller.user_controller import router as user_router
from app.presentation.controller.role_controller import router as role_router
from app.configuration.app.database import Base, engine

# Crear tablas (solo si estás usando create_all)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="PostCare Backend")

# Routers
app.include_router(auth_router)
app.include_router(user_router)
app.include_router(role_router)
