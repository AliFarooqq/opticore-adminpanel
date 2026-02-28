import { createElement, createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

let nextId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, variant = 'info') => {
    const id = ++nextId;
    setToasts(prev => [...prev, { id, message, variant }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback(id => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = {
    success: msg => addToast(msg, 'success'),
    error: msg => addToast(msg, 'error'),
    info: msg => addToast(msg, 'info'),
  };

  return createElement(
    ToastContext.Provider,
    { value: { toast, toasts, removeToast } },
    children
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx.toast;
}

export function useToastState() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToastState must be used within ToastProvider');
  return { toasts: ctx.toasts, removeToast: ctx.removeToast };
}
