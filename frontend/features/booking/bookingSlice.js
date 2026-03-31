import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedSchedule: null,
  selectedCoachId: null,
  passengers: [],
  selectedSeatIds: [],
  fareSummary: null,
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
    setSelectedSeatIds(state, action) {
      state.selectedSeatIds = action.payload || [];
    },
    setFareSummary(state, action) {
      state.fareSummary = action.payload || null;
    },
    setBookingLoading(state) {
      state.status = "loading";
      state.error = null;
    },
    setBookingError(state, action) {
      state.status = "failed";
      state.error = action.payload || "Unable to continue booking.";
    },
    resetBooking(state) {
      state.selectedSchedule = null;
      state.selectedCoachId = null;
      state.passengers = [];
      state.selectedSeatIds = [];
      state.fareSummary = null;
      state.status = "idle";
      state.error = null;
    },
  },
});

export const {
  setSelectedSchedule,
  setSelectedCoachId,
  setPassengers,
  setSelectedSeatIds,
  setFareSummary,
  setBookingLoading,
  setBookingError,
  resetBooking,
} = bookingSlice.actions;

export default bookingSlice.reducer;
