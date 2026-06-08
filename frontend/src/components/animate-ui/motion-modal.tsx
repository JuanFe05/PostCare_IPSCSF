'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, type HTMLMotionProps, type Transition } from 'motion/react';

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
type FlipDirection = 'top' | 'bottom' | 'left' | 'right';

export interface MotionModalProps {
  /** Controla si el modal está abierto */
  isOpen: boolean;
  /** Callback al cerrar (click en overlay o ESC) */
  onClose: () => void;
  children: React.ReactNode;
  /** Dirección desde donde "entra" el contenido del modal */
  from?: FlipDirection;
  /** Transición spring para el contenido */
  contentTransition?: Transition;
  /** Transición para el overlay */
  overlayTransition?: Transition;
  /** Clases adicionales para el contenedor del modal */
  className?: string;
  /** Deshabilitar cierre al hacer clic en el overlay */
  disableOverlayClose?: boolean;
  /** Z-index del portal */
  zIndex?: number;
}

/* ─────────────────────────────────────────────
   MotionModalOverlay
───────────────────────────────────────────── */
interface MotionModalOverlayProps extends Omit<HTMLMotionProps<'div'>, 'ref'> {
  transition?: Transition;
}

export function MotionModalOverlay({
  transition = { duration: 0.22, ease: 'easeInOut' },
  onClick,
  ...props
}: MotionModalOverlayProps) {
  return (
    <motion.div
      key="modal-overlay"
      initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
      animate={{ opacity: 1, backdropFilter: 'blur(6px)' }}
      exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
      transition={transition}
      onClick={onClick}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
        cursor: 'pointer',
      }}
      {...props}
    />
  );
}

/* ─────────────────────────────────────────────
   MotionModalContent
───────────────────────────────────────────── */
interface MotionModalContentProps extends Omit<HTMLMotionProps<'div'>, 'ref'> {
  from?: FlipDirection;
  transition?: Transition;
}

export function MotionModalContent({
  from = 'top',
  transition = { type: 'spring', stiffness: 240, damping: 28, mass: 0.9 },
  className,
  children,
  ...props
}: MotionModalContentProps) {
  const isVertical = from === 'top' || from === 'bottom';
  const rotateAxis = isVertical ? 'rotateX' : 'rotateY';
  const initialRotation = from === 'bottom' || from === 'left' ? '16deg' : '-16deg';

  return (
    <motion.div
      key="modal-content"
      initial={{
        opacity: 0,
        filter: 'blur(6px)',
        transform: `perspective(700px) ${rotateAxis}(${initialRotation}) scale(0.88)`,
      }}
      animate={{
        opacity: 1,
        filter: 'blur(0px)',
        transform: `perspective(700px) ${rotateAxis}(0deg) scale(1)`,
      }}
      exit={{
        opacity: 0,
        filter: 'blur(6px)',
        transform: `perspective(700px) ${rotateAxis}(${initialRotation}) scale(0.88)`,
      }}
      transition={transition}
      className={className}
      style={{ position: 'relative', zIndex: 1 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   MotionModal  (componente principal)
───────────────────────────────────────────── */
export function MotionModal({
  isOpen,
  onClose,
  children,
  from = 'top',
  contentTransition = { type: 'spring', stiffness: 240, damping: 28, mass: 0.9 },
  overlayTransition = { duration: 0.22, ease: 'easeInOut' },
  className = '',
  disableOverlayClose = false,
  zIndex = 9999,
}: MotionModalProps) {
  // Cerrar con ESC
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // Bloquear scroll del body cuando está abierto
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return createPortal(
    <AnimatePresence mode="wait">
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MotionModalOverlay
            transition={overlayTransition}
            onClick={disableOverlayClose ? undefined : onClose}
          />
          <MotionModalContent
            from={from}
            transition={contentTransition}
            className={className}
          >
            {children}
          </MotionModalContent>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

/* ─────────────────────────────────────────────
   MotionFormSection  (contenedor animado de sección de formulario)
───────────────────────────────────────────── */
interface MotionFormSectionProps {
  children: React.ReactNode;
  index?: number;
  className?: string;
}

export function MotionFormSection({
  children,
  index = 0,
  className = '',
}: MotionFormSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: 'spring',
        stiffness: 280,
        damping: 26,
        delay: 0.06 + index * 0.07,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   MotionField  (campo individual con animación)
───────────────────────────────────────────── */
interface MotionFieldProps {
  children: React.ReactNode;
  index?: number;
  className?: string;
}

export function MotionField({
  children,
  index = 0,
  className = '',
}: MotionFieldProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 26,
        delay: 0.08 + index * 0.045,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
