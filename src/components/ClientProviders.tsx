"use client";

import React from "react";
import { ToastProvider } from "../context/ToastContext";
import { LanguageProvider } from "../context/LanguageContext";
import { PushNotificationManager } from "./PushNotificationManager";

export const ClientProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ToastProvider>
      <LanguageProvider>
        <PushNotificationManager />
        {children}
      </LanguageProvider>
    </ToastProvider>
  );
};
