"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import AuthShell from "@/components/auth-shell";
import {
  clearCredentials,
  setAuthError,
  setAuthLoading,
  setCredentials,
} from "@/features/auth/authSlice";
import { loginUser } from "@/features/auth/authService";
import { loginSchema } from "@/features/auth/schemas";

export default function AdminLoginPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { status, error } = useSelector((state) => state.auth);

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
        return;
      }

      dispatch(
        setCredentials({
          token: data.token,
          user: data.user,
        }),
      );
      router.push("/admin");
    } catch (requestError) {
      dispatch(
        setAuthError(
          requestError?.response?.data?.error ||
            "Unable to log in as admin right now.",
        ),
      );
    }
  }

  return (
    <AuthShell
      eyebrow="Admin access"
      title="Sign in to the operations console."
      description="This login is reserved for administrators managing trains, schedules, bookings, coaches, and fare rules."
      footer={
        <>
          Regular user?{" "}
          <Link href="/login" className="font-semibold text-[var(--color-accent)]">
            Go to user login
          </Link>
        </>
      }
    >
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
            Admin login
          </h2>
          <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">
            Use an administrator account to access the backend management area.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--color-ink)]">
              Admin email
            </label>
            <input
              type="email"
              {...register("email")}
              className="w-full rounded-2xl border border-black/10 bg-[#fffdf8] px-4 py-3 outline-none transition focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[rgba(214,111,34,0.15)]"
              placeholder="admin1@trainbooking.com"
            />
            {errors.email ? (
              <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
            ) : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--color-ink)]">
              Password
            </label>
            <input
              type="password"
              {...register("password")}
              className="w-full rounded-2xl border border-black/10 bg-[#fffdf8] px-4 py-3 outline-none transition focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[rgba(214,111,34,0.15)]"
              placeholder="password123"
            />
            {errors.password ? (
              <p className="mt-2 text-sm text-red-600">
                {errors.password.message}
              </p>
            ) : null}
          </div>

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={status === "loading"}
            className="inline-flex w-full items-center justify-center rounded-2xl bg-[var(--color-ink)] px-5 py-3 font-semibold text-white transition hover:opacity-92 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "loading" ? "Signing in..." : "Login as admin"}
          </button>
        </form>
      </div>
    </AuthShell>
  );
}
