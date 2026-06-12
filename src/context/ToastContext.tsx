// src/context/ToastContext.tsx
"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextProps {
  addToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = React.useRef(0);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType = "info") => {
    const id = nextId.current++;
    setToasts((prev) => [...prev, { id, message, type }]);
    // auto‑dismiss after 3 seconds
    setTimeout(() => removeToast(id), 3000);
  }, [removeToast]);

  // Cleanup any pending timers on unmount
  useEffect(() => {
    return () => {
      // Reset timer references if needed – not required for this simple impl
    };
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed inset-0 pointer-events-none z-50">
        {/* Desktop: top‑right, Mobile: bottom‑center */}
        <div className="hidden sm:flex flex-col space-y-2 top-4 right-4 absolute">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`max-w-xs w-full mx-4 p-3 rounded shadow-lg text-sm text-white
                ${t.type === "success" ? "bg-green-500" : t.type === "error" ? "bg-red-500" : "bg-blue-500"}
                transform transition-all duration-300 opacity-0 translate-y-2 animate-fade-in`}
            >
              {t.message}
            </div>
          ))}
        </div>
        {/* Mobile */}
        <div className="flex sm:hidden flex-col space-y-2 inset-x-0 bottom-4 absolute items-center">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`max-w-xs w-full mx-4 p-3 rounded shadow-lg text-sm text-white
                ${t.type === "success" ? "bg-green-500" : t.type === "error" ? "bg-red-500" : "bg-blue-500"}
                transform transition-all duration-300 opacity-0 translate-y-2 animate-fade-in`}
            >
              {t.message}
            </div>
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextProps => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
};
