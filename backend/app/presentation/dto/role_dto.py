from pydantic import BaseModel


class RoleCreateDto(BaseModel):
    nombre: str
    descripcion: str | None = None
