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
  const response = await api.post("/bookings", payload);
  return response.data;
}
