import { X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false,
  onConfirm,
  onCancel
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-sm w-full shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 id="modal-title" className="text-lg font-semibold text-gray-200">{title}</h3>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-300" aria-label="Close dialog">
            <X size={20} />
          </button>
        </div>
        <p className="text-gray-400 text-sm mb-6">
          {message}
        </p>
        <div className="flex justify-end gap-3">
          <button 
            onClick={onCancel} 
            className="px-4 py-2 text-gray-300 hover:bg-gray-800 rounded-lg font-medium text-sm transition-colors"
          >
            {cancelLabel}
          </button>
          <button 
            onClick={onConfirm} 
            className={`px-4 py-2 text-white rounded-lg font-medium text-sm transition-colors ${
              isDestructive 
                ? 'bg-red-600 hover:bg-red-500 shadow-md shadow-red-500/20' 
                : 'bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-500/20'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
