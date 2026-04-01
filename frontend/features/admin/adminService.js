import api from "@/services/api";

export async function fetchAdminTrains() {
  const response = await api.get("/admin/trains");
  return response.data;
}

export async function createAdminTrain(payload) {
  const response = await api.post("/admin/trains", { train: payload });
  return response.data;
}

export async function updateAdminTrain(id, payload) {
  const response = await api.put(`/admin/trains/${id}`, { train: payload });
  return response.data;
}

export async function deleteAdminTrain(id) {
  const response = await api.delete(`/admin/trains/${id}`);
  return response.data;
}

export async function fetchAdminBookings() {
  const response = await api.get("/admin/bookings");
  return response.data;
}

export async function updateAdminBookingStatus(id, status) {
  const response = await api.patch(`/admin/bookings/${id}`, { status });
  return response.data;
}

export async function fetchAdminCoaches() {
  const response = await api.get("/admin/coaches");
  return response.data;
}

export async function createAdminCoach(payload) {
  const response = await api.post("/admin/coaches", { coach: payload });
  return response.data;
}

export async function updateAdminCoach(id, payload) {
  const response = await api.put(`/admin/coaches/${id}`, { coach: payload });
  return response.data;
}

export async function deleteAdminCoach(id) {
  const response = await api.delete(`/admin/coaches/${id}`);
  return response.data;
}

export async function fetchAdminFareRules() {
  const response = await api.get("/admin/fare_rules");
  return response.data;
}

export async function createAdminFareRule(payload) {
  const response = await api.post("/admin/fare_rules", { fare_rule: payload });
  return response.data;
}

export async function updateAdminFareRule(id, payload) {
  const response = await api.put(`/admin/fare_rules/${id}`, { fare_rule: payload });
  return response.data;
}

export async function deleteAdminFareRule(id) {
  const response = await api.delete(`/admin/fare_rules/${id}`);
  return response.data;
}

export async function fetchAdminSchedules() {
  const response = await api.get("/admin/schedules");
  return response.data;
}

export async function createAdminSchedule(payload) {
  const response = await api.post("/admin/schedules", { schedule: payload });
  return response.data;
}

export async function updateAdminSchedule(id, payload) {
  const response = await api.put(`/admin/schedules/${id}`, { schedule: payload });
  return response.data;
}

export async function deleteAdminSchedule(id) {
  const response = await api.delete(`/admin/schedules/${id}`);
  return response.data;
}
