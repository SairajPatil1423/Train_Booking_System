const COACH_TYPE_LABELS = {
  "1ac": "1AC",
  "2ac": "2AC",
  sleeper: "Sleeper",
};

export function formatCoachType(coachType) {
  if (!coachType) {
    return "Not selected";
  }

  return COACH_TYPE_LABELS[coachType] || coachType;
}
