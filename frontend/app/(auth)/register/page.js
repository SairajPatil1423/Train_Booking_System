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
import {
  sanitizeNameInput,
  sanitizePhoneInput,
  sanitizeUsernameInput,
} from "@/features/validation/constants";
import { toastError, toastSuccess } from "@/utils/toast";

export default function RegisterPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { status, error } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      fullName: "",
      username: "",
      phone: "",
      address: "",
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
      toastSuccess("Your account is ready and you are signed in.", "Account created");
      router.push("/");
    } catch (requestError) {
      const message =
        requestError?.response?.data?.error ||
        "Unable to create your account right now.";
      dispatch(
        setAuthError(message),
      );
      toastError(message, "Registration failed");
    }
  }

  return (
    <AuthShell
      eyebrow="Passenger registration"
      title="Create your account to search and book train tickets."
      description="Register once to manage journeys, check availability, and continue future bookings more quickly."
      highlights={[
        {
          title: "Save time on future bookings",
          description:
            "Store your passenger profile once so repeat bookings feel much faster and cleaner.",
        },
        {
          title: "Keep every trip organized",
          description:
            "Your account brings bookings, cancellations, and upcoming train journeys together in one place.",
        },
      ]}
      stats={[
        { label: "Setup", value: "Single-step signup" },
        { label: "Search", value: "Faster future checkouts" },
        { label: "Access", value: "Journey dashboard ready" },
      ]}
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
          <div className="mb-4 inline-flex rounded-full bg-[var(--color-accent-soft)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)]">
            New passenger account
          </div>
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
            hint="This will become your primary sign-in email."
            error={errors.email?.message}
          />

          <Input
            type="text"
            label="Full name"
            {...register("fullName")}
            onChange={(event) =>
              setValue("fullName", sanitizeNameInput(event.target.value), {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
              })
            }
            placeholder="e.g. Priya Sharma"
            hint="Use the name you want associated with your bookings."
            error={errors.fullName?.message}
          />

          <Input
            type="text"
            label="Username"
            {...register("username")}
            onChange={(event) =>
              setValue("username", sanitizeUsernameInput(event.target.value), {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
              })
            }
            placeholder="e.g. railyatra_user"
            hint="Pick a memorable username for your passenger profile."
            error={errors.username?.message}
          />

          <Input
            type="tel"
            label="Phone number"
            {...register("phone")}
            onChange={(event) =>
              setValue("phone", sanitizePhoneInput(event.target.value), {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
              })
            }
            placeholder="9876543210"
            hint="Used for contact and booking-related communication."
            error={errors.phone?.message}
          />

          <Input
            type="text"
            label="Address"
            {...register("address")}
            placeholder="House no, street, city, state"
            hint="Keep it short and accurate for your profile."
            error={errors.address?.message}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              type="password"
              label="Password"
              {...register("password")}
              placeholder="Minimum 6 characters"
              hint="Choose a strong password you can remember."
              error={errors.password?.message}
            />

            <Input
              type="password"
              label="Confirm password"
              {...register("passwordConfirmation")}
              placeholder="Repeat your password"
              hint="Re-enter the same password to confirm."
              error={errors.passwordConfirmation?.message}
            />
          </div>

          {error ? (
            <div className="rounded-[1.2rem] border border-[color-mix(in_srgb,var(--color-danger)_26%,var(--color-line))] bg-[color-mix(in_srgb,var(--color-danger-soft)_84%,var(--color-panel-strong))] px-4 py-3 text-sm text-[var(--color-danger)]">
              {error}
            </div>
          ) : null}

          <div className="rounded-[1.5rem] border border-[var(--color-line)] bg-[var(--color-surface-soft)] px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
              After signup
            </p>
            <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">
              You will be signed in automatically and can immediately search trains, choose seats, and manage bookings.
            </p>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
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
