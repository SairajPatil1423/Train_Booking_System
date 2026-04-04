import api from "@/services/api";

function buildPaginationQuery(params = {}, defaultPerPage = 10) {
  const requestedPage = Number(params.page || 1);
  const requestedPerPage = Number(params.perPage || defaultPerPage);

  return {
    page: Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1,
    per_page: Number.isFinite(requestedPerPage) && requestedPerPage > 0 ? requestedPerPage : defaultPerPage,
  };
}

export async function fetchUserBookings(params = {}) {
  const query = buildPaginationQuery(params);

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
