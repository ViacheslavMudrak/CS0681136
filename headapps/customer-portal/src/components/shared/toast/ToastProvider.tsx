"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import Toast from "./Toast";

export type ToastType = "success" | "error" | "warning" | "info";

export type ShowToastOptions = {
  title?: string;
  message?: string;
  messageField?: {
    value?: string | number;
    editable?: string;
  };
  type?: ToastType;
  duration?: number;
};

export interface ToastMessage {
  id: string;
  title?: string;
  message?: string;
  messageField?: {
    value?: string | number;
    editable?: string;
  };
  type: ToastType;
  duration?: number;
}

type ShowToast = {
  (message: string, type?: ToastType, duration?: number): void;
  (options: ShowToastOptions): void;
};

interface ToastContextType {
  showToast: ShowToast;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

interface ToastProviderProps {
  children: React.ReactNode;
}

function isShowToastOptions(a: string | ShowToastOptions): a is ShowToastOptions {
  return typeof a === "object" && a !== null && ("message" in a || "messageField" in a);
}

export default function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast: ShowToast = useCallback(
    (arg1: string | ShowToastOptions, type: ToastType = "info", duration: number = 5000) => {
      const id = Math.random().toString(36).substring(2, 9);

      let newToast: ToastMessage;

      if (isShowToastOptions(arg1)) {
        newToast = {
          id,
          title: arg1.title,
          message: arg1.message,
          messageField: arg1.messageField,
          type: arg1.type ?? "info",
          duration: arg1.duration ?? 5000,
        };
      } else {
        newToast = {
          id,
          message: arg1,
          type,
          duration,
        };
      }

      setToasts((prev) => [...prev, newToast]);

      const ms = newToast.duration ?? 5000;
      if (ms > 0) {
        setTimeout(() => {
          removeToast(id);
        }, ms);
      }
    },
    [removeToast]
  ) as ShowToast;

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <div className="fixed top-4 end-4 z-[9999] flex flex-col gap-3 max-w-[28rem] pointer-events-none bg-[white]">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            title={toast.title}
            message={toast.message}
            messageField={toast.messageField}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
