"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import AuthShell from "@/components/auth-shell";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import {
  setAuthError,
  setAuthLoading,
  setCredentials,
} from "@/features/auth/authSlice";
import { loginUser } from "@/features/auth/authService";
import { loginSchema } from "@/features/auth/schemas";
import { toastError, toastSuccess } from "@/utils/toast";

export default function LoginPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status, error } = useSelector((state) => state.auth);
  const redirectTarget = searchParams.get("redirect") || "/dashboard";

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
      dispatch(
        setCredentials({
          token: data.token,
          user: data.user,
        }),
      );
      toastSuccess("Welcome back. You are now signed in.", "Login successful");
      router.push(redirectTarget);
    } catch (requestError) {
      const message =
        requestError?.response?.data?.error || "Unable to log in right now.";
      dispatch(
        setAuthError(message),
      );
      toastError(message, "Login failed");
    }
  }

  return (
    <AuthShell
      eyebrow="Passenger login"
      title="Sign in to search routes and continue your booking."
      description="Access your journeys, booking history, and live train search with your account."
      highlights={[
        {
          title: "Resume bookings quickly",
          description:
            "Jump back into route search, seat selection, and pending bookings without starting over.",
        },
        {
          title: "Track every journey",
          description:
            "See your upcoming trips, cancellations, and booking history in one organized place.",
        },
      ]}
      stats={[
        { label: "Speed", value: "Fast sign-in flow" },
        { label: "Seats", value: "Exact seat continuity" },
        { label: "History", value: "Bookings synced" },
      ]}
      footer={
        <>
          New passenger?{" "}
          <Link href="/register" className="font-semibold text-[var(--color-accent)]">
            Create an account
          </Link>
        </>
      }
    >
      <div>
        <div className="mb-6">
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-[var(--color-accent-soft)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)]">
              Welcome back
            </span>
            <Link
              href="/admin/login"
              className="rounded-full border border-[var(--color-line)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
            >
              Admin login
            </Link>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
            Login
          </h2>
          <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">
            Enter your registered email address and password to continue.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <Input
            type="email"
            label="Email address"
            {...register("email")}
            placeholder="you@example.com"
            hint="Use the email you registered with for your passenger account."
            error={errors.email?.message}
          />

          <Input
            type="password"
            label="Password"
            {...register("password")}
            placeholder="Enter your password"
            hint="Your booking history and active journeys will load after sign-in."
            error={errors.password?.message}
          />

          {error ? (
            <div className="rounded-[1.2rem] border border-[color-mix(in_srgb,var(--color-danger)_26%,var(--color-line))] bg-[color-mix(in_srgb,var(--color-danger-soft)_84%,var(--color-panel-strong))] px-4 py-3 text-sm text-[var(--color-danger)]">
              {error}
            </div>
          ) : null}

          <div className="rounded-[1.5rem] border border-[var(--color-line)] bg-[var(--color-surface-soft)] px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
              Session benefits
            </p>
            <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">
              Signed-in passengers can manage reservations, review cancellations, and continue bookings with less friction.
            </p>
          </div>

          <Button type="submit" size="lg" disabled={status === "loading"} className="w-full">
            {status === "loading" ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </div>
    </AuthShell>
  );
}
