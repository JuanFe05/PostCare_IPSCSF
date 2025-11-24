from fastapi import APIRouter, HTTPException
from app.presentation.controller.auth_controller import router as auth_router
from app.presentation.controller.user_controller import router as user_router
from app.presentation.controller.role_controller import router as role_router
from app.configuration.app.database import engine

router = APIRouter()


@router.get("/health", tags=["Health"])
def health_check():
	# Check DB connectivity
	try:
		with engine.connect() as conn:
			conn.execute("SELECT 1")
		return {"status": "ok"}
	except Exception:
		raise HTTPException(status_code=503, detail="Database unavailable")


router.include_router(auth_router, tags=["Auth"])
router.include_router(user_router, tags=["Users"])
router.include_router(role_router, tags=["Roles"])