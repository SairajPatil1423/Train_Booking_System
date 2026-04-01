import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { searchSchedules } from "./trainService";

export const searchSchedulesThunk = createAsyncThunk(
  "trainsSearch/search",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await searchSchedules(payload);
      return data.schedules || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Unable to fetch matching schedules."
      );
    }
  }
);

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
    setSearchError(state, action) {
      state.error = action.payload || null;
      state.status = action.payload ? "failed" : "idle";
    },
    resetSearch(state) {
      state.results = [];
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchSchedulesThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(searchSchedulesThunk.fulfilled, (state, action) => {
        state.results = action.payload;
        state.status = "succeeded";
      })
      .addCase(searchSchedulesThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { setSearchFilters, setSearchError, resetSearch } = searchSlice.actions;

export default searchSlice.reducer;
