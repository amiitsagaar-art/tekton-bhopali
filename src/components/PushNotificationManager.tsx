"use client";

import React, { useEffect, useState } from "react";
import { usePushNotifications } from "@/hooks/usePushNotifications";

export const PushNotificationManager: React.FC = () => {
  const [userPhone, setUserPhone] = useState<string | null>(null);
  const [workerPhone, setWorkerPhone] = useState<string | null>(null);

  useEffect(() => {
    const syncPhones = () => {
      if (typeof window === "undefined") return;
      setUserPhone(localStorage.getItem("tektonUserPhone"));
      setWorkerPhone(localStorage.getItem("tektonWorkerPhone"));
    };

    // Initialize on mount
    syncPhones();

    // Check periodically (every 5 seconds) to handle state changes within single-page flows
    const intervalId = setInterval(syncPhones, 5000);

    // Event listener for cross-tab or storage event
    window.addEventListener("storage", syncPhones);
    window.addEventListener("local-storage-sync", syncPhones);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("storage", syncPhones);
      window.removeEventListener("local-storage-sync", syncPhones);
    };
  }, []);

  // Initialize notifications for User (Customer)
  usePushNotifications(userPhone, "user");

  // Initialize notifications for Worker (Partner)
  usePushNotifications(workerPhone, "worker");

  return null;
};
