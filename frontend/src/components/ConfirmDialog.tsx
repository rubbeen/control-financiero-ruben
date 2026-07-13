import { ReactNode, useEffect, useRef } from 'react';

export default function ConfirmDialog({ open, title, message, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar', danger = false, onConfirm, onCancel }: { open: boolean; title: string; message: ReactNode; confirmLabel?: string; cancelLabel?: string; danger?: boolean; onConfirm: () => void; onCancel: () => void }) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (!open) return;
    previousFocus.current = document.activeElement as HTMLElement;
    cancelRef.current?.focus();
    return () => previousFocus.current?.focus();
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel();
      if (event.key !== 'Tab') return;
      const focusable = [...(dialogRef.current?.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])') || [])];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onCancel]);
  useEffect(() => {
    if (!open) return;
    document.body.dataset.dialogOpen = 'true';
    const close = () => onCancel();
    window.addEventListener('app-dialog-back', close);
    return () => {
      delete document.body.dataset.dialogOpen;
      window.removeEventListener('app-dialog-back', close);
    };
  }, [open, onCancel]);
  if (!open) return null;
  return <div role="presentation" className="safe-inline fixed inset-0 z-50 flex items-center justify-center bg-black/40 py-4"><section ref={dialogRef} role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" className="max-h-[calc(100dvh-2rem)] w-full max-w-sm overflow-y-auto rounded-lg bg-white p-4 shadow-xl sm:p-5"><h2 id="confirm-title" className="break-words text-lg font-bold">{title}</h2><div className="mt-2 break-words text-sm text-muted">{message}</div><div className="mt-5 grid grid-cols-1 gap-3 min-[340px]:grid-cols-2"><button ref={cancelRef} type="button" onClick={onCancel} className="min-h-11 rounded-lg border border-border px-3 font-semibold">{cancelLabel}</button><button type="button" onClick={onConfirm} className={`min-h-11 rounded-lg px-3 font-semibold text-white ${danger ? 'bg-red-600' : 'bg-primary'}`}>{confirmLabel}</button></div></section></div>;
}
