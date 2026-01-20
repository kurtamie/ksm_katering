"use client";

import React from "react";
import { X } from "lucide-react";
import Logo from "@/app/asset/logo.png";
import Image from "next/image";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const DISMISS_KEY = "pwa-install-dismissed-at";
const DISMISS_TTL_MS = 24 * 60 * 60 * 1000;

function isStandaloneMode() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as { standalone?: boolean }).standalone === true
  );
}

export default function PwaPrompt() {
  const deferredPromptRef = React.useRef<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = React.useState(false);
  const [isInstalled, setIsInstalled] = React.useState(false);
  const [isDismissed, setIsDismissed] = React.useState(false);

  React.useEffect(() => {
    setIsInstalled(isStandaloneMode());

    const dismissedAt = window.localStorage.getItem(DISMISS_KEY);
    if (dismissedAt) {
      const diff = Date.now() - Number(dismissedAt);
      if (!Number.isNaN(diff) && diff < DISMISS_TTL_MS) {
        setIsDismissed(true);
      } else {
        window.localStorage.removeItem(DISMISS_KEY);
      }
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      if (isInstalled || isDismissed) return;
      event.preventDefault();
      deferredPromptRef.current = event as BeforeInstallPromptEvent;
      setCanInstall(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [isDismissed, isInstalled]);

  const install = async () => {
    if (!deferredPromptRef.current) return;
    await deferredPromptRef.current.prompt();
    const { outcome } = await deferredPromptRef.current.userChoice;
    if (outcome === "dismissed") {
      hidePrompt();
    }
    deferredPromptRef.current = null;
    setCanInstall(false);
  };

  const hidePrompt = () => {
    window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setIsDismissed(true);
    setCanInstall(false);
  };

  if (!canInstall || isInstalled) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-50 flex min-w-80 -translate-x-1/2 items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
      <div className="flex items-center gap-2">
        <Image src={Logo} className="size-8" alt="KSM Catering" />
        <span className="text-sm">Install KSM Catering app?</span>
      </div>
      <button
        type="button"
        onClick={install}
        className="rounded bg-slate-900 px-3 py-1 text-sm text-white hover:bg-slate-800"
      >
        Install
      </button>
      <button
        type="button"
        onClick={hidePrompt}
        className="absolute right-0 top-0 flex size-5 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full border border-slate-200 bg-white"
        aria-label="Close"
      >
        <X className="size-3" />
      </button>
    </div>
  );
}
