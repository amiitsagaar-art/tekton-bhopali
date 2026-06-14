import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";

export function usePushNotifications(phone: string | null, role: "worker" | "user") {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (!phone) return;

    // Check if running on native platform (Android/iOS)
    if (!Capacitor.isNativePlatform()) {
      console.log("[PUSH] Notifications not supported on web. Skipping registration.");
      return;
    }

    const registerPush = async () => {
      try {
        let permStatus = await PushNotifications.checkPermissions();

        if (permStatus.receive === "prompt") {
          permStatus = await PushNotifications.requestPermissions();
        }

        if (permStatus.receive !== "granted") {
          console.warn("[PUSH] Push notification permissions denied by user.");
          return;
        }

        // Register device with Apple APNS / Google FCM
        await PushNotifications.register();

        // Listener for registration success
        const regListener = await PushNotifications.addListener(
          "registration",
          async (tokenResult) => {
            const pushToken = tokenResult.value;
            setToken(pushToken);
            console.log("[PUSH] Registered successfully, token:", pushToken);

            // Sync token to PostgreSQL database
            try {
              const response = await fetch("/api/push-token", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone, role, token: pushToken }),
              });

              if (!response.ok) {
                const errData = await response.json();
                console.error("[PUSH] DB sync failed:", errData.error);
              } else {
                console.log("[PUSH] DB sync succeeded for", role, phone);
              }
            } catch (syncError) {
              console.error("[PUSH] Error syncing token to DB:", syncError);
            }
          }
        );

        // Listener for registration error
        const errListener = await PushNotifications.addListener(
          "registrationError",
          (error) => {
            console.error("[PUSH] Registration error:", error);
          }
        );

        // Listener for receiving notification in foreground
        const receivedListener = await PushNotifications.addListener(
          "pushNotificationReceived",
          (notification) => {
            console.log("[PUSH] Foreground notification received:", notification);
            // Display alert or inline notification to the active user
            alert(`${notification.title}\n${notification.body}`);
          }
        );

        // Listener for performing actions on notification (tapped)
        const actionListener = await PushNotifications.addListener(
          "pushNotificationActionPerformed",
          (action) => {
            console.log("[PUSH] Notification action performed:", action);
          }
        );

        // Cleanup function for listeners
        return () => {
          regListener.remove();
          errListener.remove();
          receivedListener.remove();
          actionListener.remove();
        };

      } catch (err) {
        console.error("[PUSH] Registration flow failed:", err);
      }
    };

    registerPush();

  }, [phone, role]);

  return { token };
}
