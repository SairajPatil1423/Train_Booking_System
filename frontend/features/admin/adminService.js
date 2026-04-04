import api from "@/services/api";

export async function fetchAdminTrains(params = {}) {
  const query = {};

  if (params.page) {
    query.page = params.page;
  }

  if (params.perPage) {
    query.per_page = params.perPage;
  }

  const response = await api.get("/admin/trains", { params: query });
  return response.data;
}

export async function fetchAdminStations() {
  const response = await api.get("/admin/stations");
  return response.data;
}

export async function fetchAdminCities() {
  const response = await api.get("/admin/cities");
  return response.data;
}

export async function createAdminCity(payload) {
  const response = await api.post("/admin/cities", { city: payload });
  return response.data;
}

export async function createAdminStation(payload) {
  const response = await api.post("/admin/stations", { station: payload });
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

export async function fetchAdminTrainStops() {
  const response = await api.get("/admin/train_stops");
  return response.data;
}

export async function createAdminTrainStop(payload) {
  const response = await api.post("/admin/train_stops", { train_stop: payload });
  return response.data;
}

export async function updateAdminTrainStop(id, payload) {
  const response = await api.put(`/admin/train_stops/${id}`, { train_stop: payload });
  return response.data;
}

export async function deleteAdminTrainStop(id) {
  const response = await api.delete(`/admin/train_stops/${id}`);
  return response.data;
}

export async function fetchAdminBookings(params = {}) {
  const query = {};

  if (params.page) {
    query.page = params.page;
  }

  if (params.perPage) {
    query.per_page = params.perPage;
  }

  const response = await api.get("/admin/bookings", { params: query });
  return response.data;
}

export async function createAdminUser(payload) {
  const response = await api.post("/admin/users", { user: payload });
  return response.data;
}

export async function fetchAdminCoaches(params = {}) {
  const query = {};

  if (params.page) {
    query.page = params.page;
  }

  if (params.perPage) {
    query.per_page = params.perPage;
  }

  const response = await api.get("/admin/coaches", { params: query });
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

export async function fetchAdminFareRules(params = {}) {
  const query = {};

  if (params.page) {
    query.page = params.page;
  }

  if (params.perPage) {
    query.per_page = params.perPage;
  }

  const response = await api.get("/admin/fare_rules", { params: query });
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

export async function fetchAdminSchedules(params = {}) {
  const query = {};

  if (params.page) {
    query.page = params.page;
  }

  if (params.perPage) {
    query.per_page = params.perPage;
  }

  const response = await api.get("/admin/schedules", { params: query });
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
