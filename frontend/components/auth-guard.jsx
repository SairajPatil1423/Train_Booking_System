"use client";

import { useSelector } from "react-redux";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import LoadingState from "./loading-state";

const PUBLIC_USER_ROUTES = ["/dashboard", "/search", "/search/results"];

export default function AuthGuard({ children }) {
  const { token, hydrated, user } = useSelector((state) => state.auth);
  const pathname = usePathname();
  const router = useRouter();
  const isPublicRoute = PUBLIC_USER_ROUTES.includes(pathname);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (token && user?.role === "admin") {
      router.replace("/admin");
      return;
    }

    if (!token && !isPublicRoute) {
      const redirectPath = pathname || "/dashboard";
      router.replace(`/login?redirect=${encodeURIComponent(redirectPath)}`);
    }
  }, [token, hydrated, isPublicRoute, pathname, router, user]);

  if (!hydrated) {
    return <LoadingState label="Authenticating..." />;
  }

  if ((token && user?.role === "admin") || (!token && !isPublicRoute)) {
    return null;
  }

  return children;
}
