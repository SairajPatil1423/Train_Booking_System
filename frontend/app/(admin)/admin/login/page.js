"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import AuthShell from "@/components/auth-shell";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import {
  clearCredentials,
  setAuthError,
  setAuthLoading,
  setCredentials,
} from "@/features/auth/authSlice";
import { loginUser } from "@/features/auth/authService";
import { loginSchema } from "@/features/auth/schemas";
import { toastError, toastSuccess } from "@/utils/toast";

export default function AdminLoginPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { status, error, hydrated, token, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (token && user?.role === "admin") {
      router.replace("/admin");
      return;
    }

    if (token && user?.role !== "admin") {
      dispatch(clearCredentials());
    }
  }, [dispatch, hydrated, router, token, user]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values) {
    dispatch(setAuthLoading());

    try {
      const data = await loginUser(values);

      if (data?.user?.role !== "admin") {
        dispatch(clearCredentials());
        dispatch(setAuthError("Admin access required."));
        toastError("Admin access required.", "Login failed");
        return;
      }

      dispatch(
        setCredentials({
          token: data.token,
          user: data.user,
        }),
      );
      toastSuccess("Admin session started successfully.", "Welcome back");
      router.push("/admin");
    } catch (requestError) {
      const message =
        requestError?.response?.data?.error ||
        "Unable to log in as admin right now.";
      dispatch(
        setAuthError(message),
      );
      toastError(message, "Admin login failed");
    }
  }

  return (
    <AuthShell
      eyebrow="Admin access"
      title="Admin sign in"
      description="Access trains, schedules, bookings, and fares."
      mode="admin"
      highlights={[
        {
          title: "Manage operations",
          description: "Update trains, schedules, coaches, and fares.",
        },
        {
          title: "Review bookings",
          description: "Check booking volume, status, and revenue.",
        },
      ]}
      stats={[
        { label: "Role", value: "Operations" },
        { label: "Area", value: "Admin tools" },
        { label: "Access", value: "Protected" },
      ]}
      footer={
        <>
          Regular passenger?{" "}
          <Link href="/login" className="font-semibold text-[var(--color-accent)]">
            Go to user login
          </Link>
        </>
      }
    >
      <div>
        <div className="mb-6">
          <div className="mb-4 inline-flex rounded-full bg-[var(--color-accent-soft)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)]">
            Operations control
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
            Admin login
          </h2>
          <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">
            Sign in with your administrator account.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <Input
            type="email"
            label="Admin email"
            {...register("email")}
            placeholder="admin1@trainbooking.com"
            hint="Use your admin email."
            error={errors.email?.message}
          />

          <Input
            type="password"
            label="Password"
            {...register("password")}
            placeholder="Enter your password"
            hint="Admin accounts only."
            error={errors.password?.message}
          />

          {error ? (
            <div className="rounded-[1.2rem] border border-[color-mix(in_srgb,var(--color-danger)_26%,var(--color-line))] bg-[color-mix(in_srgb,var(--color-danger-soft)_84%,var(--color-panel-strong))] px-4 py-3 text-sm text-[var(--color-danger)]">
              {error}
            </div>
          ) : null}

          <Button type="submit" size="lg" disabled={status === "loading"} className="w-full">
            {status === "loading" ? "Signing in..." : "Login as admin"}
          </Button>
        </form>
      </div>
    </AuthShell>
  );
}
