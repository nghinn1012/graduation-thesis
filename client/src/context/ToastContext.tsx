import React, { createContext, useCallback, useState } from 'react';
import toast, { ToastPosition, Toaster } from 'react-hot-toast';

interface IToastContextProviderProps {
  children?: React.ReactNode;
}

interface IToastContext {
  invork: (msg: string, options?: any) => void;
  info: (msg: string, options?: any) => void;
  success: (msg: string, options?: any) => void;
  error: (msg: string, options?: any) => void;
}

export const ToastContext = createContext<IToastContext>({
  invork: () => {},
  info: () => {},
  success: () => {},
  error: () => {},
});

const preSetup = {
  duration: 1000,
} as const;

export default function ToastContextProvider({
  children,
}: IToastContextProviderProps) {
  const [pos, setPos] = useState<ToastPosition>('top-center');

  const showToast = useCallback(
    (type: 'default' | 'success' | 'error' | 'info', msg: string, options?: any) => {
      const toastOptions = { ...preSetup, ...options, position: pos };

      // Conditionally invoke the appropriate toast function
      switch (type) {
        case 'success':
          toast.success(msg, toastOptions);
          break;
        case 'error':
          toast.error(msg, toastOptions);
          break;
        case 'info':
          toast(msg, toastOptions);
          break;
        default:
          toast(msg, toastOptions);
          break;
      }
    },
    [pos]
  );

  const invork = useCallback((msg: string, options?: any) => showToast('default', msg, options), [showToast]);
  const error = useCallback((msg: string, options?: any) => showToast('error', msg, options), [showToast]);
  const info = useCallback((msg: string, options?: any) => showToast('info', msg, options), [showToast]);
  const success = useCallback((msg: string, options?: any) => showToast('success', msg, options), [showToast]);

  return (
    <ToastContext.Provider
      value={{
        invork,
        error,
        info,
        success,
      }}
    >
      <Toaster
        position={pos}
        reverseOrder={false}
        toastOptions={{
          duration: 2000,
        }}
      />
      {children}
    </ToastContext.Provider>
  );
}
