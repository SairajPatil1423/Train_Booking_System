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
      title="Sign in to manage trains, schedules, and bookings."
      description="This area is reserved for authorised railway operations users."
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
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
            Admin login
          </h2>
          <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">
            Use your administrator account to access the operations area.
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
              className="field-input"
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
              className="field-input"
              placeholder="Enter your password"
            />
            {errors.password ? (
              <p className="mt-2 text-sm text-red-600">
                {errors.password.message}
              </p>
            ) : null}
          </div>

          {error ? (
            <div className="rounded-[1.2rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={status === "loading"}
            className="primary-button w-full px-5 py-3.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "loading" ? "Signing in..." : "Login as admin"}
          </button>
        </form>
      </div>
    </AuthShell>
  );
}
