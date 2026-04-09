import { z } from "zod";
import {
  EMAIL_REGEX,
  INDIAN_PHONE_REGEX,
  PERSON_NAME_REGEX,
  USERNAME_REGEX,
} from "@/features/validation/constants";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .regex(EMAIL_REGEX, "Enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export const registerSchema = z
  .object({
    email: z
      .string()
      .trim()
      .min(1, "Email is required.")
      .regex(EMAIL_REGEX, "Enter a valid email address."),
    fullName: z
      .string()
      .trim()
      .min(3, "Full name must be at least 3 characters.")
      .max(120, "Full name must be at most 120 characters."),
    username: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters.")
      .max(50, "Username must be at most 50 characters.")
      .regex(USERNAME_REGEX, "Username can only contain letters, numbers, and underscores"),
    phone: z.string().trim().regex(INDIAN_PHONE_REGEX, "Phone number must be exactly 10 digits."),
    address: z
      .string()
      .trim()
      .min(10, "Address must be at least 10 characters.")
      .max(500, "Address must be at most 500 characters."),
    password: z.string().min(6, "Password must be at least 6 characters."),
    passwordConfirmation: z
      .string()
      .min(6, "Password confirmation must be at least 6 characters."),
  })
  .refine((values) => PERSON_NAME_REGEX.test(values.fullName), {
    message: "Full name can only contain letters, spaces, apostrophes, and hyphens.",
    path: ["fullName"],
  })
  .refine((values) => values.password === values.passwordConfirmation, {
    message: "Passwords do not match.",
    path: ["passwordConfirmation"],
  });
