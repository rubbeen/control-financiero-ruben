import { CheckCircle } from 'lucide-react';

export default function SuccessToast({ message }: { message: string }) {
  return <p role="status" className="fixed bottom-24 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-lg bg-green-700 px-4 py-3 text-sm font-semibold text-white shadow-lg"><CheckCircle className="h-4 w-4" /> {message}</p>;
}
