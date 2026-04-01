import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { 
  createBooking, 
  fetchUserBookings, 
  cancelBooking 
} from "./bookingService";

export const fetchUserBookingsThunk = createAsyncThunk(
  "booking/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchUserBookings();
      return data.bookings;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch bookings."
      );
    }
  }
);

export const cancelBookingThunk = createAsyncThunk(
  "booking/cancel",
  async (bookingId, { rejectWithValue }) => {
    try {
      const data = await cancelBooking(bookingId);
      return data.booking;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Cancellation failed."
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
    clearSeatSelection(state) {
      state.selectedSeats = {};
    },
    setFareSummary(state, action) {
      state.fareSummary = action.payload || null;
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
        state.userBookings = action.payload;
      })
      .addCase(fetchUserBookingsThunk.rejected, (state, action) => {
        state.bookingsStatus = "failed";
        state.bookingsError = action.payload;
      })
      .addCase(cancelBookingThunk.fulfilled, (state, action) => {
        const index = state.userBookings.findIndex(b => b.id === action.payload.id);
        if (index !== -1) {
          state.userBookings[index] = action.payload;
        }
      });
  },
});

export const {
  setSelectedSchedule,
  setSelectedCoachId,
  setPassengers,
  toggleSeatSelection,
  clearSeatSelection,
  setFareSummary,
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

export default bookingSlice.reducer;
