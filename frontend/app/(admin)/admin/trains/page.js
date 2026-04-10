"use client";

import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createAdminCityThunk,
  createAdminStationThunk,
  createAdminTrainThunk,
  fetchAdminTrainCatalogThunk,
  createAdminTrainStopThunk,
  fetchAdminCitiesThunk,
  deleteAdminTrainStopThunk,
  fetchAdminStationsThunk,
  fetchAdminTrainStopsThunk,
  deleteAdminTrainThunk,
  fetchAdminTrainsThunk,
  updateAdminTrainStopThunk,
  updateAdminTrainThunk,
} from "@/features/admin/adminSlice";
import AdminConfirmDialog from "@/components/admin/admin-confirm-dialog";
import PageHero from "@/components/layout/page-hero";
import PageSection from "@/components/layout/page-section";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import EmptyState from "@/components/ui/empty-state";
import Input from "@/components/ui/input";
import LoadingState from "@/components/loading-state";
import Badge from "@/components/ui/badge";
import PaginationToolbar from "@/components/ui/pagination-toolbar";
import { usePaginatedRouteState } from "@/hooks/use-paginated-route-state";
import { AdminErrorBox, AdminInfoBlock, AdminInfoPill } from "@/components/admin/admin-ui";
import {
  citySchema,
  stationSchema,
  trainSchema,
  trainStopSchema,
} from "@/features/admin/schemas";
import { formatErrorMessage } from "@/utils/errors";
import { toastError, toastInfo, toastSuccess } from "@/utils/toast";

const TRAIN_TYPE_OPTIONS = [
  { value: "express", label: "Express" },
  { value: "superfast", label: "Superfast" },
  { value: "passenger", label: "Passenger" },
];

export default function AdminTrainsPage() {
  const dispatch = useDispatch();
  const { trains, trainCatalog, trainsMeta, cities, stations, trainStops, resources } = useSelector((state) => state.admin);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const trainsStatus = resources.trains.status;
  const trainsError = resources.trains.error;
  const citiesStatus = resources.cities.status;
  const citiesError = resources.cities.error;
  const stationsStatus = resources.stations.status;
  const stationsError = resources.stations.error;
  const trainStopsStatus = resources.trainStops.status;
  const trainStopsError = resources.trainStops.error;
  const [editingTrain, setEditingTrain] = useState(null);
  const [editingStop, setEditingStop] = useState(null);
  const [selectedRouteTrainId, setSelectedRouteTrainId] = useState("");
  const [formError, setFormError] = useState("");
  const [routeFormError, setRouteFormError] = useState("");
  const [cityFormError, setCityFormError] = useState("");
  const [stationFormError, setStationFormError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const routeEditorRef = useRef(null);
  const { currentPage, currentPerPage, setPage, setPerPage } = usePaginatedRouteState({
    totalPages: trainsMeta.totalPages,
    status: trainsStatus,
  });

  useEffect(() => {
    if (isAuthenticated && user?.role === "admin") {
      dispatch(fetchAdminTrainsThunk({ page: currentPage, perPage: currentPerPage }));
      dispatch(fetchAdminTrainCatalogThunk());
      dispatch(fetchAdminTrainStopsThunk());
      dispatch(fetchAdminStationsThunk());
      dispatch(fetchAdminCitiesThunk());
    }
  }, [currentPage, currentPerPage, dispatch, isAuthenticated, user]);

  async function handleSave(event) {
    event.preventDefault();
    setFormError("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const trainData = {
      train_number: String(formData.get("train_number") || "").trim(),
      name: String(formData.get("name") || "").trim(),
      train_type: String(formData.get("train_type") || "").trim(),
      rating: String(formData.get("rating") || "").trim(),
      grade: String(formData.get("grade") || "").trim(),
      is_active: formData.get("is_active") === "on",
    };

    const parsedTrain = trainSchema.safeParse(trainData);
    if (!parsedTrain.success) {
      const message = parsedTrain.error.issues[0]?.message || "Enter valid train details.";
      setFormError(message);
      toastError(message, "Train action failed");
      return;
    }

    try {
      if (editingTrain) {
        if (isSameTrainPayload(editingTrain, parsedTrain.data)) {
          setFormError("No changes to save.");
          toastInfo("No changes to save.", "Nothing updated");
          return;
        }

        await dispatch(updateAdminTrainThunk({ id: editingTrain.id, trainData: parsedTrain.data })).unwrap();
        toastSuccess("Train updated successfully.");
      } else {
        const createdTrain = await dispatch(createAdminTrainThunk(parsedTrain.data)).unwrap();
        setSelectedRouteTrainId(createdTrain.id);
        toastSuccess("Train created successfully.");
        routeEditorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }

      setFormError("");
      setEditingTrain(null);
      form.reset();
    } catch (requestError) {
      const message = formatErrorMessage(requestError);
      setFormError(message);
      toastError(message, "Train action failed");
    }
  }

  async function handleRouteSave(event) {
    event.preventDefault();
    setRouteFormError("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const trainStopData = {
      train_id: String(formData.get("train_id") || "").trim(),
      station_id: String(formData.get("station_id") || "").trim(),
      stop_order: String(formData.get("stop_order") || "").trim(),
      arrival_at: String(formData.get("arrival_at") || "").trim(),
      departure_at: String(formData.get("departure_at") || "").trim(),
      distance_from_origin_km: String(formData.get("distance_from_origin_km") || "").trim(),
    };

    const parsedStop = trainStopSchema.safeParse(trainStopData);
    if (!parsedStop.success) {
      const message = parsedStop.error.issues[0]?.message || "Enter valid route stop details.";
      setRouteFormError(message);
      toastError(message, "Route stop action failed");
      return;
    }

    try {
      if (editingStop) {
        if (isSameTrainStopPayload(editingStop, parsedStop.data)) {
          setRouteFormError("No changes to save.");
          toastInfo("No changes to save.", "Nothing updated");
          return;
        }

        await dispatch(updateAdminTrainStopThunk({ id: editingStop.id, trainStopData: parsedStop.data })).unwrap();
        await dispatch(fetchAdminTrainStopsThunk({ force: true })).unwrap();
        toastSuccess("Route stop updated successfully.");
      } else {
        await dispatch(createAdminTrainStopThunk(parsedStop.data)).unwrap();
        await dispatch(fetchAdminTrainStopsThunk({ force: true })).unwrap();
        toastSuccess("Route stop added successfully.");
      }

      setRouteFormError("");
      setEditingStop(null);
      form.reset();
    } catch (requestError) {
      const message = formatErrorMessage(requestError);
      setRouteFormError(message);
      toastError(message, "Route stop action failed");
    }
  }

  async function handleCityCreate(event) {
    event.preventDefault();
    setCityFormError("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const cityData = {
      name: String(formData.get("name") || "").trim(),
      state: String(formData.get("state") || "").trim(),
      country: String(formData.get("country") || "").trim(),
    };

    const parsedCity = citySchema.safeParse(cityData);
    if (!parsedCity.success) {
      const message = parsedCity.error.issues[0]?.message || "Enter valid city details.";
      setCityFormError(message);
      toastError(message, "City creation failed");
      return null;
    }

    try {
      const createdCity = await dispatch(createAdminCityThunk(parsedCity.data)).unwrap();
      setCityFormError("");
      toastSuccess("City created successfully.");
      form.reset();
      return createdCity;
    } catch (requestError) {
      const message = formatErrorMessage(requestError);
      setCityFormError(message);
      toastError(message, "City creation failed");
      return null;
    }
  }

  async function handleStationCreate(event) {
    event.preventDefault();
    setStationFormError("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const stationData = {
      city_id: String(formData.get("city_id") || "").trim(),
      name: String(formData.get("name") || "").trim(),
      code: String(formData.get("code") || "").trim().toUpperCase(),
      latitude: String(formData.get("latitude") || "").trim(),
      longitude: String(formData.get("longitude") || "").trim(),
    };

    const parsedStation = stationSchema.safeParse(stationData);
    if (!parsedStation.success) {
      const message = parsedStation.error.issues[0]?.message || "Enter valid station details.";
      setStationFormError(message);
      toastError(message, "Station creation failed");
      return null;
    }

    try {
      const createdStation = await dispatch(createAdminStationThunk(parsedStation.data)).unwrap();
      setStationFormError("");
      toastSuccess("Station created successfully.");
      form.reset();
      return createdStation;
    } catch (requestError) {
      const message = formatErrorMessage(requestError);
      setStationFormError(message);
      toastError(message, "Station creation failed");
      return null;
    }
  }

  async function handleDeleteStop() {
    if (!deleteTarget || deleteTarget.type !== "stop") {
      return;
    }

    setRouteFormError("");

    try {
      await dispatch(deleteAdminTrainStopThunk(deleteTarget.id)).unwrap();
      await dispatch(fetchAdminTrainStopsThunk({ force: true })).unwrap();
      setRouteFormError("");
      setDeleteTarget(null);
      toastSuccess("Route stop removed successfully.");
    } catch (requestError) {
      const message = formatErrorMessage(requestError);
      setRouteFormError(message);
      toastError(message, "Route stop removal failed");
    }
  }

  const availableTrains = trainCatalog.length ? trainCatalog : trains;
  const effectiveRouteTrainId = selectedRouteTrainId || availableTrains[0]?.id || "";
  const selectedRouteTrain =
    availableTrains.find((train) => train.id === effectiveRouteTrainId) ||
    editingTrain ||
    availableTrains[0] ||
    null;
  const selectedTrainId = selectedRouteTrain?.id || "";
  const safeTrainStops = Array.isArray(trainStops) ? trainStops.filter(Boolean) : [];
  const selectedTrainStops = safeTrainStops
    .filter((stop) => stop?.train_id === selectedTrainId)
    .sort((left, right) => Number(left.stop_order || 0) - Number(right.stop_order || 0));

  async function handleDeleteTrain() {
    if (!deleteTarget || deleteTarget.type !== "train") {
      return;
    }

    setFormError("");

    try {
      await dispatch(deleteAdminTrainThunk(deleteTarget.id)).unwrap();
      setFormError("");
      setDeleteTarget(null);
      toastSuccess("Train deleted successfully.");
    } catch (requestError) {
      const message = formatErrorMessage(requestError);
      setFormError(message);
      toastError(message, "Train deletion failed");
    }
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-81px)] w-full max-w-5xl flex-1 items-center px-6 py-12 sm:px-10">
        <div className="surface-panel w-full rounded-[2rem] p-8 text-center">
          <p className="inline-flex rounded-full bg-[var(--color-danger-soft)] px-3 py-1 text-sm font-bold uppercase tracking-[0.2em] text-[var(--color-danger)]">
            Unauthorized Access
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10 sm:px-10 lg:px-12">
      <div className="space-y-6">
        <PageHero
          eyebrow="Train management"
          title="Trains"
          meta={[`${trainsMeta.totalCount || trains.length} trains`, `Page ${trainsMeta.page}`]}
        />

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <PageSection className="p-6 sm:p-8">
            {trainsStatus === "loading" && trains.length === 0 ? <LoadingState label="Loading trains..." /> : null}
            {trainsStatus === "loading" && trains.length > 0 ? (
              <div className="pb-4 text-sm font-medium text-[var(--color-muted)]">Loading page {currentPage}...</div>
            ) : null}
            <AdminErrorBox message={Array.isArray(trainsError) ? trainsError.join(", ") : trainsError} />

            {trains.length > 0 ? (
              <div className="space-y-4">
                {trains.map((train) => {
                  const routeStops = safeTrainStops
                    .filter((stop) => stop?.train_id === train.id)
                    .sort((left, right) => Number(left.stop_order || 0) - Number(right.stop_order || 0));

                  return (
                  <Card key={train.id} className="rounded-[1.6rem] p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <p className="text-lg font-semibold text-[var(--color-ink)]">
                          {train.train_number} • {train.name}
                        </p>
                        <p className="mt-1 text-sm text-[var(--color-muted)]">
                          {formatTrainType(train.train_type)} service
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <AdminInfoPill label={`${Number(train.rating || 0).toFixed(1)} rating`} />
                        <AdminInfoPill label={train.grade || "No grade"} variant="neutral" />
                        <Badge variant={train.is_active ? "success" : "danger"} className="px-4 py-2 text-xs sm:text-sm">
                          {train.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <AdminInfoBlock label="Train type" value={formatTrainType(train.train_type)} />
                      <AdminInfoBlock label="Rating" value={String(train.rating || "0")} accent />
                      <AdminInfoBlock label="Grade" value={train.grade || "-"} />
                    </div>

                    <div className="mt-4 rounded-[1.25rem] bg-[var(--color-surface-soft)] px-4 py-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
                          Route stops
                        </p>
                        <AdminInfoPill
                          label={routeStops.length ? `${routeStops.length} stop(s)` : "No route yet"}
                          variant={routeStops.length ? "primary" : "neutral"}
                        />
                      </div>
                      {routeStops.length ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {routeStops.map((stop) => (
                            <span
                              key={stop.id}
                              className="rounded-full border border-[var(--color-line)] bg-[var(--color-surface-strong)] px-3 py-2 text-xs font-semibold text-[var(--color-ink)] shadow-[0_8px_18px_rgba(15,23,42,0.04)]"
                            >
                              {stop.stop_order}. {stop.station?.code || stop.station?.name || "Station"}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-3 text-sm text-[var(--color-muted)]">
                          Add the full route after creating the train so schedule generation and booking paths are accurate.
                        </p>
                      )}

                      {!routeStops.length ? (
                        <div className="mt-4">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setSelectedRouteTrainId(train.id);
                              setEditingStop(null);
                              setRouteFormError("");
                              routeEditorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                            }}
                          >
                            Add route stops
                          </Button>
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setEditingTrain(train);
                          setFormError("");
                        }}
                        >
                          Edit train
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setSelectedRouteTrainId(train.id);
                            setEditingStop(null);
                            setRouteFormError("");
                            routeEditorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                          }}
                        >
                          Manage route
                        </Button>
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={() =>
                          setDeleteTarget({
                            type: "train",
                            id: train.id,
                            label: train.name || train.train_number,
                          })
                        }
                      >
                        Delete train
                      </Button>
                    </div>
                  </Card>
                )})}
              </div>
            ) : null}

            {trains.length === 0 && trainsStatus !== "loading" ? (
              <EmptyState
                title="No trains found"
              />
            ) : null}

            {trains.length > 0 ? (
              <div className="pt-6">
                <PaginationToolbar
                  page={trainsMeta.page}
                  perPage={trainsMeta.perPage}
                  totalCount={trainsMeta.totalCount || trains.length}
                  totalPages={trainsMeta.totalPages}
                  onPageChange={setPage}
                  onPerPageChange={setPerPage}
                  disabled={trainsStatus === "loading"}
                  loading={trainsStatus === "loading"}
                />
              </div>
            ) : null}
          </PageSection>

          <PageSection className="p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-[var(--color-ink)]">
              {editingTrain ? "Edit train" : "Add train"}
            </h2>
            <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">
              Maintain the train catalog with the same fields the backend already expects: number, name, service type, rating, grade, and active state.
            </p>

            <form className="mt-6 space-y-4" onSubmit={handleSave} key={editingTrain?.id || "new"}>
              <Input
                name="train_number"
                label="Train number"
                defaultValue={editingTrain?.train_number || ""}
                placeholder="e.g. 12431"
                maxLength={20}
                onChange={(event) => {
                  event.target.value = String(event.target.value || "").replace(/[^\w-]/g, "").slice(0, 20);
                }}
                required
              />

              <Input
                name="name"
                label="Train name"
                defaultValue={editingTrain?.name || ""}
                placeholder="e.g. Rajdhani Express"
                maxLength={100}
                onChange={(event) => {
                  event.target.value = String(event.target.value || "").trimStart();
                }}
                required
              />

              <div>
                <label className="field-label">Train type</label>
                <select
                  name="train_type"
                  defaultValue={editingTrain?.train_type || "express"}
                  className="field-input"
                >
                  {TRAIN_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  name="rating"
                  label="Rating"
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  defaultValue={editingTrain?.rating || 4.5}
                  required
                />
                <Input
                  name="grade"
                  label="Grade"
                  defaultValue={editingTrain?.grade || "Standard"}
                  maxLength={50}
                  onChange={(event) => {
                    event.target.value = String(event.target.value || "").trimStart();
                  }}
                  required
                />
              </div>

              <label className="flex items-center gap-3 rounded-[1.2rem] border border-[var(--color-line)] bg-[var(--color-surface-soft)] px-4 py-3">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  defaultChecked={editingTrain?.is_active ?? true}
                  className="h-5 w-5 rounded-md border-[var(--color-line)] text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                />
                <span className="text-sm font-medium text-[var(--color-ink)]">Service active</span>
              </label>

              <AdminErrorBox message={formError} />

              <div className="flex flex-col gap-3 pt-2">
                <Button type="submit" className="w-full" disabled={trainsStatus === "loading"}>
                  {editingTrain ? "Update train" : "Create train"}
                </Button>
                {editingTrain ? (
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full"
                    onClick={() => {
                      setEditingTrain(null);
                      setFormError("");
                    }}
                  >
                    Cancel edit
                  </Button>
                ) : null}
              </div>
            </form>
          </PageSection>
        </div>

        <div ref={routeEditorRef} className="grid gap-6 lg:grid-cols-[1.12fr_0.88fr]">
          <PageSection className="p-6 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-[var(--color-ink)]">Full route editor</h2>
                <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">
                  Every train should have its stop order, station, full arrival/departure date-time, and distance from origin configured here before schedules are managed.
                </p>
              </div>
              <div className="min-w-[14rem]">
                <label className="field-label">Selected train</label>
                <select
                  value={selectedTrainId}
                  onChange={(event) => {
                    setSelectedRouteTrainId(event.target.value);
                    setEditingStop(null);
                    setRouteFormError("");
                  }}
                  className="field-input"
                >
                  {availableTrains.map((train) => (
                    <option key={train.id} value={train.id}>
                      {train.train_number} - {train.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {trainStopsStatus === "loading" && trainStops.length === 0 ? <LoadingState label="Loading route stops..." /> : null}
            <AdminErrorBox message={Array.isArray(trainStopsError) ? trainStopsError.join(", ") : trainStopsError} />

            {selectedRouteTrain ? (
              <div className="mt-5 space-y-4">
                {selectedTrainStops.length ? (
                  selectedTrainStops.map((stop) => (
                    <Card key={stop.id} className="rounded-[1.4rem] p-4">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <p className="text-base font-semibold text-[var(--color-ink)]">
                            Stop {stop.stop_order} • {stop.station?.name || "Station"}
                          </p>
                          <p className="mt-1 text-sm text-[var(--color-muted)]">
                            {stop.station?.code || "Code unavailable"} • {stop.station?.city?.name || "City unavailable"}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <AdminInfoPill label={`${Number(stop.distance_from_origin_km || 0)} km`} />
                          <AdminInfoPill label={`Arr ${formatStopDateTimeLabel(stop.arrival_at || stop.arrival_time)}`} variant="neutral" />
                          <AdminInfoPill label={`Dep ${formatStopDateTimeLabel(stop.departure_at || stop.departure_time)}`} variant="success" />
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-3">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setEditingStop(stop);
                            setRouteFormError("");
                          }}
                        >
                          Edit stop
                        </Button>
                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          onClick={() =>
                            setDeleteTarget({
                              type: "stop",
                              id: stop.id,
                              label: stop.station?.name || `Stop ${stop.stop_order}`,
                            })
                          }
                        >
                          Remove stop
                        </Button>
                      </div>
                    </Card>
                  ))
                ) : (
                  <EmptyState
                    title="No route stops configured yet"
                    description="Add the origin, intermediate stops, and destination in order. This route data is what makes search, journey timing, and daily schedule creation reliable."
                  />
                )}
              </div>
            ) : null}
          </PageSection>

          <PageSection className="p-6 sm:p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <Card tone="muted" className="rounded-[1.4rem] p-4 shadow-none">
                <p className="text-sm font-semibold text-[var(--color-ink)]">Add city</p>
                <p className="mt-1 text-sm text-[var(--color-muted)]">
                  Create missing cities directly from the route workflow.
                </p>
                <form className="mt-4 space-y-3" onSubmit={handleCityCreate}>
                  <Input
                    name="name"
                    label="City name"
                    placeholder="e.g. Vijayawada"
                    maxLength={100}
                    onChange={(event) => {
                      event.target.value = String(event.target.value || "").trimStart();
                    }}
                    required
                  />
                  <Input
                    name="state"
                    label="State"
                    placeholder="e.g. Andhra Pradesh"
                    maxLength={100}
                    onChange={(event) => {
                      event.target.value = String(event.target.value || "").trimStart();
                    }}
                    required
                  />
                  <Input
                    name="country"
                    label="Country"
                    placeholder="e.g. India"
                    defaultValue="India"
                    maxLength={100}
                    onChange={(event) => {
                      event.target.value = String(event.target.value || "").trimStart();
                    }}
                    required
                  />
                  <AdminErrorBox message={cityFormError} />
                  <Button type="submit" variant="secondary" className="w-full" disabled={citiesStatus === "loading"}>
                    Add city
                  </Button>
                  {citiesError ? <p className="field-error">{Array.isArray(citiesError) ? citiesError.join(", ") : citiesError}</p> : null}
                </form>
              </Card>

              <Card tone="muted" className="rounded-[1.4rem] p-4 shadow-none">
                <p className="text-sm font-semibold text-[var(--color-ink)]">Add station</p>
                <p className="mt-1 text-sm text-[var(--color-muted)]">
                  Create a station here and use it immediately in the stop list below.
                </p>
                <form className="mt-4 space-y-3" onSubmit={handleStationCreate}>
                  <div>
                    <label className="field-label">City</label>
                    <select name="city_id" className="field-input" required disabled={citiesStatus === "loading"}>
                      <option value="">Select city</option>
                      {cities.map((city) => (
                        <option key={city.id} value={city.id}>
                          {city.name}, {city.state || city.country}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Input
                    name="name"
                    label="Station name"
                    placeholder="e.g. Vijayawada Junction"
                    maxLength={100}
                    onChange={(event) => {
                      event.target.value = String(event.target.value || "").trimStart();
                    }}
                    required
                  />
                  <Input
                    name="code"
                    label="Station code"
                    placeholder="e.g. BZA"
                    maxLength={20}
                    onChange={(event) => {
                      event.target.value = String(event.target.value || "").replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 20);
                    }}
                    required
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input name="latitude" label="Latitude" placeholder="Optional" type="number" step="0.000001" min="-90" max="90" />
                    <Input name="longitude" label="Longitude" placeholder="Optional" type="number" step="0.000001" min="-180" max="180" />
                  </div>
                  <AdminErrorBox message={stationFormError} />
                  <Button type="submit" variant="secondary" className="w-full" disabled={stationsStatus === "loading"}>
                    Add station
                  </Button>
                  {stationsError ? <p className="field-error">{Array.isArray(stationsError) ? stationsError.join(", ") : stationsError}</p> : null}
                </form>
              </Card>
            </div>

            <div className="mt-6 border-t border-[var(--color-line)] pt-6">
            <h2 className="text-xl font-semibold text-[var(--color-ink)]">
              {editingStop ? "Edit route stop" : "Add route stop"}
            </h2>
            <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">
              Define the full train path in sequence. Use full stop date-time values in `dd/mm/yyyy hh:mm` style so long-distance trains spanning 1+ days are represented correctly.
            </p>

            <form className="mt-6 space-y-4" onSubmit={handleRouteSave} key={editingStop?.id || `${selectedTrainId}-new-stop`}>
              <div>
                <label className="field-label">Train</label>
                <select
                  name="train_id"
                  defaultValue={editingStop?.train_id || selectedTrainId}
                  className="field-input"
                  required
                >
                  {availableTrains.map((train) => (
                    <option key={train.id} value={train.id}>
                      {train.train_number} - {train.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="field-label">Station</label>
                <select
                  name="station_id"
                  defaultValue={editingStop?.station_id || ""}
                  className="field-input"
                  required
                  disabled={stationsStatus === "loading"}
                >
                  <option value="">Select station</option>
                  {stations.map((station) => (
                    <option key={station.id} value={station.id}>
                      {station.code} - {station.name}
                    </option>
                  ))}
                </select>
                {stationsStatus === "loading" ? <p className="field-hint">Loading station options...</p> : null}
                {stationsError ? (
                  <p className="field-error">
                    {Array.isArray(stationsError) ? stationsError.join(", ") : stationsError}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  name="stop_order"
                  label="Stop order"
                  type="number"
                  min="1"
                  step="1"
                  defaultValue={editingStop?.stop_order || selectedTrainStops.length + 1}
                  required
                />
                <Input
                  name="distance_from_origin_km"
                  label="Distance from origin (km)"
                  type="number"
                  min="0"
                  step="0.1"
                  defaultValue={editingStop?.distance_from_origin_km || 0}
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  name="arrival_at"
                  label="Arrival date & time"
                  type="datetime-local"
                  defaultValue={extractDateTimeLocalValue(editingStop?.arrival_at || editingStop?.arrival_time)}
                />
                <Input
                  name="departure_at"
                  label="Departure date & time"
                  type="datetime-local"
                  defaultValue={extractDateTimeLocalValue(editingStop?.departure_at || editingStop?.departure_time)}
                />
              </div>

              <AdminErrorBox message={routeFormError} />

              <div className="flex flex-col gap-3 pt-2">
                <Button type="submit" className="w-full" disabled={trainStopsStatus === "loading"}>
                  {editingStop ? "Update route stop" : "Add route stop"}
                </Button>
                {editingStop ? (
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full"
                    onClick={() => {
                      setEditingStop(null);
                      setRouteFormError("");
                    }}
                  >
                    Cancel edit
                  </Button>
                ) : null}
              </div>
            </form>
            </div>
          </PageSection>
        </div>
      </div>

      <AdminConfirmDialog
        open={Boolean(deleteTarget)}
        title={deleteTarget?.type === "stop" ? "Remove route stop" : "Delete train"}
        description={
          deleteTarget?.type === "stop"
            ? `Remove ${deleteTarget?.label || "this stop"} from the route?`
            : `Delete ${deleteTarget?.label || "this train"}? This action cannot be undone.`
        }
        confirmLabel={deleteTarget?.type === "stop" ? "Remove stop" : "Delete train"}
        busy={trainsStatus === "loading" || trainStopsStatus === "loading"}
        onClose={() => setDeleteTarget(null)}
        onConfirm={deleteTarget?.type === "stop" ? handleDeleteStop : handleDeleteTrain}
      />
    </main>
  );
}

function isSameTrainPayload(currentTrain, nextTrain) {
  return (
    String(currentTrain?.train_number || "") === String(nextTrain.train_number || "") &&
    String(currentTrain?.name || "") === String(nextTrain.name || "") &&
    String(currentTrain?.train_type || "") === String(nextTrain.train_type || "") &&
    String(currentTrain?.rating || "") === String(nextTrain.rating || "") &&
    String(currentTrain?.grade || "") === String(nextTrain.grade || "") &&
    Boolean(currentTrain?.is_active) === Boolean(nextTrain.is_active)
  );
}

function isSameTrainStopPayload(currentStop, nextStop) {
  return (
    String(currentStop?.train_id || currentStop?.train?.id || "") === String(nextStop.train_id || "") &&
    String(currentStop?.station_id || currentStop?.station?.id || "") === String(nextStop.station_id || "") &&
    String(currentStop?.stop_order || "") === String(nextStop.stop_order || "") &&
    extractDateTimeLocalValue(currentStop?.arrival_at || currentStop?.arrival_time) === String(nextStop.arrival_at || "") &&
    extractDateTimeLocalValue(currentStop?.departure_at || currentStop?.departure_time) === String(nextStop.departure_at || "") &&
    String(currentStop?.distance_from_origin_km || "") === String(nextStop.distance_from_origin_km || "")
  );
}

function formatTrainType(value) {
  if (!value) {
    return "Service";
  }

  return value
    .split("_")
    .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
    .join(" ");
}

function extractTimeValue(value) {
  if (!value) {
    return "";
  }

  const stringValue = String(value);
  const match = stringValue.match(/(\d{2}:\d{2})/);
  return match ? match[1] : "";
}

function extractDateTimeLocalValue(value) {
  if (!value) {
    return "";
  }

  const stringValue = String(value);
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(stringValue)) {
    return stringValue.slice(0, 16);
  }

  if (/^\d{2}:\d{2}/.test(stringValue)) {
    return `2000-01-01T${stringValue.slice(0, 5)}`;
  }

  const parsed = new Date(stringValue);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  const hours = String(parsed.getHours()).padStart(2, "0");
  const minutes = String(parsed.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function formatStopDateTimeLabel(value) {
  const normalized = extractDateTimeLocalValue(value);
  if (!normalized) {
    return "--/--/---- --:--";
  }

  const [datePart, timePart] = normalized.split("T");
  const [year, month, day] = datePart.split("-");
  return `${day}/${month}/${year} ${timePart}`;
}
