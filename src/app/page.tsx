"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import SplashScreen from "@/components/shared/SplashScreen";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Register service worker and check for updates
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          // Check for updates every time the page loads
          registration.update();

          // When a new SW is waiting, activate it immediately
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (!newWorker) return;

            newWorker.addEventListener("statechange", () => {
              if (
                newWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                // New version available — tell it to skip waiting
                newWorker.postMessage({ type: "SKIP_WAITING" });
              }
            });
          });
        })
        .catch(() => {});

      // When the SW changes, reload once to get the fresh version
      let refreshing = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }

    const timer = setTimeout(() => {
      try {
        const raw = localStorage.getItem("habit-tracker-session");
        const session = raw ? JSON.parse(raw) : null;
        if (session && session.userId) {
          router.replace("/dashboard");
        } else {
          router.replace("/login");
        }
      } catch {
        router.replace("/login");
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  return <SplashScreen />;
}