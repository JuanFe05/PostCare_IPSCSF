from fastapi import FastAPI
from app.presentation.controller.auth_controller import router as auth_router
from app.presentation.controller.user_controller import router as user_router
from app.configuration.app.database import Base, engine

Base.metadata.create_all(bind=engine)

app = FastAPI(title="PostCare Backend")

app.include_router(auth_router)
app.include_router(user_router)
