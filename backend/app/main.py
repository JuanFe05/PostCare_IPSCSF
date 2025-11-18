from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.configuration.app.database import Base, engine
from app.presentation.router.index import router as api_router

# Crear tablas al iniciar
Base.metadata.create_all(bind=engine)

app = FastAPI(title="PostCare Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:41777"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)