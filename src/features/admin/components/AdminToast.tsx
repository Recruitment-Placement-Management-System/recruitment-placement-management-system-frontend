import { useEffect, useRef } from 'react';
import { CheckCircle2, X } from 'lucide-react';

export function AdminToast({ message, onClose }: { message: string; onClose: () => void }) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => onCloseRef.current(), 3200);
    return () => window.clearTimeout(timer);
  }, [message]);

  if (!message) return null;
  return <div role="status" className="fixed right-6 top-20 z-[100] flex max-w-sm items-center gap-3 rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm font-medium text-emerald-800 shadow-lg shadow-slate-900/10">
    <CheckCircle2 size={19} className="shrink-0 text-emerald-600" />
    <span>{message}</span>
    <button type="button" onClick={onClose} aria-label="Dismiss notification" className="ml-2 rounded p-1 text-slate-400 hover:bg-slate-100"><X size={15}/></button>
  </div>;
}
