import api from "@/services/api";

export async function fetchUserBookings(params = {}) {
  const query = {};

  if (params.page) {
    query.page = params.page;
  }

  if (params.perPage) {
    query.per_page = params.perPage;
  }

  if (params.withCancellations) {
    query.with_cancellations = true;
  }

  const response = await api.get("/bookings", { params: query });
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
