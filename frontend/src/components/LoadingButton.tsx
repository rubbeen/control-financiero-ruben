import { ButtonHTMLAttributes, ReactNode } from 'react';
import { RefreshCcw } from 'lucide-react';

export default function LoadingButton({ loading, children, disabled, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { loading: boolean; children: ReactNode }) {
  return <button {...props} disabled={disabled || loading}>{loading && <RefreshCcw className="h-4 w-4 animate-spin" aria-hidden="true" />}{children}</button>;
}
