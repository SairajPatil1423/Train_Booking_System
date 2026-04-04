import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchStations } from "./trainService";

const STATIONS_CACHE_TTL_MS = 5 * 60 * 1000;

function shouldFetchStations(state) {
  const stationsState = state?.stations;

  if (!stationsState) {
    return true;
  }

  if (stationsState.status === "loading") {
    return false;
  }

  if (stationsState.status === "idle" || stationsState.status === "failed") {
    return true;
  }

  if (!stationsState.lastFetchedAt) {
    return true;
  }

  return Date.now() - stationsState.lastFetchedAt > STATIONS_CACHE_TTL_MS;
}

export const fetchStationsThunk = createAsyncThunk(
  "stations/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchStations();
      return data.data || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch stations"
      );
    }
  },
  {
    condition: (_, { getState }) => shouldFetchStations(getState()),
  }
);

const initialState = {
  items: [],
  status: "idle",
  error: null,
  lastFetchedAt: null,
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
        state.lastFetchedAt = Date.now();
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
export const selectShouldFetchStations = (state) => shouldFetchStations(state);

export default stationsSlice.reducer;
