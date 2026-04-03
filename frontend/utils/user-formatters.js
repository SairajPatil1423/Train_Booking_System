export function getUserDisplayName(user) {
  if (!user) {
    return "traveller";
  }

  return user.full_name || user.username || user.email || "traveller";
}
