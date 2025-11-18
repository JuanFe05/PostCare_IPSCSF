from fastapi import APIRouter

from app.presentation.controller.auth_controller import router as auth_router
from app.presentation.controller.user_controller import router as user_router
from app.presentation.controller.role_controller import router as role_router

router = APIRouter()

router.include_router(auth_router, tags=["Auth"])
router.include_router(user_router, tags=["Users"])
router.include_router(role_router, tags=["Roles"])