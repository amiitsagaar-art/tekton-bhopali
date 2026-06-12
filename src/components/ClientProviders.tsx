"use client";

import React from "react";
import { ToastProvider } from "../context/ToastContext";

export const ClientProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ToastProvider>
      {children}
    </ToastProvider>
  );
};
