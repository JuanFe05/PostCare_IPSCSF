from pydantic import BaseModel


class TipoEmpresaResponseDto(BaseModel):
    id: int
    nombre: str

    class Config:
        orm_mode = True
