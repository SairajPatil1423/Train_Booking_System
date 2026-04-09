import { z } from "zod";
import {
  EMAIL_REGEX,
  INDIAN_PHONE_REGEX,
  PERSON_NAME_REGEX,
  USERNAME_REGEX,
} from "@/features/validation/constants";

export const TRAIN_TYPE_OPTIONS = ["express", "superfast", "passenger"];
export const COACH_TYPE_OPTIONS = ["1ac", "2ac", "sleeper"];
export const SCHEDULE_STATUS_OPTIONS = ["scheduled", "departed", "completed", "cancelled"];

const uuidSchema = z.string().trim().min(1, "Selection is required");
const dateTimeLocalSchema = z.string().trim().optional().or(z.literal(""));

export const trainSchema = z.object({
  train_number: z
    .string()
    .trim()
    .min(1, "Train number is required")
    .max(20, "Train number must be 20 characters or fewer"),
  name: z
    .string()
    .trim()
    .min(1, "Train name is required")
    .max(100, "Train name must be 100 characters or fewer"),
  train_type: z.enum(TRAIN_TYPE_OPTIONS, {
    error: "Select a valid train type",
  }),
  rating: z.coerce.number().min(0, "Rating must be at least 0").max(5, "Rating cannot exceed 5"),
  grade: z
    .string()
    .trim()
    .min(1, "Grade is required")
    .max(50, "Grade must be 50 characters or fewer"),
  is_active: z.boolean(),
});

export const citySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "City name is required")
    .max(100, "City name must be 100 characters or fewer"),
  state: z
    .string()
    .trim()
    .min(1, "State is required")
    .max(100, "State must be 100 characters or fewer"),
  country: z
    .string()
    .trim()
    .min(1, "Country is required")
    .max(100, "Country must be 100 characters or fewer"),
});

export const stationSchema = z.object({
  city_id: uuidSchema,
  name: z
    .string()
    .trim()
    .min(1, "Station name is required")
    .max(100, "Station name must be 100 characters or fewer"),
  code: z
    .string()
    .trim()
    .min(1, "Station code is required")
    .max(20, "Station code must be 20 characters or fewer"),
  latitude: z.union([z.literal(""), z.coerce.number().min(-90).max(90)]).optional(),
  longitude: z.union([z.literal(""), z.coerce.number().min(-180).max(180)]).optional(),
});

export const trainStopSchema = z
  .object({
    train_id: uuidSchema,
    station_id: uuidSchema,
    stop_order: z.coerce.number().int().min(1, "Stop order must be at least 1"),
    arrival_at: dateTimeLocalSchema,
    departure_at: dateTimeLocalSchema,
    distance_from_origin_km: z.coerce.number().min(0, "Distance must be 0 or more"),
  })
  .superRefine((value, context) => {
    if (value.arrival_at && value.departure_at && value.departure_at < value.arrival_at) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["departure_at"],
        message: "Departure must be after or equal to arrival",
      });
    }
  });

export const coachSchema = z.object({
  train_id: uuidSchema,
  coach_number: z
    .string()
    .trim()
    .min(1, "Coach number is required")
    .max(10, "Coach number must be 10 characters or fewer"),
  coach_type: z.enum(COACH_TYPE_OPTIONS, {
    error: "Select a valid coach type",
  }),
});

export const fareRuleSchema = z
  .object({
    train_id: uuidSchema,
    coach_type: z.enum(COACH_TYPE_OPTIONS, {
      error: "Select a valid coach type",
    }),
    base_fare_per_km: z.coerce.number().gt(0, "Base fare must be greater than 0"),
    dynamic_multiplier: z.coerce.number().gte(1, "Multiplier must be at least 1"),
    valid_from: z.string().trim().min(1, "Valid from date is required"),
    valid_to: z.string().trim().min(1, "Valid to date is required"),
  })
  .superRefine((value, context) => {
    if (value.valid_from && value.valid_to && value.valid_to < value.valid_from) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["valid_to"],
        message: "Valid to date must be on or after valid from date",
      });
    }
  });

export const createScheduleSchema = z
  .object({
    train_id: uuidSchema,
    travel_date: z.string().trim().min(1, "Travel date is required"),
    departure_time: z.string().trim().min(1, "Departure time is required"),
    expected_arrival_time: z.string().trim().min(1, "Expected arrival time is required"),
  })
  .superRefine((value, context) => {
    if (value.departure_time && value.expected_arrival_time && value.expected_arrival_time <= value.departure_time) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["expected_arrival_time"],
        message: "Expected arrival time must be after departure time",
      });
    }
  });

export const updateScheduleSchema = z
  .object({
    departure_time: z.string().trim().min(1, "Departure time is required"),
    expected_arrival_time: z.string().trim().min(1, "Expected arrival time is required"),
    status: z.enum(SCHEDULE_STATUS_OPTIONS, {
      error: "Select a valid schedule status",
    }),
    delay_minutes: z.coerce.number().int().min(0, "Delay minutes cannot be negative"),
  })
  .superRefine((value, context) => {
    if (value.departure_time && value.expected_arrival_time && value.expected_arrival_time <= value.departure_time) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["expected_arrival_time"],
        message: "Expected arrival time must be after departure time",
      });
    }
  });

export const adminUserSchema = z
  .object({
    email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .regex(EMAIL_REGEX, "Enter a valid email address"),
    full_name: z
      .string()
      .trim()
      .min(3, "Full name must be at least 3 characters")
      .max(120, "Full name must be 120 characters or fewer")
      .regex(PERSON_NAME_REGEX, "Full name can only contain letters, spaces, apostrophes, and hyphens"),
    username: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters")
      .max(50, "Username must be 50 characters or fewer")
      .regex(USERNAME_REGEX, "Username can only contain letters, numbers, and underscores"),
    phone: z.string().trim().regex(INDIAN_PHONE_REGEX, "Phone number must be exactly 10 digits"),
    address: z
      .string()
      .trim()
      .min(10, "Address must be at least 10 characters")
      .max(500, "Address must be 500 characters or fewer"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    password_confirmation: z.string().min(6, "Password confirmation must be at least 6 characters"),
  })
  .refine((value) => value.password === value.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  });
