import api from "@/services/api";

export async function fetchUserBookings() {
  const response = await api.get("/bookings");
  return response.data;
}

export async function fetchUserBooking(bookingId) {
  const response = await api.get(`/bookings/${bookingId}`);
  return response.data;
}

export async function createBooking(payload) {
  const response = await api.post("/bookings", { booking: payload });
  return response.data;
}

export async function cancelBooking(bookingId) {
  const response = await api.delete(`/bookings/${bookingId}`);
  return response.data;
}
