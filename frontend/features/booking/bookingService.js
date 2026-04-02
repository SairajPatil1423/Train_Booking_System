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

export async function cancelBooking(bookingId, reason = "") {
  const response = await api.put(`/bookings/${bookingId}`, {
    booking: { reason },
  });
  return response.data;
}

export async function cancelTicket(bookingId, ticketAllocationId, reason = "") {
  const response = await api.patch(`/bookings/${bookingId}/cancel_ticket`, {
    booking: {
      ticket_allocation_id: ticketAllocationId,
      reason,
    },
  });
  return response.data;
}
