"use client";

import { useEffect, useState } from "react";
import { WifiOff, Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaProvider() {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    const onInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    const onOffline = () => setIsOffline(true);
    const onOnline = () => setIsOffline(false);
    const onInstalled = () => setInstallPrompt(null);

    setIsOffline(!navigator.onLine);
    window.addEventListener("beforeinstallprompt", onInstallPrompt);
    window.addEventListener("offline", onOffline);
    window.addEventListener("online", onOnline);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onInstallPrompt);
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") setInstallPrompt(null);
  };

  return (
    <>
      {isOffline && (
        <div
          role="status"
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-gray-800 px-4 py-2 text-sm text-white shadow-lg"
        >
          <WifiOff className="h-4 w-4 shrink-0" />
          Offline — dados locais disponíveis
        </div>
      )}

      {installPrompt && !dismissed && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-xl ring-1 ring-gray-200">
          <Download className="h-5 w-5 shrink-0 text-purple-600" />
          <span className="text-sm font-medium text-gray-800">
            Instalar o FinanceApp
          </span>
          <button
            onClick={handleInstall}
            className="rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-purple-700 transition-colors"
          >
            Instalar
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </>
  );
}
