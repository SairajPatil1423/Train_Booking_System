"use client";

import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LoadingState from "./loading-state";

export default function AdminGuard({ children }) {
  const { user, token, hydrated } = useSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (hydrated) {
      if (!token) {
        router.replace("/login");
      } else if (user?.role !== "admin") {
        router.replace("/"); // Redirect to user homepage if not admin
      }
    }
  }, [user, token, hydrated, router]);

  if (!hydrated) {
    return <LoadingState label="Verifying admin access..." />;
  }

  if (!token || user?.role !== "admin") {
    return null;
  }

  return children;
}
