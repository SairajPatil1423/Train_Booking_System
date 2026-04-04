import api from "@/services/api";

export async function fetchStations() {
  const response = await api.get("/stations", {
    params: {
      page: 1,
      per_page: 50,
    },
  });
  return response.data;
}

export async function searchSchedules(payload) {
  const response = await api.get("/schedules", {
    params: {
      src_station_id: payload.fromStationId,
      dst_station_id: payload.toStationId,
      travel_date: payload.journeyDate,
      page: payload.page || 1,
      per_page: payload.perPage || 10,
    },
  });

  return response.data;
}

export async function fetchScheduleDetails(scheduleId, payload) {
  const response = await api.get(`/schedules/${scheduleId}`, {
    params: {
      src_station_id: payload.srcStationId,
      dst_station_id: payload.dstStationId,
    },
  });

  return response.data;
}
