import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast: addToast }}>
      {children}
      
      {/* Floating Toast Wrapper */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full">
        <AnimatePresence>
          {toasts.map((toast) => {
            let icon, bgColor, textColor, borderColor;
            
            switch (toast.type) {
              case 'success':
                icon = <CheckCircle2 className="h-5 w-5 text-emerald-400" />;
                bgColor = 'bg-slate-900/95';
                borderColor = 'border-emerald-500/30';
                textColor = 'text-slate-100';
                break;
              case 'error':
                icon = <XCircle className="h-5 w-5 text-rose-400" />;
                bgColor = 'bg-slate-900/95';
                borderColor = 'border-rose-500/30';
                textColor = 'text-slate-100';
                break;
              case 'warning':
                icon = <AlertTriangle className="h-5 w-5 text-amber-400" />;
                bgColor = 'bg-slate-900/95';
                borderColor = 'border-amber-500/30';
                textColor = 'text-slate-100';
                break;
              default:
                icon = <Info className="h-5 w-5 text-indigo-400" />;
                bgColor = 'bg-slate-900/95';
                borderColor = 'border-indigo-500/30';
                textColor = 'text-slate-100';
            }

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -15, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={`flex items-start gap-3 p-4 rounded-xl border ${borderColor} ${bgColor} ${textColor} shadow-lg backdrop-blur-md`}
              >
                <div className="mt-0.5">{icon}</div>
                <div className="flex-1 text-sm font-medium pr-2">
                  {toast.message}
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
