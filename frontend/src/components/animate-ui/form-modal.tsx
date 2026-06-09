import * as React from 'react';
import { motion } from 'framer-motion';
import { MotionModal, MotionFormSection } from './motion-modal';

/* ─────────────────────────────────────────────
   FieldGroup  - label + input + error
───────────────────────────────────────────── */
interface FieldGroupProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

export function FieldGroup({ label, required, error, children, className = '' }: FieldGroupProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
        {label}{required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1.5 text-xs text-red-600"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
          {error}
        </motion.div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   FormInput  - input estilizado
───────────────────────────────────────────── */
interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
  icon?: React.ReactNode;
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ hasError, icon, className = '', ...props }, ref) => (
    <div className="relative">
      {icon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--brand-400)' }}>
          {icon}
        </span>
      )}
      <input
        ref={ref}
        className={`w-full py-2.5 bg-white border rounded-lg text-sm transition-all outline-none
          focus:ring-2 focus:ring-offset-0
          ${icon ? 'pl-9 pr-3.5' : 'px-3.5'}
          ${hasError
            ? 'border-red-300 bg-red-50/40 focus:ring-red-200 focus:border-red-400'
            : 'border-gray-200 focus:ring-blue-100 focus:border-blue-400'
          }
          disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed
          ${className}`}
        {...props}
      />
    </div>
  )
);
FormInput.displayName = 'FormInput';

/* ─────────────────────────────────────────────
   FormSelect  - select estilizado
───────────────────────────────────────────── */
interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean;
}

export const FormSelect = React.forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ hasError, className = '', children, ...props }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-sm transition-all outline-none appearance-none cursor-pointer
          focus:ring-2 focus:ring-offset-0
          ${hasError
            ? 'border-red-300 bg-red-50/40 focus:ring-red-200 focus:border-red-400'
            : 'border-gray-200 focus:ring-blue-100 focus:border-blue-400'
          }
          disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed
          ${className}`}
        {...props}
      >
        {children}
      </select>
      {/* Icono chevron */}
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--brand-400)' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </span>
    </div>
  )
);
FormSelect.displayName = 'FormSelect';

/* ─────────────────────────────────────────────
   FormTextarea  - textarea estilizado
───────────────────────────────────────────── */
interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

export const FormTextarea = React.forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ hasError, className = '', ...props }, ref) => (
    <textarea
      ref={ref}
      className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-sm transition-all outline-none resize-none
        focus:ring-2 focus:ring-offset-0
        ${hasError
          ? 'border-red-300 bg-red-50/40 focus:ring-red-200 focus:border-red-400'
          : 'border-gray-200 focus:ring-blue-100 focus:border-blue-400'
        }
        ${className}`}
      {...props}
    />
  )
);
FormTextarea.displayName = 'FormTextarea';

/* ─────────────────────────────────────────────
   SectionCard  - contenedor de sección del formulario
───────────────────────────────────────────── */
interface SectionCardProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  index?: number;
}

export function SectionCard({ title, icon, children, index = 0 }: SectionCardProps) {
  return (
    <MotionFormSection index={index}>
      <div
        className="rounded-xl p-5"
        style={{
          background: 'linear-gradient(135deg, #f8faff 0%, #eef3ff 100%)',
          border: '1px solid rgba(46,95,212,0.14)',
          borderLeft: '3px solid var(--brand-500)',
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          {icon && (
            <span className="flex items-center justify-center w-6 h-6 rounded-md" style={{ background: 'var(--brand-100)', color: 'var(--brand-600)' }}>
              {icon}
            </span>
          )}
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--brand-700)' }}>
            {title}
          </span>
        </div>
        {children}
      </div>
    </MotionFormSection>
  );
}

/* ─────────────────────────────────────────────
   ModalFooter  - botones Cancelar / Guardar
───────────────────────────────────────────── */
interface ModalFooterProps {
  onCancel: () => void;
  submitLabel?: string;
  isLoading?: boolean;
  loading?: boolean;
  cancelLabel?: string;
  formId?: string;
  submitDisabled?: boolean;
}

export function ModalFooter({ onCancel, submitLabel = 'Guardar', isLoading, loading = false, cancelLabel = 'Cancelar', formId, submitDisabled }: ModalFooterProps) {
  const busy = isLoading ?? loading;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28, delay: 0.1 }}
    >
      <div className="flex gap-3 pt-1">
        <motion.button
          type="button"
          onClick={onCancel}
          disabled={busy}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="flex-1 px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all cursor-pointer disabled:opacity-50"
          style={{
            background: 'white',
            border: '1.5px solid #e5e7eb',
            color: 'var(--text-secondary)',
          }}
        >
          {cancelLabel}
        </motion.button>
        <motion.button
          type="submit"
          form={formId}
          disabled={busy || submitDisabled}
          whileHover={{ scale: 1.02, filter: 'brightness(1.08)' }}
          whileTap={{ scale: 0.97 }}
          className="flex-1 px-5 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
          style={{
            background: 'linear-gradient(135deg, var(--brand-600) 0%, var(--brand-800) 100%)',
            boxShadow: '0 4px 14px rgba(26,51,142,0.3)',
          }}
        >
          {busy ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/>
                <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Guardando...
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              {submitLabel}
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   FormModal  - el shell completo del modal de formulario
───────────────────────────────────────────── */
interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  maxWidth?: string;
  maxHeight?: string;
  children: React.ReactNode;
  /** Permite scroll en el cuerpo del formulario */
  scrollable?: boolean;
}

export function FormModal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  maxWidth = 'max-w-2xl',
  maxHeight = 'max-h-[90vh]',
  children,
  scrollable: _scrollable = false,
}: FormModalProps) {
  return (
    <MotionModal isOpen={isOpen} onClose={onClose} className={`w-full ${maxWidth} mx-4`}>
      <div
        className={`bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden ${maxHeight}`}
        style={{ boxShadow: '0 25px 60px rgba(13,31,107,0.22), 0 8px 24px rgba(0,0,0,0.12)' }}
      >
        {/* Header */}
        <div
          className="px-6 py-5 flex-shrink-0 flex items-center justify-between relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, var(--brand-800) 0%, var(--brand-700) 50%, var(--brand-600) 100%)',
          }}
        >
          {/* Patrón decorativo */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'radial-gradient(circle at 90% 10%, rgba(255,255,255,0.10) 0%, transparent 50%), radial-gradient(circle at 10% 90%, rgba(14,165,233,0.15) 0%, transparent 40%)',
              pointerEvents: 'none',
            }}
          />
          <div className="relative flex items-center gap-3">
            {icon && (
              <div
                className="flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.16)', border: '1px solid rgba(255,255,255,0.2)' }}
              >
                <span style={{ color: 'white' }}>{icon}</span>
              </div>
            )}
            <div>
              <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: '1rem', fontWeight: 700, color: 'white', margin: 0 }}>
                {title}
              </h2>
              {subtitle && (
                <p style={{ fontSize: '0.78rem', color: 'rgba(196,210,250,0.9)', margin: 0, marginTop: '1px' }}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {/* Botón cerrar */}
          <motion.button
            type="button"
            onClick={onClose}
            whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.2)' }}
            whileTap={{ scale: 0.9 }}
            className="relative flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 cursor-pointer transition-colors"
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)' }}
            aria-label="Cerrar"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </motion.button>
        </div>

        {/* Body */}
        <div className={`overflow-y-auto flex-1 p-6`}>
          {children}
        </div>
      </div>
    </MotionModal>
  );
}
