import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";

let appInitialized = false;

if (getApps().length === 0) {
  const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (serviceAccountStr) {
    try {
      const serviceAccount = JSON.parse(serviceAccountStr.replace(/\\n/g, "\n"));
      initializeApp({
        credential: cert(serviceAccount),
      });
      appInitialized = true;
      console.log("[FIREBASE ADMIN] Initialized successfully via service account cert.");
    } catch (e: any) {
      console.error("[FIREBASE ADMIN] Failed to parse service account JSON:", e.message);
      try {
        initializeApp();
        appInitialized = true;
      } catch (err: any) {
        console.error("[FIREBASE ADMIN] Failed fallback initialization:", err.message);
      }
    }
  } else {
    console.log("[FIREBASE ADMIN] Initializing with application default credentials.");
    try {
      initializeApp();
      appInitialized = true;
    } catch (err: any) {
      console.warn("[FIREBASE ADMIN] App default credentials initialization failed. FCM dry-run active.", err.message);
    }
  }
} else {
  appInitialized = true;
}

export const messaging = appInitialized ? getMessaging() : null;

/**
 * Sends a push notification to a device token.
 */
export async function sendPushNotification(
  token: string | null | undefined,
  title: string,
  body: string,
  data?: Record<string, string>
) {
  if (!token) {
    console.warn("[PUSH SENDER] Token is empty, skipping.");
    return null;
  }

  const msg = getApps().length > 0 ? getMessaging() : null;
  if (!msg) {
    console.warn("[PUSH SENDER] Firebase Messaging is not initialized, skipping.");
    return null;
  }

  try {
    const response = await msg.send({
      token,
      notification: {
        title,
        body,
      },
      data,
      android: {
        priority: "high",
        notification: {
          sound: "default",
          defaultSound: true,
        },
      },
    });
    console.log("[PUSH SENDER] Notification sent successfully:", response);
    return response;
  } catch (error: any) {
    console.error("[PUSH SENDER] Error sending notification:", error.message || error);
    return null;
  }
}
