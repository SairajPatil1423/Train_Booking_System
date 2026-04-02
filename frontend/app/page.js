"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import PageShell from "@/components/page-shell";
import LoadingState from "@/components/loading-state";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return (
    <PageShell className="items-center px-6 py-12 sm:px-10">
      <div className="w-full">
        <LoadingState label="Opening dashboard..." />
      </div>
    </PageShell>
  );
}
