"use client";

import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LoadingState from "./loading-state";

export default function AuthGuard({ children }) {
  const { token, hydrated } = useSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !token) {
      router.replace("/login");
    }
  }, [token, hydrated, router]);

  if (!hydrated) {
    return <LoadingState label="Authenticating..." />;
  }

  if (!token) {
    return null;
  }

  return children;
}
