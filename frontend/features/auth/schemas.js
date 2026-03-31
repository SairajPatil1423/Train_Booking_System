import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export const registerSchema = z
  .object({
    email: z.email("Enter a valid email address."),
    phone: z
      .string()
      .min(10, "Phone number must be at least 10 digits.")
      .max(15, "Phone number must be at most 15 digits."),
    password: z.string().min(6, "Password must be at least 6 characters."),
    passwordConfirmation: z
      .string()
      .min(6, "Password confirmation must be at least 6 characters."),
  })
  .refine((values) => values.password === values.passwordConfirmation, {
    message: "Passwords do not match.",
    path: ["passwordConfirmation"],
  });
