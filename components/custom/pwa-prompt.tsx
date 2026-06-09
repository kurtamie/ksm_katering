"use client";

import React from "react";
import { X } from "lucide-react";
import Logo from "@/app/asset/logo.png";
import Image from "next/image";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

type WindowWithPwaPrompt = Window & {
  __pwaDeferredPrompt?: BeforeInstallPromptEvent | null;
};

const PWA_PROMPT_DISMISSED_KEY = "ksm-pwa-prompt-dismissed";

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

  React.useEffect(() => {
    const installedNow = isStandaloneMode();
    const dismissed = window.localStorage.getItem(PWA_PROMPT_DISMISSED_KEY) === "true";
    setIsInstalled(installedNow);

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      const promptEvent = event as BeforeInstallPromptEvent;
      deferredPromptRef.current = promptEvent;
      (window as WindowWithPwaPrompt).__pwaDeferredPrompt = promptEvent;

      if (!installedNow && !dismissed) {
        setCanInstall(true);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
      (window as WindowWithPwaPrompt).__pwaDeferredPrompt = null;
    };

    const existingPrompt = (window as WindowWithPwaPrompt).__pwaDeferredPrompt;
    if (existingPrompt && !installedNow && !dismissed) {
      deferredPromptRef.current = existingPrompt;
      setCanInstall(true);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [isInstalled]);

  const install = async () => {
    if (!deferredPromptRef.current) return;
    await deferredPromptRef.current.prompt();
    const { outcome } = await deferredPromptRef.current.userChoice;
    if (outcome !== "accepted") {
      return;
    }

    setIsInstalled(true);
    deferredPromptRef.current = null;
    (window as WindowWithPwaPrompt).__pwaDeferredPrompt = null;
    setCanInstall(false);
  };

  const hidePrompt = () => {
    window.localStorage.setItem(PWA_PROMPT_DISMISSED_KEY, "true");
    setCanInstall(false);
  };

  if (!canInstall || isInstalled) return null;

  return (
    <div className="fixed bottom-24 left-1/2 z-60 flex min-w-80 -translate-x-1/2 items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-lg md:bottom-4">
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
