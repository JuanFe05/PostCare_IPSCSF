import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { getTiposEmpresas } from "../Empresa.api";
import type { TipoEmpresa } from "../types";
import { FiBriefcase } from 'react-icons/fi';
import { FormModal, SectionCard, FieldGroup, FormInput, FormSelect, ModalFooter } from '../../../components/animate-ui/form-modal';

interface EmpresaFormProps {
  onCancel: () => void;
  onSave: (data: { id_tipo_empresa: number; nombre: string }) => void;
  initial?: { id_tipo_empresa?: number; nombre?: string } | null;
  isEdit?: boolean;
  isOpen: boolean;
}

export default function EmpresaForm({ onCancel, onSave, initial = null, isEdit = false, isOpen }: EmpresaFormProps) {
  const { register, handleSubmit, reset, setFocus, formState: { errors } } = useForm<any>();
  const [tiposEmpresas, setTiposEmpresas] = useState<TipoEmpresa[]>([]);
  const [loadingTipos, setLoadingTipos] = useState(true);

  useEffect(() => {
    loadTipos();
  }, []);

  const loadTipos = async () => {
    try {
      const data = await getTiposEmpresas();
      setTiposEmpresas(data);
    } catch (err) {
      console.error("Error cargando tipos de empresas:", err);
    } finally {
      setLoadingTipos(false);
    }
  };

  useEffect(() => {
    const init = initial ?? {};
    reset({
      id_tipo_empresa: init.id_tipo_empresa ?? '',
      nombre: init.nombre ?? '',
    });
  }, [initial, reset]);

  const onSubmit = (data: any) => {
    onSave({
      id_tipo_empresa: parseInt(String(data.id_tipo_empresa)),
      nombre: String(data.nombre ?? '').trim(),
    });
  };

  const onError = (errs: any) => {
    const first = Object.keys(errs || {})[0];
    if (first) setFocus(first as any);
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onCancel}
      title={isEdit ? 'Editar Empresa' : 'Nueva Empresa'}
      subtitle={isEdit ? 'Actualice los datos de la empresa' : 'Registre una nueva empresa'}
      icon={<FiBriefcase size={16} />}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-5">
        <SectionCard title="Información General" icon={<FiBriefcase size={13} />} index={0}>
          <div className="space-y-4">
            <FieldGroup label="Nombre de la empresa" required error={errors.nombre ? String((errors.nombre as any).message) : undefined}>
              <FormInput
                {...register('nombre', { required: 'El nombre es obligatorio', minLength: { value: 2, message: 'Mínimo 2 caracteres' } })}
                placeholder="Ej: Salud Total EPS"
                hasError={!!errors.nombre}
              />
            </FieldGroup>
            <FieldGroup label="Tipo de empresa" required error={errors.id_tipo_empresa ? String((errors.id_tipo_empresa as any).message) : undefined}>
              <FormSelect
                {...register('id_tipo_empresa', { required: 'El tipo es obligatorio', validate: (val) => val !== '' || 'Debe seleccionar un tipo' })}
                disabled={loadingTipos}
                hasError={!!errors.id_tipo_empresa}
              >
                <option value="">Seleccione un tipo</option>
                {tiposEmpresas.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
                ))}
              </FormSelect>
            </FieldGroup>
          </div>
        </SectionCard>
        <ModalFooter onCancel={onCancel} submitLabel={isEdit ? 'Guardar cambios' : 'Guardar'} />
      </form>
    </FormModal>
  );
}
