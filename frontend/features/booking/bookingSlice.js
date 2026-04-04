import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { 
  createBooking, 
  fetchUserBookings, 
  cancelBooking,
  cancelTicket,
} from "./bookingService";

const BOOKINGS_CACHE_TTL_MS = 60 * 1000;

function normalizeMeta(meta, fallback = {}) {
  return {
    page: Number(meta?.current_page || fallback.page || 1),
    perPage: Number(meta?.per_page || fallback.perPage || 10),
    totalCount: Number(meta?.total_count || fallback.totalCount || 0),
    totalPages: Number(meta?.total_pages || fallback.totalPages || 1),
  };
}

function shouldFetchBookings(state, payload = {}) {
  const bookingState = state?.booking;
  const requestedPage = Number(payload.page || 1);
  const requestedPerPage = Number(payload.perPage || 10);

  if (!bookingState) {
    return true;
  }

  if (bookingState.bookingsStatus === "loading") {
    return false;
  }

  if (bookingState.bookingsStatus === "idle" || bookingState.bookingsStatus === "failed") {
    return true;
  }

  if (!bookingState.bookingsFetchedAt) {
    return true;
  }

  if (
    bookingState.bookingsMeta?.page !== requestedPage ||
    bookingState.bookingsMeta?.perPage !== requestedPerPage
  ) {
    return true;
  }

  return Date.now() - bookingState.bookingsFetchedAt > BOOKINGS_CACHE_TTL_MS;
}

function shouldFetchCancellations(state, payload = {}) {
  const bookingState = state?.booking;
  const requestedPage = Number(payload.page || 1);
  const requestedPerPage = Number(payload.perPage || 10);

  if (!bookingState) {
    return true;
  }

  if (bookingState.cancellationsStatus === "loading") {
    return false;
  }

  if (
    bookingState.cancellationsStatus === "idle" ||
    bookingState.cancellationsStatus === "failed"
  ) {
    return true;
  }

  if (!bookingState.cancellationsFetchedAt) {
    return true;
  }

  if (
    bookingState.cancellationsMeta?.page !== requestedPage ||
    bookingState.cancellationsMeta?.perPage !== requestedPerPage
  ) {
    return true;
  }

  return Date.now() - bookingState.cancellationsFetchedAt > BOOKINGS_CACHE_TTL_MS;
}

export const fetchUserBookingsThunk = createAsyncThunk(
  "booking/fetchAll",
  async (payload = {}, { rejectWithValue }) => {
    try {
      const data = await fetchUserBookings(payload);
      return {
        bookings: data.data || [],
        meta: data.meta || {},
        request: {
          page: Number(payload.page || 1),
          perPage: Number(payload.perPage || 10),
        },
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch bookings."
      );
    }
  },
  {
    condition: (payload, { getState }) => shouldFetchBookings(getState(), payload),
  }
);

export const cancelBookingThunk = createAsyncThunk(
  "booking/cancel",
  async ({ bookingId, reason }, { rejectWithValue }) => {
    try {
      const data = await cancelBooking(bookingId, reason);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.errors || error.response?.data?.error || "Cancellation failed."
      );
    }
  }
);

export const fetchUserCancellationsThunk = createAsyncThunk(
  "booking/fetchCancellations",
  async (payload = {}, { rejectWithValue }) => {
    try {
      const data = await fetchUserBookings({
        ...payload,
        withCancellations: true,
      });
      return {
        bookings: data.data || [],
        meta: data.meta || {},
        request: {
          page: Number(payload.page || 1),
          perPage: Number(payload.perPage || 10),
        },
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch cancellations."
      );
    }
  },
  {
    condition: (payload, { getState }) => shouldFetchCancellations(getState(), payload),
  }
);

export const cancelTicketThunk = createAsyncThunk(
  "booking/cancelTicket",
  async ({ bookingId, ticketAllocationId, reason }, { rejectWithValue }) => {
    try {
      const data = await cancelTicket(bookingId, ticketAllocationId, reason);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.errors || error.response?.data?.error || "Ticket cancellation failed."
      );
    }
  }
);

export const checkoutThunk = createAsyncThunk(
  "booking/checkout",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await createBooking(payload);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.errors || "Booking failed. Please try again."
      );
    }
  }
);

const initialState = {
  selectedSchedule: null,
  selectedCoachId: null,
  passengers: [],
  selectedSeats: {}, // Map of coachId -> seatIds[]
  fareSummary: null,
  lastBooking: null,
  userBookings: [],
  bookingsStatus: "idle",
  bookingsError: null,
  bookingsFetchedAt: null,
  bookingsMeta: {
    page: 1,
    perPage: 10,
    totalCount: 0,
    totalPages: 1,
  },
  cancellations: [],
  cancellationsStatus: "idle",
  cancellationsError: null,
  cancellationsFetchedAt: null,
  cancellationsMeta: {
    page: 1,
    perPage: 10,
    totalCount: 0,
    totalPages: 1,
  },
  refundSummary: null,
  status: "idle",
  error: null,
};

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    setSelectedSchedule(state, action) {
      state.selectedSchedule = action.payload || null;
    },
    setSelectedCoachId(state, action) {
      state.selectedCoachId = action.payload || null;
    },
    setPassengers(state, action) {
      state.passengers = action.payload || [];
    },
    toggleSeatSelection(state, action) {
      const { coachId, seatId } = action.payload;
      if (!state.selectedSeats[coachId]) {
        state.selectedSeats[coachId] = [];
      }
      
      const index = state.selectedSeats[coachId].indexOf(seatId);
      if (index === -1) {
        state.selectedSeats[coachId].push(seatId);
      } else {
        state.selectedSeats[coachId].splice(index, 1);
      }
    },
    removeSeatSelection(state, action) {
      const { coachId, seatId } = action.payload;
      if (!state.selectedSeats[coachId]) {
        return;
      }

      state.selectedSeats[coachId] = state.selectedSeats[coachId].filter((id) => id !== seatId);
      if (state.selectedSeats[coachId].length === 0) {
        delete state.selectedSeats[coachId];
      }
    },
    clearSeatSelection(state) {
      state.selectedSeats = {};
    },
    setFareSummary(state, action) {
      state.fareSummary = action.payload || null;
    },
    clearRefundSummary(state) {
      state.refundSummary = null;
    },
    resetBooking(state) {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkoutThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(checkoutThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.lastBooking = action.payload;
        state.selectedSeats = {};
      })
      .addCase(checkoutThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchUserBookingsThunk.pending, (state) => {
        state.bookingsStatus = "loading";
        state.bookingsError = null;
      })
      .addCase(fetchUserBookingsThunk.fulfilled, (state, action) => {
        state.bookingsStatus = "succeeded";
        state.userBookings = action.payload.bookings;
        state.bookingsFetchedAt = Date.now();
        state.bookingsMeta = normalizeMeta(action.payload.meta, {
          page: action.payload.request.page,
          perPage: action.payload.request.perPage,
          totalCount: action.payload.bookings.length,
          totalPages: 1,
        });
      })
      .addCase(fetchUserBookingsThunk.rejected, (state, action) => {
        state.bookingsStatus = "failed";
        state.bookingsError = action.payload;
      })
      .addCase(fetchUserCancellationsThunk.pending, (state) => {
        state.cancellationsStatus = "loading";
        state.cancellationsError = null;
      })
      .addCase(fetchUserCancellationsThunk.fulfilled, (state, action) => {
        state.cancellationsStatus = "succeeded";
        state.cancellations = action.payload.bookings;
        state.cancellationsFetchedAt = Date.now();
        state.cancellationsMeta = normalizeMeta(action.payload.meta, {
          page: action.payload.request.page,
          perPage: action.payload.request.perPage,
          totalCount: action.payload.bookings.length,
          totalPages: 1,
        });
      })
      .addCase(fetchUserCancellationsThunk.rejected, (state, action) => {
        state.cancellationsStatus = "failed";
        state.cancellationsError = action.payload;
      })
      .addCase(cancelBookingThunk.pending, (state) => {
        state.bookingsError = null;
        state.cancellationsError = null;
      })
      .addCase(cancelBookingThunk.fulfilled, (state, action) => {
        const index = state.userBookings.findIndex(b => b.id === action.payload.booking?.id);
        if (index !== -1) {
          state.userBookings[index] = action.payload.booking;
        }
        const cancellationsIndex = state.cancellations.findIndex(
          (b) => b.id === action.payload.booking?.id,
        );
        if (cancellationsIndex !== -1) {
          state.cancellations[cancellationsIndex] = action.payload.booking;
        }
        state.refundSummary = {
          bookingId: action.payload.booking?.id,
          refundAmount: action.payload.refund_amount,
          type: "booking",
        };
      })
      .addCase(cancelBookingThunk.rejected, (state, action) => {
        state.bookingsError = action.payload;
        state.cancellationsError = action.payload;
      })
      .addCase(cancelTicketThunk.pending, (state) => {
        state.bookingsError = null;
        state.cancellationsError = null;
      })
      .addCase(cancelTicketThunk.fulfilled, (state, action) => {
        const index = state.userBookings.findIndex(b => b.id === action.payload.booking?.id);
        if (index !== -1) {
          state.userBookings[index] = action.payload.booking;
        }
        const cancellationsIndex = state.cancellations.findIndex(
          (b) => b.id === action.payload.booking?.id,
        );
        if (cancellationsIndex !== -1) {
          state.cancellations[cancellationsIndex] = action.payload.booking;
        }
        state.refundSummary = {
          bookingId: action.payload.booking?.id,
          refundAmount: action.payload.refund_amount,
          type: "ticket",
        };
      })
      .addCase(cancelTicketThunk.rejected, (state, action) => {
        state.bookingsError = action.payload;
        state.cancellationsError = action.payload;
      });
  },
});

export const {
  setSelectedSchedule,
  setSelectedCoachId,
  setPassengers,
  toggleSeatSelection,
  removeSeatSelection,
  clearSeatSelection,
  setFareSummary,
  clearRefundSummary,
  resetBooking,
} = bookingSlice.actions;

// Selectors
export const selectSelectedSeatsArray = (state) => {
  const allSeats = [];
  Object.values(state.booking.selectedSeats).forEach(seats => {
    allSeats.push(...seats);
  });
  return allSeats;
};

export const selectShouldFetchUserBookings = (state, payload) => shouldFetchBookings(state, payload);

export default bookingSlice.reducer;
