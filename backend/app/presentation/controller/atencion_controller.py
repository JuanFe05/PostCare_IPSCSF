from fastapi import APIRouter, Depends, HTTPException, Query
from app.configuration.app.database import get_db
from sqlalchemy.orm import Session
from app.presentation.dto.atencion_paciente_dto import (
    AtencionPacienteCreateDto,
    AtencionPacienteResponseDto,
)
from app.service.implementation.atencion_service_impl import AtencionService
from app.configuration.security.security_dependencies import get_current_user

router = APIRouter(prefix="/atenciones", dependencies=[Depends(get_current_user)])


@router.post("/con-paciente", response_model=AtencionPacienteResponseDto)
def create_atencion_with_paciente(data: AtencionPacienteCreateDto, db: Session = Depends(get_db)):
    try:
        atencion, paciente = AtencionService.create_with_paciente(db, data.atencion.model_dump(), data.paciente.model_dump())
        return {"atencion_id": atencion.id, "paciente_id": paciente.id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{atencion_id}/con-paciente", response_model=AtencionPacienteResponseDto)
def update_atencion_with_paciente(atencion_id: int, data: AtencionPacienteCreateDto, db: Session = Depends(get_db)):
    try:
        atencion, paciente = AtencionService.update_with_paciente(db, atencion_id, data.atencion.model_dump(), data.paciente.model_dump())
        return {"atencion_id": atencion.id, "paciente_id": paciente.id}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{atencion_id}/con-paciente")
def delete_atencion_with_paciente(atencion_id: int, delete_paciente: bool = Query(False), db: Session = Depends(get_db)):
    try:
        AtencionService.delete_with_paciente(db, atencion_id, delete_paciente)
        return {"deleted": True}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
