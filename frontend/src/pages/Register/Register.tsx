// src/pages/register/Register.tsx
import UsuarioForm from "./UsuarioForm";

export default function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <UsuarioForm onCancel={() => {}} onSave={() => {}} />
    </div>
  );
}
