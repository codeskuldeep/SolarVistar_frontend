import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeToast } from '../context/slices/toastSlice';
import { CheckCircle, XCircle, Info, X } from '@phosphor-icons/react';

const ICON_MAP = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
};

const COLOR_MAP = {
  success: {
    bg: 'bg-green-50 dark:bg-emerald-950/40',
    border: 'border-green-200 dark:border-green-700/60',
    icon: 'text-green-500 dark:text-green-400',
    text: 'text-green-900 dark:text-green-200',
    progress: 'bg-green-500',
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-950/40',
    border: 'border-red-200 dark:border-red-800/60',
    icon: 'text-red-600 dark:text-red-400',
    text: 'text-red-900 dark:text-red-200',
    progress: 'bg-red-500',
  },
  info: {
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    border: 'border-blue-200 dark:border-blue-800/60',
    icon: 'text-blue-600 dark:text-blue-400',
    text: 'text-blue-900 dark:text-blue-200',
    progress: 'bg-blue-500',
  },
};

function SingleToast({ toast, onDismiss }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const colors = COLOR_MAP[toast.type] || COLOR_MAP.info;
  const IconComponent = ICON_MAP[toast.type] || ICON_MAP.info;

  useEffect(() => {
    // Trigger enter animation
    const enterTimer = requestAnimationFrame(() => setIsVisible(true));

    // Auto-dismiss
    const dismissTimer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onDismiss(toast.id), 300);
    }, toast.duration);

    return () => {
      cancelAnimationFrame(enterTimer);
      clearTimeout(dismissTimer);
    };
  }, [toast.id, toast.duration, onDismiss]);

  const handleManualDismiss = () => {
    setIsExiting(true);
    setTimeout(() => onDismiss(toast.id), 300);
  };

  return (
    <div
      className={`
        flex items-start gap-3 w-80 p-4 rounded-lg border shadow-lg
        ${colors.bg} ${colors.border}
        transition-all duration-300 ease-out
        ${isVisible && !isExiting ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}
      `}
      role="alert"
    >
      <IconComponent size={20} weight="fill" className={`${colors.icon} mt-0.5 shrink-0`} />
      <p className={`text-sm font-medium flex-1 ${colors.text}`}>{toast.message}</p>
      <button
        onClick={handleManualDismiss}
        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 shrink-0 mt-0.5"
      >
        <X size={16} weight="bold" />
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const toasts = useSelector((state) => state.toasts);
  const dispatch = useDispatch();

  const handleDismiss = (id) => {
    dispatch(removeToast(id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3">
      {toasts.map((toast) => (
        <SingleToast key={toast.id} toast={toast} onDismiss={handleDismiss} />
      ))}
    </div>
  );
}

