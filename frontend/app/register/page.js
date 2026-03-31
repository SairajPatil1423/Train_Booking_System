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
      eyebrow="Create account"
      title="Book faster with your own RailYatra profile."
      description="Register once, keep your booking history in one place, and move quickly through future journeys."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-[var(--color-accent)]">
            Sign in here
          </Link>
        </>
      }
    >
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
            Register
          </h2>
          <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">
            Create your account to search trains, book tickets, and manage your
            journeys.
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
              className="w-full rounded-2xl border border-black/10 bg-[#fffdf8] px-4 py-3 outline-none transition focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[rgba(214,111,34,0.15)]"
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
              className="w-full rounded-2xl border border-black/10 bg-[#fffdf8] px-4 py-3 outline-none transition focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[rgba(214,111,34,0.15)]"
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
                className="w-full rounded-2xl border border-black/10 bg-[#fffdf8] px-4 py-3 outline-none transition focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[rgba(214,111,34,0.15)]"
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
                className="w-full rounded-2xl border border-black/10 bg-[#fffdf8] px-4 py-3 outline-none transition focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[rgba(214,111,34,0.15)]"
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
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={status === "loading"}
            className="inline-flex w-full items-center justify-center rounded-2xl bg-[var(--color-accent)] px-5 py-3 font-semibold text-white transition hover:opacity-92 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "loading" ? "Creating account..." : "Create account"}
          </button>
        </form>
      </div>
    </AuthShell>
  );
}
