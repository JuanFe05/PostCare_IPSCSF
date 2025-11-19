from fastapi.middleware.cors import CORSMiddleware


def configure_cors(app):
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:41777"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
