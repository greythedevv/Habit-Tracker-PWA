"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import SplashScreen from "@/components/shared/SplashScreen";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
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