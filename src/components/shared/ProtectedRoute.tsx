"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getItem } from "@/lib/storage";
import { SESSION_KEY } from "@/lib/constants";
import type { Session } from "@/types/auth";

interface Props {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const session = getItem<Session>(SESSION_KEY);

    if (!session) {
      router.replace("/login");
      return;
    }

    setAuthorized(true);
  }, []);

  if (!authorized) return null;

  return <>{children}</>;
}