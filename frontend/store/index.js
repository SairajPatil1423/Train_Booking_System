import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/authSlice";
import bookingReducer from "@/features/booking/bookingSlice";
import searchReducer from "@/features/trains/searchSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    booking: bookingReducer,
    trainsSearch: searchReducer,
  },
  devTools: process.env.NODE_ENV !== "production",
});
