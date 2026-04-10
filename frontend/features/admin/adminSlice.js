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
  createAdminUser,
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
  lastFetchedAt: null,
});

const createPaginationState = () => ({
  page: 1,
  perPage: 10,
  totalCount: 0,
  totalPages: 1,
});

const ADMIN_RESOURCE_CACHE_TTL_MS = 60 * 1000;

const initialState = {
  trains: [],
  trainCatalog: [],
  trainCatalogStatus: "idle",
  trainCatalogError: null,
  trainCatalogFetchedAt: null,
  cities: [],
  stations: [],
  trainStops: [],
  bookings: [],
  coaches: [],
  fareRules: [],
  schedules: [],
  fareRulesMeta: {
    ...createPaginationState(),
  },
  coachesMeta: {
    ...createPaginationState(),
  },
  schedulesMeta: {
    ...createPaginationState(),
  },
  bookingsMeta: {
    ...createPaginationState(),
  },
  trainsMeta: {
    ...createPaginationState(),
  },
  resources: {
    users: createResourceState(),
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
  state.resources[resourceKey].lastFetchedAt = Date.now();
}

function shouldFetchAdminResource(state, resourceKey) {
  const resource = state?.admin?.resources?.[resourceKey];

  if (!resource) {
    return true;
  }

  if (resource.status === "loading") {
    return false;
  }

  if (resource.status === "idle" || resource.status === "failed") {
    return true;
  }

  if (!resource.lastFetchedAt) {
    return true;
  }

  return Date.now() - resource.lastFetchedAt > ADMIN_RESOURCE_CACHE_TTL_MS;
}

function shouldFetchAdminBookings(state, payload = {}) {
  const adminState = state?.admin;
  const resource = adminState?.resources?.bookings;
  const requestedPage = Number(payload.page || 1);
  const requestedPerPage = Number(payload.perPage || 10);

  if (!resource) {
    return true;
  }

  if (resource.status === "loading") {
    return false;
  }

  if (resource.status === "idle" || resource.status === "failed") {
    return true;
  }

  if (!resource.lastFetchedAt) {
    return true;
  }

  if (
    adminState?.bookingsMeta?.page !== requestedPage ||
    adminState?.bookingsMeta?.perPage !== requestedPerPage
  ) {
    return true;
  }

  return Date.now() - resource.lastFetchedAt > ADMIN_RESOURCE_CACHE_TTL_MS;
}

function shouldFetchAdminSchedules(state, payload = {}) {
  const adminState = state?.admin;
  const resource = adminState?.resources?.schedules;
  const requestedPage = Number(payload.page || 1);
  const requestedPerPage = Number(payload.perPage || 10);

  if (!resource) {
    return true;
  }

  if (resource.status === "loading") {
    return false;
  }

  if (resource.status === "idle" || resource.status === "failed") {
    return true;
  }

  if (!resource.lastFetchedAt) {
    return true;
  }

  if (
    adminState?.schedulesMeta?.page !== requestedPage ||
    adminState?.schedulesMeta?.perPage !== requestedPerPage
  ) {
    return true;
  }

  return Date.now() - resource.lastFetchedAt > ADMIN_RESOURCE_CACHE_TTL_MS;
}

function shouldFetchAdminCoaches(state, payload = {}) {
  const adminState = state?.admin;
  const resource = adminState?.resources?.coaches;
  const requestedPage = Number(payload.page || 1);
  const requestedPerPage = Number(payload.perPage || 10);

  if (!resource) {
    return true;
  }

  if (resource.status === "loading") {
    return false;
  }

  if (resource.status === "idle" || resource.status === "failed") {
    return true;
  }

  if (!resource.lastFetchedAt) {
    return true;
  }

  if (
    adminState?.coachesMeta?.page !== requestedPage ||
    adminState?.coachesMeta?.perPage !== requestedPerPage
  ) {
    return true;
  }

  return Date.now() - resource.lastFetchedAt > ADMIN_RESOURCE_CACHE_TTL_MS;
}

function shouldFetchAdminFareRules(state, payload = {}) {
  const adminState = state?.admin;
  const resource = adminState?.resources?.fareRules;
  const requestedPage = Number(payload.page || 1);
  const requestedPerPage = Number(payload.perPage || 10);

  if (!resource) {
    return true;
  }

  if (resource.status === "loading") {
    return false;
  }

  if (resource.status === "idle" || resource.status === "failed") {
    return true;
  }

  if (!resource.lastFetchedAt) {
    return true;
  }

  if (
    adminState?.fareRulesMeta?.page !== requestedPage ||
    adminState?.fareRulesMeta?.perPage !== requestedPerPage
  ) {
    return true;
  }

  return Date.now() - resource.lastFetchedAt > ADMIN_RESOURCE_CACHE_TTL_MS;
}

function shouldFetchAdminTrains(state, payload = {}) {
  const adminState = state?.admin;
  const resource = adminState?.resources?.trains;
  const requestedPage = Number(payload.page || 1);
  const requestedPerPage = Number(payload.perPage || 10);

  if (!resource) {
    return true;
  }

  if (resource.status === "loading") {
    return false;
  }

  if (resource.status === "idle" || resource.status === "failed") {
    return true;
  }

  if (!resource.lastFetchedAt) {
    return true;
  }

  if (
    adminState?.trainsMeta?.page !== requestedPage ||
    adminState?.trainsMeta?.perPage !== requestedPerPage
  ) {
    return true;
  }

  return Date.now() - resource.lastFetchedAt > ADMIN_RESOURCE_CACHE_TTL_MS;
}

function shouldFetchAdminTrainCatalog(state) {
  const adminState = state?.admin;

  if (!adminState) {
    return true;
  }

  if (adminState.trainCatalogStatus === "loading") {
    return false;
  }

  if (
    adminState.trainCatalogStatus === "idle" ||
    adminState.trainCatalogStatus === "failed"
  ) {
    return true;
  }

  if (!adminState.trainCatalogFetchedAt) {
    return true;
  }

  return Date.now() - adminState.trainCatalogFetchedAt > ADMIN_RESOURCE_CACHE_TTL_MS;
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

function normalizeMeta(meta, fallback = {}) {
  return {
    page: Number(meta?.current_page || fallback.page || 1),
    perPage: Number(meta?.per_page || fallback.perPage || 10),
    totalCount: Number(meta?.total_count || fallback.totalCount || 0),
    totalPages: Number(meta?.total_pages || fallback.totalPages || 1),
  };
}

export const fetchAdminTrainsThunk = createAsyncThunk(
  "admin/fetchTrains",
  async (payload = {}, { rejectWithValue }) => {
    try {
      const data = await fetchAdminTrains(payload);
      return {
        trains: data.data || [],
        meta: data.meta || {},
        request: {
          page: Number(payload.page || 1),
          perPage: Number(payload.perPage || 10),
        },
      };
    } catch (error) {
      return rejectWithValue(normalizeAdminError(error, "Failed to fetch trains."));
    }
  },
  {
    condition: (payload, { getState }) => shouldFetchAdminTrains(getState(), payload),
  }
);

export const fetchAdminTrainCatalogThunk = createAsyncThunk(
  "admin/fetchTrainCatalog",
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchAdminTrains({ page: 1, perPage: 50 });
      return data.data || [];
    } catch (error) {
      return rejectWithValue(normalizeAdminError(error, "Failed to fetch trains."));
    }
  },
  {
    condition: (_, { getState }) => shouldFetchAdminTrainCatalog(getState()),
  }
);

export const fetchAdminStationsThunk = createAsyncThunk(
  "admin/fetchStations",
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchAdminStations();
      return data.data || [];
    } catch (error) {
      return rejectWithValue(normalizeAdminError(error, "Failed to fetch stations."));
    }
  },
  {
    condition: (_, { getState }) => shouldFetchAdminResource(getState(), "stations"),
  }
);

export const fetchAdminCitiesThunk = createAsyncThunk(
  "admin/fetchCities",
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchAdminCities();
      return data.data || [];
    } catch (error) {
      return rejectWithValue(normalizeAdminError(error, "Failed to fetch cities."));
    }
  },
  {
    condition: (_, { getState }) => shouldFetchAdminResource(getState(), "cities"),
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
      return data.data || [];
    } catch (error) {
      return rejectWithValue(normalizeAdminError(error, "Failed to fetch train stops."));
    }
  },
  {
    condition: (payload, { getState }) => {
      if (payload?.force) {
        return true;
      }

      return shouldFetchAdminResource(getState(), "trainStops");
    },
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
  async (payload = {}, { rejectWithValue }) => {
    try {
      const data = await fetchAdminBookings(payload);
      return {
        bookings: data.data || [],
        meta: data.meta || {},
        request: {
          page: Number(payload.page || 1),
          perPage: Number(payload.perPage || 10),
        },
      };
    } catch (error) {
      return rejectWithValue(normalizeAdminError(error, "Failed to fetch bookings."));
    }
  },
  {
    condition: (payload, { getState }) => shouldFetchAdminBookings(getState(), payload),
  }
);

export const createAdminUserThunk = createAsyncThunk(
  "admin/createUser",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await createAdminUser(payload);
      return data.admin;
    } catch (error) {
      return rejectWithValue(normalizeAdminError(error, "Failed to create administrator."));
    }
  }
);

export const fetchAdminCoachesThunk = createAsyncThunk(
  "admin/fetchCoaches",
  async (payload = {}, { rejectWithValue }) => {
    try {
      const data = await fetchAdminCoaches(payload);
      return {
        coaches: data.data || [],
        meta: data.meta || {},
        request: {
          page: Number(payload.page || 1),
          perPage: Number(payload.perPage || 10),
        },
      };
    } catch (error) {
      return rejectWithValue(normalizeAdminError(error, "Failed to fetch coaches."));
    }
  },
  {
    condition: (payload, { getState }) => shouldFetchAdminCoaches(getState(), payload),
  }
);

export const createAdminCoachThunk = createAsyncThunk(
  "admin/createCoach",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await createAdminCoach(payload);
      return data.coach || data;
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
      return data.coach || data;
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
  async (payload = {}, { rejectWithValue }) => {
    try {
      const data = await fetchAdminFareRules(payload);
      return {
        fareRules: data.data || [],
        meta: data.meta || {},
        request: {
          page: Number(payload.page || 1),
          perPage: Number(payload.perPage || 10),
        },
      };
    } catch (error) {
      return rejectWithValue(normalizeAdminError(error, "Failed to fetch fare rules."));
    }
  },
  {
    condition: (payload, { getState }) => shouldFetchAdminFareRules(getState(), payload),
  }
);

export const createAdminFareRuleThunk = createAsyncThunk(
  "admin/createFareRule",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await createAdminFareRule(payload);
      return data.fare_rule || data;
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
      return data.fare_rule || data;
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
  async (payload = {}, { rejectWithValue }) => {
    try {
      const data = await fetchAdminSchedules(payload);
      return {
        schedules: data.data || [],
        meta: data.meta || {},
        request: {
          page: Number(payload.page || 1),
          perPage: Number(payload.perPage || 10),
        },
      };
    } catch (error) {
      return rejectWithValue(normalizeAdminError(error, "Failed to fetch schedules."));
    }
  },
  {
    condition: (payload, { getState }) => shouldFetchAdminSchedules(getState(), payload),
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
        state.trains = action.payload.trains;
        state.trainsMeta = normalizeMeta(action.payload.meta, {
          page: action.payload.request.page,
          perPage: action.payload.request.perPage,
          totalCount: action.payload.trains.length,
          totalPages: 1,
        });
      })
      .addCase(fetchAdminTrainsThunk.rejected, (state, action) => {
        setRejected(state, "trains", action);
      })
      .addCase(fetchAdminTrainCatalogThunk.pending, (state) => {
        state.trainCatalogStatus = "loading";
        state.trainCatalogError = null;
      })
      .addCase(fetchAdminTrainCatalogThunk.fulfilled, (state, action) => {
        state.trainCatalogStatus = "succeeded";
        state.trainCatalogError = null;
        state.trainCatalog = action.payload;
        state.trainCatalogFetchedAt = Date.now();
      })
      .addCase(fetchAdminTrainCatalogThunk.rejected, (state, action) => {
        state.trainCatalogStatus = "failed";
        state.trainCatalogError = action.payload;
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
        state.trainCatalog.unshift(action.payload);
        if (state.trainsMeta.page === 1) {
          state.trains.unshift(action.payload);
          state.trains = state.trains.slice(0, state.trainsMeta.perPage);
        }
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
        const catalogIndex = state.trainCatalog.findIndex((item) => item.id === action.payload.id);
        if (catalogIndex !== -1) {
          state.trainCatalog[catalogIndex] = action.payload;
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
        state.trainCatalog = state.trainCatalog.filter((item) => item.id !== action.payload);
      })
      .addCase(deleteAdminTrainThunk.rejected, (state, action) => {
        setRejected(state, "trains", action);
      })
      .addCase(fetchAdminTrainStopsThunk.pending, (state) => {
        setPending(state, "trainStops");
      })
      .addCase(fetchAdminTrainStopsThunk.fulfilled, (state, action) => {
        setFulfilled(state, "trainStops");
        state.trainStops = Array.isArray(action.payload) ? action.payload.filter(Boolean) : [];
      })
      .addCase(fetchAdminTrainStopsThunk.rejected, (state, action) => {
        setRejected(state, "trainStops", action);
      })
      .addCase(createAdminTrainStopThunk.pending, (state) => {
        setPending(state, "trainStops");
      })
      .addCase(createAdminTrainStopThunk.fulfilled, (state, action) => {
        setFulfilled(state, "trainStops");
        const trainStop = attachTrain(action.payload, state.trains);
        if (trainStop) {
          state.trainStops.push(trainStop);
        }
      })
      .addCase(createAdminTrainStopThunk.rejected, (state, action) => {
        setRejected(state, "trainStops", action);
      })
      .addCase(updateAdminTrainStopThunk.pending, (state) => {
        setPending(state, "trainStops");
      })
      .addCase(updateAdminTrainStopThunk.fulfilled, (state, action) => {
        setFulfilled(state, "trainStops");
        const trainStop = attachTrain(action.payload, state.trains);
        if (trainStop) {
          upsertById(state.trainStops, trainStop);
        }
      })
      .addCase(updateAdminTrainStopThunk.rejected, (state, action) => {
        setRejected(state, "trainStops", action);
      })
      .addCase(deleteAdminTrainStopThunk.pending, (state) => {
        setPending(state, "trainStops");
      })
      .addCase(deleteAdminTrainStopThunk.fulfilled, (state, action) => {
        setFulfilled(state, "trainStops");
        state.trainStops = state.trainStops.filter((item) => item?.id !== action.payload);
      })
      .addCase(deleteAdminTrainStopThunk.rejected, (state, action) => {
        setRejected(state, "trainStops", action);
      })
      .addCase(fetchAdminBookingsThunk.pending, (state) => {
        setPending(state, "bookings");
      })
      .addCase(fetchAdminBookingsThunk.fulfilled, (state, action) => {
        setFulfilled(state, "bookings");
        state.bookings = action.payload.bookings;
        state.bookingsMeta = normalizeMeta(action.payload.meta, {
          page: action.payload.request.page,
          perPage: action.payload.request.perPage,
          totalCount: action.payload.bookings.length,
          totalPages: 1,
        });
      })
      .addCase(fetchAdminBookingsThunk.rejected, (state, action) => {
        setRejected(state, "bookings", action);
      })
      .addCase(createAdminUserThunk.pending, (state) => {
        setPending(state, "users");
      })
      .addCase(createAdminUserThunk.fulfilled, (state) => {
        setFulfilled(state, "users");
      })
      .addCase(createAdminUserThunk.rejected, (state, action) => {
        setRejected(state, "users", action);
      })
      .addCase(fetchAdminCoachesThunk.pending, (state) => {
        setPending(state, "coaches");
      })
      .addCase(fetchAdminCoachesThunk.fulfilled, (state, action) => {
        setFulfilled(state, "coaches");
        state.coaches = Array.isArray(action.payload.coaches) ? action.payload.coaches.filter(Boolean) : [];
        state.coachesMeta = normalizeMeta(action.payload.meta, {
          page: action.payload.request.page,
          perPage: action.payload.request.perPage,
          totalCount: action.payload.coaches.length,
          totalPages: 1,
        });
      })
      .addCase(fetchAdminCoachesThunk.rejected, (state, action) => {
        setRejected(state, "coaches", action);
      })
      .addCase(createAdminCoachThunk.pending, (state) => {
        setPending(state, "coaches");
      })
      .addCase(createAdminCoachThunk.fulfilled, (state, action) => {
        setFulfilled(state, "coaches");
        const coach = attachTrain(action.payload, state.trains);
        if (coach) {
          upsertById(state.coaches, coach);
        }
      })
      .addCase(createAdminCoachThunk.rejected, (state, action) => {
        setRejected(state, "coaches", action);
      })
      .addCase(updateAdminCoachThunk.pending, (state) => {
        setPending(state, "coaches");
      })
      .addCase(updateAdminCoachThunk.fulfilled, (state, action) => {
        setFulfilled(state, "coaches");
        const coach = attachTrain(action.payload, state.trains);
        if (coach) {
          upsertById(state.coaches, coach);
        }
      })
      .addCase(updateAdminCoachThunk.rejected, (state, action) => {
        setRejected(state, "coaches", action);
      })
      .addCase(deleteAdminCoachThunk.pending, (state) => {
        setPending(state, "coaches");
      })
      .addCase(deleteAdminCoachThunk.fulfilled, (state, action) => {
        setFulfilled(state, "coaches");
        state.coaches = state.coaches.filter((item) => item?.id !== action.payload);
      })
      .addCase(deleteAdminCoachThunk.rejected, (state, action) => {
        setRejected(state, "coaches", action);
      })
      .addCase(fetchAdminFareRulesThunk.pending, (state) => {
        setPending(state, "fareRules");
      })
      .addCase(fetchAdminFareRulesThunk.fulfilled, (state, action) => {
        setFulfilled(state, "fareRules");
        state.fareRules = Array.isArray(action.payload.fareRules) ? action.payload.fareRules.filter(Boolean) : [];
        state.fareRulesMeta = normalizeMeta(action.payload.meta, {
          page: action.payload.request.page,
          perPage: action.payload.request.perPage,
          totalCount: action.payload.fareRules.length,
          totalPages: 1,
        });
      })
      .addCase(fetchAdminFareRulesThunk.rejected, (state, action) => {
        setRejected(state, "fareRules", action);
      })
      .addCase(createAdminFareRuleThunk.pending, (state) => {
        setPending(state, "fareRules");
      })
      .addCase(createAdminFareRuleThunk.fulfilled, (state, action) => {
        setFulfilled(state, "fareRules");
        const fareRule = attachTrain(action.payload, state.trains);
        if (fareRule) {
          upsertById(state.fareRules, fareRule);
        }
      })
      .addCase(createAdminFareRuleThunk.rejected, (state, action) => {
        setRejected(state, "fareRules", action);
      })
      .addCase(updateAdminFareRuleThunk.pending, (state) => {
        setPending(state, "fareRules");
      })
      .addCase(updateAdminFareRuleThunk.fulfilled, (state, action) => {
        setFulfilled(state, "fareRules");
        const fareRule = attachTrain(action.payload, state.trains);
        if (fareRule) {
          upsertById(state.fareRules, fareRule);
        }
      })
      .addCase(updateAdminFareRuleThunk.rejected, (state, action) => {
        setRejected(state, "fareRules", action);
      })
      .addCase(deleteAdminFareRuleThunk.pending, (state) => {
        setPending(state, "fareRules");
      })
      .addCase(deleteAdminFareRuleThunk.fulfilled, (state, action) => {
        setFulfilled(state, "fareRules");
        state.fareRules = state.fareRules.filter((item) => item?.id !== action.payload);
      })
      .addCase(deleteAdminFareRuleThunk.rejected, (state, action) => {
        setRejected(state, "fareRules", action);
      })
      .addCase(fetchAdminSchedulesThunk.pending, (state) => {
        setPending(state, "schedules");
      })
      .addCase(fetchAdminSchedulesThunk.fulfilled, (state, action) => {
        setFulfilled(state, "schedules");
        state.schedules = action.payload.schedules;
        state.schedulesMeta = normalizeMeta(action.payload.meta, {
          page: action.payload.request.page,
          perPage: action.payload.request.perPage,
          totalCount: action.payload.schedules.length,
          totalPages: 1,
        });
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
