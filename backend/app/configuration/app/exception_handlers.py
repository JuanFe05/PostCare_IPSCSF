from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import traceback


def register_exception_handlers(app: FastAPI):
    @app.exception_handler(Exception)
    async def generic_exception_handler(request: Request, exc: Exception):
        # Log traceback to stdout/stderr (can be replaced by structured logging)
        traceback.print_exc()
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error"},
        )
