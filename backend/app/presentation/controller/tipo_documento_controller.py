from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.configuration.app.database import get_db
from app.presentation.dto.tipo_documento_dto import TipoDocumentoResponseDto
from app.persistence.entity.tipos_documentos_entity import TipoDocumento

router = APIRouter(prefix="/tipos-documentos")


@router.get("", response_model=List[TipoDocumentoResponseDto])
def list_tipos_documentos(db: Session = Depends(get_db)):
    """Obtiene todos los tipos de documentos"""
    tipos = db.query(TipoDocumento).all()
    return [TipoDocumentoResponseDto(
        id=t.id,
        siglas=t.siglas,
        descripcion=t.descripcion
    ) for t in tipos]
