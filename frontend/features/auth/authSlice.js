import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: null,
  user: null,
  isAuthenticated: false,
  hydrated: false,
  status: "idle",
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    hydrateAuth(state, action) {
      const payload = action.payload || {};

      state.token = payload.token || null;
      state.user = payload.user || null;
      state.isAuthenticated = Boolean(payload.token);
      state.hydrated = true;
      state.error = null;
    },
    setCredentials(state, action) {
      const payload = action.payload || {};

      state.token = payload.token || null;
      state.user = payload.user || null;
      state.isAuthenticated = Boolean(payload.token);
      state.status = "succeeded";
      state.error = null;
      state.hydrated = true;
    },
    setAuthLoading(state) {
      state.status = "loading";
      state.error = null;
    },
    setAuthError(state, action) {
      state.status = "failed";
      state.error = action.payload || "Something went wrong.";
    },
    clearCredentials(state) {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.status = "idle";
      state.error = null;
      state.hydrated = true;
    },
  },
});

export const {
  hydrateAuth,
  setCredentials,
  setAuthLoading,
  setAuthError,
  clearCredentials,
} = authSlice.actions;

export default authSlice.reducer;
