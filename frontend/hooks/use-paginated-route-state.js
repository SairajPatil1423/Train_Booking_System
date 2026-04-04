"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export const DEFAULT_PAGE_SIZE = 10;

export function usePaginatedRouteState({
  defaultPageSize = DEFAULT_PAGE_SIZE,
  totalPages = null,
  status = "",
  readyStatus = "succeeded",
} = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const state = useMemo(() => {
    const requestedPage = Number(searchParams.get("page") || 1);
    const requestedPerPage = Number(searchParams.get("per_page") || defaultPageSize);

    return {
      currentPage: Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1,
      currentPerPage:
        Number.isFinite(requestedPerPage) && requestedPerPage > 0
          ? requestedPerPage
          : defaultPageSize,
    };
  }, [defaultPageSize, searchParams]);

  useEffect(() => {
    if (status !== readyStatus || !totalPages || state.currentPage <= totalPages) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(totalPages));
    router.replace(`${pathname}?${params.toString()}`);
  }, [pathname, readyStatus, router, searchParams, state.currentPage, status, totalPages]);

  function setPage(nextPage) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(nextPage));
    params.set("per_page", String(state.currentPerPage));
    router.push(`${pathname}?${params.toString()}`);
  }

  function setPerPage(nextPerPage) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    params.set("per_page", String(nextPerPage));
    router.push(`${pathname}?${params.toString()}`);
  }

  return {
    currentPage: state.currentPage,
    currentPerPage: state.currentPerPage,
    setPage,
    setPerPage,
  };
}
