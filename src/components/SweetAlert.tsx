import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';

export type SweetAlertType = 'success' | 'error' | 'warning' | 'info';

interface SweetAlertProps {
  isOpen: boolean;
  type: SweetAlertType;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  showCancel?: boolean;
}

export default function SweetAlert({
  isOpen,
  type,
  title,
  message,
  confirmText = 'OK',
  cancelText = 'Batal',
  onConfirm,
  onCancel,
  showCancel = false
}: SweetAlertProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          onClick={showCancel ? onCancel : onConfirm}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-center"
        >
          {/* Animated Header Icons */}
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
            {type === 'success' && (
              <motion.div
                initial={{ scale: 0.5, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.3 }}
                className="text-emerald-500 bg-emerald-50 p-3 rounded-full dark:bg-emerald-950/40"
              >
                <CheckCircle2 className="h-10 w-10" />
              </motion.div>
            )}
            {type === 'error' && (
              <motion.div
                initial={{ scale: 0.5, rotate: 45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.3 }}
                className="text-rose-500 bg-rose-50 p-3 rounded-full dark:bg-rose-950/40"
              >
                <XCircle className="h-10 w-10" />
              </motion.div>
            )}
            {type === 'warning' && (
              <motion.div
                initial={{ scale: 0.5, rotate: 15 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.3 }}
                className="text-amber-500 bg-amber-50 p-3 rounded-full dark:bg-amber-950/40"
              >
                <AlertTriangle className="h-10 w-10" />
              </motion.div>
            )}
            {type === 'info' && (
              <motion.div
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
                className="text-sky-500 bg-sky-50 p-3 rounded-full dark:bg-sky-950/40"
              >
                <Info className="h-10 w-10" />
              </motion.div>
            )}
          </div>

          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            {title}
          </h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 whitespace-pre-line leading-relaxed">
            {message}
          </p>

          <div className="mt-6 flex items-center justify-center gap-3">
            {showCancel && onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-350 dark:hover:bg-slate-755 transition-colors focus:outline-none"
              >
                {cancelText}
              </button>
            )}
            <button
              type="button"
              onClick={onConfirm}
              className={`w-full rounded-xl px-4 py-2.5 text-sm font-medium text-white shadow-md focus:outline-none transition-transform hover:scale-[1.02] active:scale-95 ${
                type === 'success' ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200 dark:shadow-none' :
                type === 'error' ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-200 dark:shadow-none' :
                type === 'warning' ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-200 dark:shadow-none' :
                'bg-sky-500 hover:bg-sky-600 shadow-sky-200 dark:shadow-none'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
