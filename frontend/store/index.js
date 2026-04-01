import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/authSlice";
import bookingReducer from "@/features/booking/bookingSlice";
import searchReducer from "@/features/trains/searchSlice";
import stationsReducer from "@/features/trains/stationsSlice";
import adminReducer from "@/features/admin/adminSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    booking: bookingReducer,
    trainsSearch: searchReducer,
    stations: stationsReducer,
    admin: adminReducer,
  },
  devTools: process.env.NODE_ENV !== "production",
});
