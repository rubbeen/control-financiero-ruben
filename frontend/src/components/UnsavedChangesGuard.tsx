import { useBeforeUnload, useBlocker } from 'react-router-dom';
import ConfirmDialog from './ConfirmDialog';

export default function UnsavedChangesGuard({ dirty }: { dirty: boolean }) {
  useBeforeUnload((event) => { if (dirty) event.preventDefault(); }, { capture: true });
  const blocker = useBlocker(({ currentLocation, nextLocation }) => dirty && currentLocation.pathname !== nextLocation.pathname);
  return <ConfirmDialog open={blocker.state === 'blocked'} title="Cambios sin guardar" message="Si sales ahora perderas los cambios de este formulario." confirmLabel="Salir" danger onCancel={() => blocker.reset?.()} onConfirm={() => blocker.proceed?.()} />;
}
