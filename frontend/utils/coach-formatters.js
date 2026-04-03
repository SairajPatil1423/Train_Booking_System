const COACH_TYPE_LABELS = {
  "1ac": "1AC",
  "2ac": "2AC",
  sleeper: "Sleeper",
};

const COACH_TYPE_ALIASES = {
  one_ac: "1ac",
  two_ac: "2ac",
  "1_ac": "1ac",
  "2_ac": "2ac",
};

export function normalizeCoachType(coachType) {
  if (!coachType) {
    return "";
  }

  const normalized = String(coachType).trim().toLowerCase();
  return COACH_TYPE_ALIASES[normalized] || normalized;
}

export function formatCoachType(coachType) {
  const normalized = normalizeCoachType(coachType);

  if (!normalized) {
    return "Not selected";
  }

  return COACH_TYPE_LABELS[normalized] || String(coachType);
}
