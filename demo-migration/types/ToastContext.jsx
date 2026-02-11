import React, { createContext, useContext, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, options = {}) => {
    const {
      type = 'success',
      title = null,
      duration = 5000,
      position = 'top-right',
    } = options;

    const id = uuidv4();
    const newToast = {
      id,
      message,
      title,
      type,
      duration,
      position,
      isVisible: true,
    };

    setToasts((prev) => [...prev, newToast]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback((message, options = {}) => {
    return showToast(message, { ...options, type: 'success' });
  }, [showToast]);

  const error = useCallback((message, options = {}) => {
    return showToast(message, { ...options, type: 'error' });
  }, [showToast]);

  const warning = useCallback((message, options = {}) => {
    return showToast(message, { ...options, type: 'warning' });
  }, [showToast]);

  const info = useCallback((message, options = {}) => {
    return showToast(message, { ...options, type: 'info' });
  }, [showToast]);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider
      value={{
        toasts,
        showToast,
        removeToast,
        success,
        error,
        warning,
        info,
        clearAll,
      }}
    >
      {children}
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

export default ToastContext;
