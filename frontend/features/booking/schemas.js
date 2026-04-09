import { z } from "zod";
import {
  AADHAAR_REGEX,
  DRIVING_LICENCE_REGEX,
  EMAIL_REGEX,
  INDIAN_PHONE_REGEX,
  PAN_REGEX,
  PASSENGER_GENDERS,
  PASSENGER_ID_TYPES,
  PASSPORT_REGEX,
  PERSON_NAME_REGEX,
} from "@/features/validation/constants";

const passengerNameSchema = z
  .string()
  .trim()
  .min(1, "Required")
  .max(100, "Must be 100 characters or fewer")
  .regex(PERSON_NAME_REGEX, "Use letters only");

export const passengerSchema = z
  .object({
    first_name: passengerNameSchema,
    last_name: passengerNameSchema,
    age: z
      .string()
      .trim()
      .min(1, "Required")
      .refine((value) => /^\d+$/.test(value), "Only numbers allowed")
      .refine((value) => Number(value) > 0, "Age must be greater than 0")
      .refine((value) => Number(value) < 120, "Age must be below 120"),
    gender: z.enum(PASSENGER_GENDERS, {
      error: "Select a valid gender",
    }),
    id_type: z.enum(PASSENGER_ID_TYPES, {
      error: "Select a valid ID type",
    }),
    id_number: z
      .string()
      .trim()
      .min(1, "Required")
      .max(100, "Must be 100 characters or fewer"),
  })
  .superRefine((value, context) => {
    const idNumber = value.id_number.toUpperCase();

    if (value.id_type === "Aadhaar" && !AADHAAR_REGEX.test(idNumber)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["id_number"],
        message: "Aadhaar must be exactly 12 digits",
      });
    }

    if (value.id_type === "PAN" && !PAN_REGEX.test(idNumber)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["id_number"],
        message: "PAN must be 10 characters in valid format",
      });
    }

    if (value.id_type === "Passport" && !PASSPORT_REGEX.test(idNumber)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["id_number"],
        message: "Passport must start with a letter followed by 7 digits",
      });
    }

    if (value.id_type === "Driving Licence" && !DRIVING_LICENCE_REGEX.test(idNumber)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["id_number"],
        message: "Driving licence must be 8 to 20 letters, numbers, or hyphens",
      });
    }
  });

export const passengersFormSchema = z.object({
  passengers: z.array(passengerSchema).min(1, "Add at least one passenger").max(6, "Maximum 6 passengers"),
});

export const bookingConfirmationSchema = z.object({
  contactEmail: z
    .string()
    .trim()
    .min(1, "Email is required")
    .regex(EMAIL_REGEX, "Enter a valid email"),
  contactPhone: z
    .string()
    .trim()
    .regex(INDIAN_PHONE_REGEX, "Enter a valid 10-digit phone number"),
  agreeToTerms: z.literal(true, {
    errorMap: () => ({ message: "Confirm the details to continue" }),
  }),
});
