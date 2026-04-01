import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchStations } from "./trainService";

export const fetchStationsThunk = createAsyncThunk(
  "stations/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchStations();
      return data.stations || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch stations"
      );
    }
  }
);

const initialState = {
  items: [],
  status: "idle",
  error: null,
};

const stationsSlice = createSlice({
  name: "stations",
  initialState,
  reducers: {
    clearStations(state) {
      state.items = [];
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStationsThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchStationsThunk.fulfilled, (state, action) => {
        state.items = action.payload;
        state.status = "succeeded";
      })
      .addCase(fetchStationsThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { clearStations } = stationsSlice.actions;

// Selectors
export const selectAllStations = (state) => state.stations.items;
export const selectStationsStatus = (state) => state.stations.status;

export default stationsSlice.reducer;
