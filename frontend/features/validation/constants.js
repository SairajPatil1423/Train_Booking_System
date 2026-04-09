export const USER_ROLES = ["user", "admin"];
export const PASSENGER_GENDERS = ["male", "female", "other"];
export const PASSENGER_ID_TYPES = ["Aadhaar", "PAN", "Passport", "Driving Licence"];
export const PAYMENT_METHODS = ["upi", "card", "netbanking"];

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const INDIAN_PHONE_REGEX = /^\d{10}$/;
export const PERSON_NAME_REGEX = /^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/;
export const USERNAME_REGEX = /^[A-Za-z0-9_]+$/;
export const AADHAAR_REGEX = /^\d{12}$/;
export const PAN_REGEX = /^[A-Z]{5}\d{4}[A-Z]$/;
export const PASSPORT_REGEX = /^[A-Z][0-9]{7}$/;
export const DRIVING_LICENCE_REGEX = /^[A-Z0-9-]{8,20}$/;

export function sanitizeNameInput(value = "") {
  return value
    .replace(/[^A-Za-z\s'-]/g, "")
    .replace(/\s{2,}/g, " ")
    .trimStart();
}

export function sanitizeUsernameInput(value = "") {
  return value.replace(/[^A-Za-z0-9_]/g, "");
}

export function sanitizePhoneInput(value = "") {
  return value.replace(/\D/g, "").slice(0, 10);
}

export function sanitizeAgeInput(value = "") {
  return value.replace(/\D/g, "").slice(0, 3);
}

export function sanitizePassengerIdNumber(value = "", idType = "") {
  const rawValue = String(value || "");

  if (idType === "Aadhaar") {
    return rawValue.replace(/\D/g, "").slice(0, 12);
  }

  if (idType === "PAN") {
    return rawValue.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 10);
  }

  if (idType === "Passport") {
    return rawValue.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 8);
  }

  if (idType === "Driving Licence") {
    return rawValue.replace(/[^A-Za-z0-9-]/g, "").toUpperCase().slice(0, 20);
  }

  return rawValue.trimStart();
}
