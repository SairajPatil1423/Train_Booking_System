import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  filters: {
    fromStationId: "",
    toStationId: "",
    journeyDate: "",
  },
  results: [],
  status: "idle",
  error: null,
};

const searchSlice = createSlice({
  name: "trainsSearch",
  initialState,
  reducers: {
    setSearchFilters(state, action) {
      state.filters = {
        ...state.filters,
        ...(action.payload || {}),
      };
    },
    startSearch(state) {
      state.status = "loading";
      state.error = null;
    },
    setSearchResults(state, action) {
      state.results = action.payload || [];
      state.status = "succeeded";
      state.error = null;
    },
    setSearchError(state, action) {
      state.status = "failed";
      state.error = action.payload || "Unable to fetch trains.";
    },
    resetSearch(state) {
      state.results = [];
      state.status = "idle";
      state.error = null;
    },
  },
});

export const {
  setSearchFilters,
  startSearch,
  setSearchResults,
  setSearchError,
  resetSearch,
} = searchSlice.actions;

export default searchSlice.reducer;
