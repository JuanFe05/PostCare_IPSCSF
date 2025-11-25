from pydantic import BaseModel


class ServicioCreateDto(BaseModel):
    nombre: str


class ServicioUpdateDto(BaseModel):
    nombre: str | None = None


class ServicioResponseDto(BaseModel):
    id: int
    nombre: str

    class Config:
        orm_mode = True
