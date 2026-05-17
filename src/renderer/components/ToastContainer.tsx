import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useToastStore } from '../store';

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="flex items-center gap-3 bg-gray-900 border border-gray-700 shadow-xl rounded-lg px-4 py-3 min-w-[300px] max-w-md"
          role="alert"
        >
          {toast.type === 'success' && <CheckCircle className="text-green-500 w-5 h-5 shrink-0" />}
          {toast.type === 'error' && <AlertCircle className="text-red-500 w-5 h-5 shrink-0" />}
          {toast.type === 'warning' && <AlertTriangle className="text-yellow-500 w-5 h-5 shrink-0" />}
          {toast.type === 'info' && <Info className="text-blue-500 w-5 h-5 shrink-0" />}
          
          <p className="text-sm text-gray-200 flex-1">{toast.message}</p>
          
          <button
            onClick={() => removeToast(toast.id)}
            className="text-gray-500 hover:text-gray-300 transition-colors"
            aria-label="Close notification"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
