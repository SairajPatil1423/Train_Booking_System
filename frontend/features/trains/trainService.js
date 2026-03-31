import api from "@/services/api";

export async function fetchStations() {
  const response = await api.get("/stations");
  return response.data;
}

export async function searchSchedules(payload) {
  const response = await api.get("/schedules", {
    params: {
      src_station_id: payload.fromStationId,
      dst_station_id: payload.toStationId,
      travel_date: payload.journeyDate,
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
