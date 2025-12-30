from fastapi.middleware.cors import CORSMiddleware


def configure_cors(app):
    # Permitir orígenes específicos por motivos de seguridad.
    # En desarrollo: http://localhost:41777, http://127.0.0.1:41777.
    # En producción: añada aquí su dominio.
    origins = [
        "http://localhost:41777",
        "http://127.0.0.1:41777",
        "http://192.0.0.90:41777",  # Reemplaza con la IP del servidor
    ]
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allow_headers=["*"],
    )
