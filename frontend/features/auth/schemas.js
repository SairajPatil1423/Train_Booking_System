import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export const registerSchema = z
  .object({
    email: z.email("Enter a valid email address."),
    fullName: z
      .string()
      .min(3, "Full name must be at least 3 characters.")
      .max(120, "Full name must be at most 120 characters."),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters.")
      .max(50, "Username must be at most 50 characters."),
    phone: z
      .string()
      .min(10, "Phone number must be at least 10 digits.")
      .max(15, "Phone number must be at most 15 digits."),
    address: z
      .string()
      .min(10, "Address must be at least 10 characters.")
      .max(500, "Address must be at most 500 characters."),
    password: z.string().min(6, "Password must be at least 6 characters."),
    passwordConfirmation: z
      .string()
      .min(6, "Password confirmation must be at least 6 characters."),
  })
  .refine((values) => values.password === values.passwordConfirmation, {
    message: "Passwords do not match.",
    path: ["passwordConfirmation"],
  });
