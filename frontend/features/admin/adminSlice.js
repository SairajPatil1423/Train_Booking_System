import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchAdminTrains,
  fetchAdminCities,
  fetchAdminStations,
  createAdminCity,
  createAdminStation,
  createAdminTrain,
  updateAdminTrain,
  deleteAdminTrain,
  fetchAdminTrainStops,
  createAdminTrainStop,
  updateAdminTrainStop,
  deleteAdminTrainStop,
  fetchAdminBookings,
  updateAdminBookingStatus,
  fetchAdminCoaches,
  createAdminCoach,
  updateAdminCoach,
  deleteAdminCoach,
  fetchAdminFareRules,
  createAdminFareRule,
  updateAdminFareRule,
  deleteAdminFareRule,
  fetchAdminSchedules,
  createAdminSchedule,
  updateAdminSchedule,
  deleteAdminSchedule,
} from "./adminService";
import { normalizeAdminError } from "./adminErrorUtils";

const createResourceState = () => ({
  status: "idle",
  error: null,
});

const initialState = {
  trains: [],
  cities: [],
  stations: [],
  trainStops: [],
  bookings: [],
  coaches: [],
  fareRules: [],
  schedules: [],
  resources: {
    trains: createResourceState(),
    cities: createResourceState(),
    stations: createResourceState(),
    trainStops: createResourceState(),
    bookings: createResourceState(),
    coaches: createResourceState(),
    fareRules: createResourceState(),
    schedules: createResourceState(),
  },
};

function setPending(state, resourceKey) {
  state.resources[resourceKey].status = "loading";
  state.resources[resourceKey].error = null;
}

function setRejected(state, resourceKey, action) {
  state.resources[resourceKey].status = "failed";
  state.resources[resourceKey].error = action.payload;
}

function setFulfilled(state, resourceKey) {
  state.resources[resourceKey].status = "succeeded";
  state.resources[resourceKey].error = null;
}

function attachTrain(entity, trains) {
  if (!entity || entity.train) {
    return entity;
  }

  const trainId = entity.train_id;
  if (!trainId) {
    return entity;
  }

  const train = trains.find((item) => item.id === trainId);
  if (!train) {
    return entity;
  }

  return {
    ...entity,
    train: {
      id: train.id,
      train_number: train.train_number,
      name: train.name,
      train_type: train.train_type,
    },
  };
}

function upsertById(collection, item) {
  const index = collection.findIndex((entry) => entry.id === item.id);
  if (index === -1) {
    collection.unshift(item);
    return;
  }

  collection[index] = item;
}

export const fetchAdminTrainsThunk = createAsyncThunk(
  "admin/fetchTrains",
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchAdminTrains();
      return data.trains;
    } catch (error) {
      return rejectWithValue(normalizeAdminError(error, "Failed to fetch trains."));
    }
  }
);

export const fetchAdminStationsThunk = createAsyncThunk(
  "admin/fetchStations",
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchAdminStations();
      return data.stations;
    } catch (error) {
      return rejectWithValue(normalizeAdminError(error, "Failed to fetch stations."));
    }
  }
);

export const fetchAdminCitiesThunk = createAsyncThunk(
  "admin/fetchCities",
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchAdminCities();
      return data.cities;
    } catch (error) {
      return rejectWithValue(normalizeAdminError(error, "Failed to fetch cities."));
    }
  }
);

export const createAdminCityThunk = createAsyncThunk(
  "admin/createCity",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await createAdminCity(payload);
      return data.city;
    } catch (error) {
      return rejectWithValue(normalizeAdminError(error, "Failed to create city."));
    }
  }
);

export const createAdminStationThunk = createAsyncThunk(
  "admin/createStation",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await createAdminStation(payload);
      return data.station;
    } catch (error) {
      return rejectWithValue(normalizeAdminError(error, "Failed to create station."));
    }
  }
);

export const createAdminTrainThunk = createAsyncThunk(
  "admin/createTrain",
  async (trainData, { rejectWithValue }) => {
    try {
      const data = await createAdminTrain(trainData);
      return data.train;
    } catch (error) {
      return rejectWithValue(normalizeAdminError(error, "Failed to create train."));
    }
  }
);

export const updateAdminTrainThunk = createAsyncThunk(
  "admin/updateTrain",
  async ({ id, trainData }, { rejectWithValue }) => {
    try {
      const data = await updateAdminTrain(id, trainData);
      return data.train;
    } catch (error) {
      return rejectWithValue(normalizeAdminError(error, "Failed to update train."));
    }
  }
);

export const deleteAdminTrainThunk = createAsyncThunk(
  "admin/deleteTrain",
  async (id, { rejectWithValue }) => {
    try {
      await deleteAdminTrain(id);
      return id;
    } catch (error) {
      return rejectWithValue(normalizeAdminError(error, "Failed to delete train."));
    }
  }
);

export const fetchAdminTrainStopsThunk = createAsyncThunk(
  "admin/fetchTrainStops",
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchAdminTrainStops();
      return data.train_stops;
    } catch (error) {
      return rejectWithValue(normalizeAdminError(error, "Failed to fetch train stops."));
    }
  }
);

export const createAdminTrainStopThunk = createAsyncThunk(
  "admin/createTrainStop",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await createAdminTrainStop(payload);
      return data.train_stop;
    } catch (error) {
      return rejectWithValue(normalizeAdminError(error, "Failed to add train stop."));
    }
  }
);

export const updateAdminTrainStopThunk = createAsyncThunk(
  "admin/updateTrainStop",
  async ({ id, trainStopData }, { rejectWithValue }) => {
    try {
      const data = await updateAdminTrainStop(id, trainStopData);
      return data.train_stop;
    } catch (error) {
      return rejectWithValue(normalizeAdminError(error, "Failed to update train stop."));
    }
  }
);

export const deleteAdminTrainStopThunk = createAsyncThunk(
  "admin/deleteTrainStop",
  async (id, { rejectWithValue }) => {
    try {
      await deleteAdminTrainStop(id);
      return id;
    } catch (error) {
      return rejectWithValue(normalizeAdminError(error, "Failed to remove train stop."));
    }
  }
);

export const fetchAdminBookingsThunk = createAsyncThunk(
  "admin/fetchBookings",
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchAdminBookings();
      return data.bookings;
    } catch (error) {
      return rejectWithValue(normalizeAdminError(error, "Failed to fetch bookings."));
    }
  }
);

export const updateAdminBookingStatusThunk = createAsyncThunk(
  "admin/updateBookingStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const data = await updateAdminBookingStatus(id, status);
      return data.booking;
    } catch (error) {
      return rejectWithValue(normalizeAdminError(error, "Failed to update booking."));
    }
  }
);

export const fetchAdminCoachesThunk = createAsyncThunk(
  "admin/fetchCoaches",
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchAdminCoaches();
      return data.coaches;
    } catch (error) {
      return rejectWithValue(normalizeAdminError(error, "Failed to fetch coaches."));
    }
  }
);

export const createAdminCoachThunk = createAsyncThunk(
  "admin/createCoach",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await createAdminCoach(payload);
      return data.coach;
    } catch (error) {
      return rejectWithValue(normalizeAdminError(error, "Failed to create coach."));
    }
  }
);

export const updateAdminCoachThunk = createAsyncThunk(
  "admin/updateCoach",
  async ({ id, coachData }, { rejectWithValue }) => {
    try {
      const data = await updateAdminCoach(id, coachData);
      return data.coach;
    } catch (error) {
      return rejectWithValue(normalizeAdminError(error, "Failed to update coach."));
    }
  }
);

export const deleteAdminCoachThunk = createAsyncThunk(
  "admin/deleteCoach",
  async (id, { rejectWithValue }) => {
    try {
      await deleteAdminCoach(id);
      return id;
    } catch (error) {
      return rejectWithValue(normalizeAdminError(error, "Failed to delete coach."));
    }
  }
);

export const fetchAdminFareRulesThunk = createAsyncThunk(
  "admin/fetchFareRules",
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchAdminFareRules();
      return data.fare_rules;
    } catch (error) {
      return rejectWithValue(normalizeAdminError(error, "Failed to fetch fare rules."));
    }
  }
);

export const createAdminFareRuleThunk = createAsyncThunk(
  "admin/createFareRule",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await createAdminFareRule(payload);
      return data.fare_rule;
    } catch (error) {
      return rejectWithValue(normalizeAdminError(error, "Failed to create fare rule."));
    }
  }
);

export const updateAdminFareRuleThunk = createAsyncThunk(
  "admin/updateFareRule",
  async ({ id, fareRuleData }, { rejectWithValue }) => {
    try {
      const data = await updateAdminFareRule(id, fareRuleData);
      return data.fare_rule;
    } catch (error) {
      return rejectWithValue(normalizeAdminError(error, "Failed to update fare rule."));
    }
  }
);

export const deleteAdminFareRuleThunk = createAsyncThunk(
  "admin/deleteFareRule",
  async (id, { rejectWithValue }) => {
    try {
      await deleteAdminFareRule(id);
      return id;
    } catch (error) {
      return rejectWithValue(normalizeAdminError(error, "Failed to delete fare rule."));
    }
  }
);

export const fetchAdminSchedulesThunk = createAsyncThunk(
  "admin/fetchSchedules",
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchAdminSchedules();
      return data.schedules;
    } catch (error) {
      return rejectWithValue(normalizeAdminError(error, "Failed to fetch schedules."));
    }
  }
);

export const createAdminScheduleThunk = createAsyncThunk(
  "admin/createSchedule",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await createAdminSchedule(payload);
      return data.schedule;
    } catch (error) {
      return rejectWithValue(normalizeAdminError(error, "Failed to create schedule."));
    }
  }
);

export const updateAdminScheduleThunk = createAsyncThunk(
  "admin/updateSchedule",
  async ({ id, scheduleData }, { rejectWithValue }) => {
    try {
      const data = await updateAdminSchedule(id, scheduleData);
      return data.schedule;
    } catch (error) {
      return rejectWithValue(normalizeAdminError(error, "Failed to update schedule."));
    }
  }
);

export const deleteAdminScheduleThunk = createAsyncThunk(
  "admin/deleteSchedule",
  async (id, { rejectWithValue }) => {
    try {
      await deleteAdminSchedule(id);
      return id;
    } catch (error) {
      return rejectWithValue(normalizeAdminError(error, "Failed to delete schedule."));
    }
  }
);

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    resetAdminState: (state) => {
      Object.keys(state.resources).forEach((key) => {
        state.resources[key].status = "idle";
        state.resources[key].error = null;
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminTrainsThunk.pending, (state) => {
        setPending(state, "trains");
      })
      .addCase(fetchAdminTrainsThunk.fulfilled, (state, action) => {
        setFulfilled(state, "trains");
        state.trains = action.payload;
      })
      .addCase(fetchAdminTrainsThunk.rejected, (state, action) => {
        setRejected(state, "trains", action);
      })
      .addCase(fetchAdminStationsThunk.pending, (state) => {
        setPending(state, "stations");
      })
      .addCase(fetchAdminStationsThunk.fulfilled, (state, action) => {
        setFulfilled(state, "stations");
        state.stations = action.payload;
      })
      .addCase(fetchAdminStationsThunk.rejected, (state, action) => {
        setRejected(state, "stations", action);
      })
      .addCase(fetchAdminCitiesThunk.pending, (state) => {
        setPending(state, "cities");
      })
      .addCase(fetchAdminCitiesThunk.fulfilled, (state, action) => {
        setFulfilled(state, "cities");
        state.cities = action.payload;
      })
      .addCase(fetchAdminCitiesThunk.rejected, (state, action) => {
        setRejected(state, "cities", action);
      })
      .addCase(createAdminCityThunk.pending, (state) => {
        setPending(state, "cities");
      })
      .addCase(createAdminCityThunk.fulfilled, (state, action) => {
        setFulfilled(state, "cities");
        upsertById(state.cities, action.payload);
      })
      .addCase(createAdminCityThunk.rejected, (state, action) => {
        setRejected(state, "cities", action);
      })
      .addCase(createAdminStationThunk.pending, (state) => {
        setPending(state, "stations");
      })
      .addCase(createAdminStationThunk.fulfilled, (state, action) => {
        setFulfilled(state, "stations");
        upsertById(state.stations, action.payload);
      })
      .addCase(createAdminStationThunk.rejected, (state, action) => {
        setRejected(state, "stations", action);
      })
      .addCase(createAdminTrainThunk.pending, (state) => {
        setPending(state, "trains");
      })
      .addCase(createAdminTrainThunk.fulfilled, (state, action) => {
        setFulfilled(state, "trains");
        state.trains.unshift(action.payload);
      })
      .addCase(createAdminTrainThunk.rejected, (state, action) => {
        setRejected(state, "trains", action);
      })
      .addCase(updateAdminTrainThunk.pending, (state) => {
        setPending(state, "trains");
      })
      .addCase(updateAdminTrainThunk.fulfilled, (state, action) => {
        setFulfilled(state, "trains");
        const index = state.trains.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.trains[index] = action.payload;
        }
      })
      .addCase(updateAdminTrainThunk.rejected, (state, action) => {
        setRejected(state, "trains", action);
      })
      .addCase(deleteAdminTrainThunk.pending, (state) => {
        setPending(state, "trains");
      })
      .addCase(deleteAdminTrainThunk.fulfilled, (state, action) => {
        setFulfilled(state, "trains");
        state.trains = state.trains.filter((item) => item.id !== action.payload);
      })
      .addCase(deleteAdminTrainThunk.rejected, (state, action) => {
        setRejected(state, "trains", action);
      })
      .addCase(fetchAdminTrainStopsThunk.pending, (state) => {
        setPending(state, "trainStops");
      })
      .addCase(fetchAdminTrainStopsThunk.fulfilled, (state, action) => {
        setFulfilled(state, "trainStops");
        state.trainStops = action.payload;
      })
      .addCase(fetchAdminTrainStopsThunk.rejected, (state, action) => {
        setRejected(state, "trainStops", action);
      })
      .addCase(createAdminTrainStopThunk.pending, (state) => {
        setPending(state, "trainStops");
      })
      .addCase(createAdminTrainStopThunk.fulfilled, (state, action) => {
        setFulfilled(state, "trainStops");
        state.trainStops.push(attachTrain(action.payload, state.trains));
      })
      .addCase(createAdminTrainStopThunk.rejected, (state, action) => {
        setRejected(state, "trainStops", action);
      })
      .addCase(updateAdminTrainStopThunk.pending, (state) => {
        setPending(state, "trainStops");
      })
      .addCase(updateAdminTrainStopThunk.fulfilled, (state, action) => {
        setFulfilled(state, "trainStops");
        upsertById(state.trainStops, attachTrain(action.payload, state.trains));
      })
      .addCase(updateAdminTrainStopThunk.rejected, (state, action) => {
        setRejected(state, "trainStops", action);
      })
      .addCase(deleteAdminTrainStopThunk.pending, (state) => {
        setPending(state, "trainStops");
      })
      .addCase(deleteAdminTrainStopThunk.fulfilled, (state, action) => {
        setFulfilled(state, "trainStops");
        state.trainStops = state.trainStops.filter((item) => item.id !== action.payload);
      })
      .addCase(deleteAdminTrainStopThunk.rejected, (state, action) => {
        setRejected(state, "trainStops", action);
      })
      .addCase(fetchAdminBookingsThunk.pending, (state) => {
        setPending(state, "bookings");
      })
      .addCase(fetchAdminBookingsThunk.fulfilled, (state, action) => {
        setFulfilled(state, "bookings");
        state.bookings = action.payload;
      })
      .addCase(fetchAdminBookingsThunk.rejected, (state, action) => {
        setRejected(state, "bookings", action);
      })
      .addCase(updateAdminBookingStatusThunk.pending, (state) => {
        setPending(state, "bookings");
      })
      .addCase(updateAdminBookingStatusThunk.fulfilled, (state, action) => {
        setFulfilled(state, "bookings");
        upsertById(state.bookings, action.payload);
      })
      .addCase(updateAdminBookingStatusThunk.rejected, (state, action) => {
        setRejected(state, "bookings", action);
      })
      .addCase(fetchAdminCoachesThunk.pending, (state) => {
        setPending(state, "coaches");
      })
      .addCase(fetchAdminCoachesThunk.fulfilled, (state, action) => {
        setFulfilled(state, "coaches");
        state.coaches = action.payload;
      })
      .addCase(fetchAdminCoachesThunk.rejected, (state, action) => {
        setRejected(state, "coaches", action);
      })
      .addCase(createAdminCoachThunk.pending, (state) => {
        setPending(state, "coaches");
      })
      .addCase(createAdminCoachThunk.fulfilled, (state, action) => {
        setFulfilled(state, "coaches");
        upsertById(state.coaches, attachTrain(action.payload, state.trains));
      })
      .addCase(createAdminCoachThunk.rejected, (state, action) => {
        setRejected(state, "coaches", action);
      })
      .addCase(updateAdminCoachThunk.pending, (state) => {
        setPending(state, "coaches");
      })
      .addCase(updateAdminCoachThunk.fulfilled, (state, action) => {
        setFulfilled(state, "coaches");
        upsertById(state.coaches, attachTrain(action.payload, state.trains));
      })
      .addCase(updateAdminCoachThunk.rejected, (state, action) => {
        setRejected(state, "coaches", action);
      })
      .addCase(deleteAdminCoachThunk.pending, (state) => {
        setPending(state, "coaches");
      })
      .addCase(deleteAdminCoachThunk.fulfilled, (state, action) => {
        setFulfilled(state, "coaches");
        state.coaches = state.coaches.filter((item) => item.id !== action.payload);
      })
      .addCase(deleteAdminCoachThunk.rejected, (state, action) => {
        setRejected(state, "coaches", action);
      })
      .addCase(fetchAdminFareRulesThunk.pending, (state) => {
        setPending(state, "fareRules");
      })
      .addCase(fetchAdminFareRulesThunk.fulfilled, (state, action) => {
        setFulfilled(state, "fareRules");
        state.fareRules = action.payload;
      })
      .addCase(fetchAdminFareRulesThunk.rejected, (state, action) => {
        setRejected(state, "fareRules", action);
      })
      .addCase(createAdminFareRuleThunk.pending, (state) => {
        setPending(state, "fareRules");
      })
      .addCase(createAdminFareRuleThunk.fulfilled, (state, action) => {
        setFulfilled(state, "fareRules");
        upsertById(state.fareRules, attachTrain(action.payload, state.trains));
      })
      .addCase(createAdminFareRuleThunk.rejected, (state, action) => {
        setRejected(state, "fareRules", action);
      })
      .addCase(updateAdminFareRuleThunk.pending, (state) => {
        setPending(state, "fareRules");
      })
      .addCase(updateAdminFareRuleThunk.fulfilled, (state, action) => {
        setFulfilled(state, "fareRules");
        upsertById(state.fareRules, attachTrain(action.payload, state.trains));
      })
      .addCase(updateAdminFareRuleThunk.rejected, (state, action) => {
        setRejected(state, "fareRules", action);
      })
      .addCase(deleteAdminFareRuleThunk.pending, (state) => {
        setPending(state, "fareRules");
      })
      .addCase(deleteAdminFareRuleThunk.fulfilled, (state, action) => {
        setFulfilled(state, "fareRules");
        state.fareRules = state.fareRules.filter((item) => item.id !== action.payload);
      })
      .addCase(deleteAdminFareRuleThunk.rejected, (state, action) => {
        setRejected(state, "fareRules", action);
      })
      .addCase(fetchAdminSchedulesThunk.pending, (state) => {
        setPending(state, "schedules");
      })
      .addCase(fetchAdminSchedulesThunk.fulfilled, (state, action) => {
        setFulfilled(state, "schedules");
        state.schedules = action.payload;
      })
      .addCase(fetchAdminSchedulesThunk.rejected, (state, action) => {
        setRejected(state, "schedules", action);
      })
      .addCase(createAdminScheduleThunk.pending, (state) => {
        setPending(state, "schedules");
      })
      .addCase(createAdminScheduleThunk.fulfilled, (state, action) => {
        setFulfilled(state, "schedules");
        upsertById(state.schedules, attachTrain(action.payload, state.trains));
      })
      .addCase(createAdminScheduleThunk.rejected, (state, action) => {
        setRejected(state, "schedules", action);
      })
      .addCase(updateAdminScheduleThunk.pending, (state) => {
        setPending(state, "schedules");
      })
      .addCase(updateAdminScheduleThunk.fulfilled, (state, action) => {
        setFulfilled(state, "schedules");
        upsertById(state.schedules, attachTrain(action.payload, state.trains));
      })
      .addCase(updateAdminScheduleThunk.rejected, (state, action) => {
        setRejected(state, "schedules", action);
      })
      .addCase(deleteAdminScheduleThunk.pending, (state) => {
        setPending(state, "schedules");
      })
      .addCase(deleteAdminScheduleThunk.fulfilled, (state, action) => {
        setFulfilled(state, "schedules");
        state.schedules = state.schedules.filter((item) => item.id !== action.payload);
      })
      .addCase(deleteAdminScheduleThunk.rejected, (state, action) => {
        setRejected(state, "schedules", action);
      });
  },
});

export const { resetAdminState } = adminSlice.actions;
export default adminSlice.reducer;
