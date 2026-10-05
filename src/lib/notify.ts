export type NotifyPermission = "unsupported" | NotificationPermission;

export function currentPermission(): NotifyPermission {
  return typeof Notification === "undefined" ? "unsupported" : Notification.permission;
}

/** Asks the browser for permission; call it from a button press, since browsers ignore it otherwise. */
export async function requestPermission(): Promise<NotifyPermission> {
  return typeof Notification === "undefined" ? "unsupported" : Notification.requestPermission();
}

/**
 * Shows a system notification. Through the service worker when there is one (phones need that);
 * a plain Notification otherwise, as in `npm run dev`, where the worker is off.
 */
export async function showNotification(title: string, body: string): Promise<void> {
  if (currentPermission() !== "granted") return;
  const options = { body, icon: "/icon-192.png", tag: "sous-expiry" };
  const registration = "serviceWorker" in navigator ? await navigator.serviceWorker.getRegistration() : undefined;
  if (registration) await registration.showNotification(title, options);
  else new Notification(title, options);
}
