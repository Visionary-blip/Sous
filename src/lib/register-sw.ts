// Production only: in dev the worker would serve stale files and fight Vite's hot reload.
export function registerServiceWorker(): void {
  if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((error: unknown) => {
      console.warn("Sous could not register its offline worker", error);
    });
  });
}
