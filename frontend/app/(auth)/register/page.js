"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
          <Input
            type="email"
            label="Email address"
            {...register("email")}
            placeholder="you@example.com"
            error={errors.email?.message}
          />

          <Input
            type="tel"
            label="Phone number"
            {...register("phone")}
            placeholder="9876543210"
            error={errors.phone?.message}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              type="password"
              label="Password"
              {...register("password")}
              placeholder="Minimum 6 characters"
              error={errors.password?.message}
            />

            <Input
              type="password"
              label="Confirm password"
              {...register("passwordConfirmation")}
              placeholder="Repeat your password"
              error={errors.passwordConfirmation?.message}
            />
          </div>

          {error ? (
            <div className="rounded-[1.2rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <Button
            type="submit"
            variant="danger"
            disabled={status === "loading"}
            className="w-full"
          >
            {status === "loading" ? "Creating account..." : "Create account"}
          </Button>
        </form>
      </div>
    </AuthShell>
  );
}
