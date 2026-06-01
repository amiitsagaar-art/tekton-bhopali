import { Capacitor } from '@capacitor/core';
import { PushNotifications, ActionPerformed, PushNotificationSchema, Token } from '@capacitor/push-notifications';

export interface PushNotificationCallbacks {
  onTokenRegistered?: (token: string) => void;
  onRegistrationError?: (error: any) => void;
  onNotificationReceived?: (notification: PushNotificationSchema) => void;
  onNotificationAction?: (action: ActionPerformed) => void;
}

/**
 * Checks if Push Notifications are supported on the current platform.
 * Push notifications are only supported on native mobile environments (Android / iOS).
 */
export function isPushSupported(): boolean {
  return typeof window !== 'undefined' && Capacitor.isNativePlatform();
}

/**
 * Requests notification permissions from the user and registers the device for push notifications.
 * Safe to call on any platform, but logic only executes on native mobile.
 */
export async function registerPushNotifications(): Promise<boolean> {
  if (!isPushSupported()) {
    console.log('[Push] Push notifications are not supported on this platform (Web/Dev Server).');
    return false;
  }

  try {
    let permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'granted') {
      console.warn('[Push] User denied notification permissions.');
      return false;
    }

    // Register with Apple / Google push services
    await PushNotifications.register();
    console.log('[Push] Capacitor push registration initiated successfully.');
    return true;
  } catch (error) {
    console.error('[Push] Error requesting permissions or registering device:', error);
    return false;
  }
}

/**
 * Attaches event listeners for Firebase Cloud Messaging events.
 * Safe to call on any platform.
 * 
 * @param callbacks Object containing custom callback handlers for FCM events.
 */
export function addPushListeners(callbacks: PushNotificationCallbacks): void {
  if (!isPushSupported()) {
    return;
  }

  // 1. Success Device Registration -> Received FCM/APNS token
  PushNotifications.addListener('registration', (token: Token) => {
    console.log('[Push] Device successfully registered. Token:', token.value);
    
    // Store token in localStorage for session checks
    localStorage.setItem('tektonFCMToken', token.value);

    if (callbacks.onTokenRegistered) {
      callbacks.onTokenRegistered(token.value);
    }
  });

  // 2. Registration Error
  PushNotifications.addListener('registrationError', (error: any) => {
    console.error('[Push] Registration error occurred:', error);
    if (callbacks.onRegistrationError) {
      callbacks.onRegistrationError(error);
    }
  });

  // 3. Foreground Notification Received
  PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
    console.log('[Push] Foreground notification received:', notification);
    if (callbacks.onNotificationReceived) {
      callbacks.onNotificationReceived(notification);
    }
  });

  // 4. Background/Tap Notification Action Performed
  PushNotifications.addListener('pushNotificationActionPerformed', (action: ActionPerformed) => {
    console.log('[Push] Notification action performed:', action);
    if (callbacks.onNotificationAction) {
      callbacks.onNotificationAction(action);
    }
  });
}

/**
 * Removes all push notification event listeners to prevent memory leaks.
 */
export async function removePushListeners(): Promise<void> {
  if (!isPushSupported()) {
    return;
  }

  try {
    await PushNotifications.removeAllListeners();
    console.log('[Push] Removed all push notification listeners.');
  } catch (error) {
    console.error('[Push] Error removing push listeners:', error);
  }
}
