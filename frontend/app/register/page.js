"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import AuthShell from "@/components/auth-shell";
import {
  setAuthError,
  setAuthLoading,
  setCredentials,
} from "@/features/auth/authSlice";
import { registerUser } from "@/features/auth/authService";
import { registerSchema } from "@/features/auth/schemas";

export default function RegisterPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { status, error } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      phone: "",
      password: "",
      passwordConfirmation: "",
    },
  });

  async function onSubmit(values) {
    dispatch(setAuthLoading());

    try {
      const data = await registerUser(values);
      dispatch(
        setCredentials({
          token: data.token,
          user: data.user,
        }),
      );
      router.push("/");
    } catch (requestError) {
      dispatch(
        setAuthError(
          requestError?.response?.data?.error ||
            "Unable to create your account right now.",
        ),
      );
    }
  }

  return (
    <AuthShell
      eyebrow="Passenger registration"
      title="Create your account to search and book train tickets."
      description="Register once to manage journeys, check availability, and continue future bookings more quickly."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-[var(--color-accent)]">
            Login here
          </Link>
        </>
      }
    >
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
            Create account
          </h2>
          <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">
            Enter your details to start booking and managing train journeys.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--color-ink)]">
              Email address
            </label>
            <input
              type="email"
              {...register("email")}
              className="field-input"
              placeholder="you@example.com"
            />
            {errors.email ? (
              <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
            ) : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--color-ink)]">
              Phone number
            </label>
            <input
              type="tel"
              {...register("phone")}
              className="field-input"
              placeholder="9876543210"
            />
            {errors.phone ? (
              <p className="mt-2 text-sm text-red-600">{errors.phone.message}</p>
            ) : null}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--color-ink)]">
                Password
              </label>
              <input
                type="password"
                {...register("password")}
                className="field-input"
                placeholder="Minimum 6 characters"
              />
              {errors.password ? (
                <p className="mt-2 text-sm text-red-600">
                  {errors.password.message}
                </p>
              ) : null}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--color-ink)]">
                Confirm password
              </label>
              <input
                type="password"
                {...register("passwordConfirmation")}
                className="field-input"
                placeholder="Repeat your password"
              />
              {errors.passwordConfirmation ? (
                <p className="mt-2 text-sm text-red-600">
                  {errors.passwordConfirmation.message}
                </p>
              ) : null}
            </div>
          </div>

          {error ? (
            <div className="rounded-[1.2rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={status === "loading"}
            className="danger-button w-full px-5 py-3.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "loading" ? "Creating account..." : "Create account"}
          </button>
        </form>
      </div>
    </AuthShell>
  );
}
