"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import PageHero from "@/components/layout/page-hero";
import PageSection from "@/components/layout/page-section";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import EmptyState from "@/components/ui/empty-state";
import Input from "@/components/ui/input";
import Badge from "@/components/ui/badge";
import LoadingState from "@/components/loading-state";
import PaginationToolbar from "@/components/ui/pagination-toolbar";
import SearchPagination from "@/components/ui/search-pagination";
import {
  createAdminScheduleThunk,
  deleteAdminScheduleThunk,
  fetchAdminTrainCatalogThunk,
  fetchAdminSchedulesThunk,
  updateAdminScheduleThunk,
  searchAdminSchedulesThunk,
  clearSchedulesSearch,
} from "@/features/admin/adminSlice";
import {
  createScheduleSchema,
  updateScheduleSchema,
  scheduleSearchSchema,
} from "@/features/admin/schemas";
import AdminConfirmDialog from "@/components/admin/admin-confirm-dialog";
import { AdminErrorBox, AdminInfoBlock, AdminInfoPill } from "@/components/admin/admin-ui";
import { usePaginatedRouteState } from "@/hooks/use-paginated-route-state";
import { formatErrorMessage } from "@/utils/errors";
import { toastError, toastInfo, toastSuccess } from "@/utils/toast";

const SCHEDULE_STATUS_OPTIONS = [
  { value: "scheduled", label: "Scheduled", variant: "primary" },
  { value: "departed", label: "Departed", variant: "warning" },
  { value: "completed", label: "Completed", variant: "success" },
  { value: "cancelled", label: "Cancelled", variant: "danger" },
];

export default function AdminSchedulesPage() {
  const dispatch = useDispatch();
  const { schedules, schedulesMeta, schedulesSearch, trainCatalog, trainCatalogStatus, trainCatalogError, resources } = useSelector((state) => state.admin);
  const schedulesStatus = resources.schedules.status;
  const schedulesError = resources.schedules.error;
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [formError, setFormError] = useState("");
  const [scheduleToDelete, setScheduleToDelete] = useState(null);
  const [searchPage, setSearchPage] = useState(1);

  const isSearchMode = schedulesSearch.status === "succeeded" || schedulesSearch.status === "loading";
  const displayRecords = isSearchMode ? schedulesSearch.results : schedules;
  const displayMeta = isSearchMode ? schedulesSearch.meta : schedulesMeta;

  const {
    register: registerSearch,
    handleSubmit: handleSearchSubmit,
    reset: resetSearch,
    formState: { errors: searchErrors },
  } = useForm({ resolver: zodResolver(scheduleSearchSchema), defaultValues: { train_name: "", travel_date: "" } });

  const { currentPage, currentPerPage, setPage, setPerPage } = usePaginatedRouteState({
    totalPages: schedulesMeta.totalPages,
    status: schedulesStatus,
  });

  useEffect(() => {
    dispatch(fetchAdminSchedulesThunk({ page: currentPage, perPage: currentPerPage }));
    dispatch(fetchAdminTrainCatalogThunk());
  }, [currentPage, currentPerPage, dispatch]);

  function onSearch(data) {
    setSearchPage(1);
    dispatch(searchAdminSchedulesThunk({ ...data, page: 1, perPage: 10 }));
  }

  function onSearchPageChange(nextPage) {
    setSearchPage(nextPage);
    dispatch(searchAdminSchedulesThunk({ ...schedulesSearch.searchParams, page: nextPage, perPage: 10 }));
  }

  function handleClearSearch() {
    resetSearch();
    dispatch(clearSchedulesSearch());
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      if (editingSchedule) {
        const scheduleData = {
          departure_time: String(formData.get("departure_time") || "").trim(),
          expected_arrival_time: String(formData.get("expected_arrival_time") || "").trim(),
          status: String(formData.get("status") || "").trim(),
          delay_minutes: String(formData.get("delay_minutes") || "").trim(),
        };

        const parsedSchedule = updateScheduleSchema.safeParse(scheduleData);
        if (!parsedSchedule.success) {
          const message = parsedSchedule.error.issues[0]?.message || "Enter valid schedule details.";
          setFormError(message);
          toastError(message, "Schedule action failed");
          return;
        }

        if (isSameSchedulePayload(editingSchedule, parsedSchedule.data)) {
          setFormError("No changes to save.");
          toastInfo("No changes to save.", "Nothing updated");
          return;
        }

        await dispatch(updateAdminScheduleThunk({ id: editingSchedule.id, scheduleData: parsedSchedule.data })).unwrap();
        toastSuccess("Schedule updated successfully.");
      } else {
        const scheduleData = {
          train_id: String(formData.get("train_id") || "").trim(),
          travel_date: String(formData.get("travel_date") || "").trim(),
          departure_time: String(formData.get("departure_time") || "").trim(),
          expected_arrival_time: String(formData.get("expected_arrival_time") || "").trim(),
        };

        const parsedSchedule = createScheduleSchema.safeParse(scheduleData);
        if (!parsedSchedule.success) {
          const message = parsedSchedule.error.issues[0]?.message || "Enter valid schedule details.";
          setFormError(message);
          toastError(message, "Schedule action failed");
          return;
        }

        await dispatch(createAdminScheduleThunk(parsedSchedule.data)).unwrap();
        toastSuccess("Schedule created successfully.");
      }

      setFormError("");
      setEditingSchedule(null);
      form.reset();
    } catch (requestError) {
      const message = formatErrorMessage(requestError);
      setFormError(message);
      toastError(message, "Schedule action failed");
    }
  }

  async function handleDeleteSchedule() {
    if (!scheduleToDelete) {
      return;
    }

    setFormError("");

    try {
      await dispatch(deleteAdminScheduleThunk(scheduleToDelete.id)).unwrap();
      setFormError("");
      setScheduleToDelete(null);
      toastSuccess("Schedule deleted successfully.");
    } catch (requestError) {
      const message = formatErrorMessage(requestError);
      setFormError(message);
      toastError(message, "Schedule deletion failed");
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10 sm:px-10 lg:px-12">
      <div className="space-y-6">
        <PageHero
          eyebrow="Schedules"
          title="Schedules"
          meta={[
            isSearchMode
              ? `${displayMeta.totalCount ?? displayRecords.length} results`
              : `${schedulesMeta.totalCount || schedules.length} schedules`,
          ]}
        />

        {/* ── Search panel ── */}
        <PageSection className="p-6 sm:p-8">
          <div className="mb-5 border-b border-[var(--color-line)] pb-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">Search schedules</p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-[var(--color-ink)]">Find by train or date</h2>
          </div>
          <form id="schedule-search-form" onSubmit={handleSearchSubmit(onSearch)} className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <Input
              id="schedule-search-train-name"
              label="Train name"
              placeholder="e.g. Rajdhani"
              error={searchErrors.train_name?.message || (!searchErrors.train_name && searchErrors[""]) ? searchErrors[""]?.message : undefined}
              {...registerSearch("train_name")}
            />
            <Input
              id="schedule-search-date"
              label="Travel date"
              type="date"
              error={searchErrors.travel_date?.message}
              {...registerSearch("travel_date")}
            />
            <div className="flex gap-3">
              <Button id="schedule-search-submit" type="submit" disabled={schedulesSearch.status === "loading"} className="shrink-0">
                {schedulesSearch.status === "loading" ? "Searching…" : "Search"}
              </Button>
              {isSearchMode ? (
                <Button id="schedule-search-clear" type="button" variant="secondary" onClick={handleClearSearch} className="shrink-0">Clear</Button>
              ) : null}
            </div>
          </form>
          {searchErrors[""] ? <AdminErrorBox message={searchErrors[""]?.message} className="mt-4" /> : null}
          {schedulesSearch.error ? <AdminErrorBox message={Array.isArray(schedulesSearch.error) ? schedulesSearch.error.join(", ") : schedulesSearch.error} className="mt-4" /> : null}
        </PageSection>

        {/* ── Pagination strip — always between search form and results — */}
        {displayRecords.length > 0 ? (
          <div className="rounded-[1.4rem] border border-[var(--color-line)] bg-[var(--color-panel-strong)] px-6 py-4 shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
            <SearchPagination
              page={displayMeta.page ?? 1}
              totalPages={displayMeta.totalPages ?? 1}
              totalCount={displayMeta.totalCount ?? displayRecords.length}
              onPrev={() => isSearchMode
                ? onSearchPageChange((displayMeta.page ?? 1) - 1)
                : setPage((displayMeta.page ?? 1) - 1)}
              onNext={() => isSearchMode
                ? onSearchPageChange((displayMeta.page ?? 1) + 1)
                : setPage((displayMeta.page ?? 1) + 1)}
              disabled={isSearchMode ? schedulesSearch.status === "loading" : schedulesStatus === "loading"}
              loading={isSearchMode ? schedulesSearch.status === "loading" : schedulesStatus === "loading"}
            />
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <PageSection className="p-6 sm:p-8">
            {!isSearchMode && schedulesStatus === "loading" && schedules.length === 0 ? <LoadingState label="Loading schedules..." /> : null}
            {isSearchMode && schedulesSearch.status === "loading" ? <LoadingState label="Searching schedules…" /> : null}
            {!isSearchMode ? <AdminErrorBox message={Array.isArray(schedulesError) ? schedulesError.join(", ") : schedulesError} /> : null}

            {displayRecords.length > 0 && schedulesSearch.status !== "loading" ? (
              <div className="space-y-4">
                {displayRecords.map((schedule) => {
                  const statusConfig = SCHEDULE_STATUS_OPTIONS.find((item) => item.value === schedule.status);

                  return (
                    <Card key={schedule.id} className="rounded-[1.6rem] p-5">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <p className="text-lg font-semibold text-[var(--color-ink)]">
                            {schedule.train?.train_number || "Train"} • {schedule.train?.name || "Daily service"}
                          </p>
                          <p className="mt-1 text-sm text-[var(--color-muted)]">
                            Travel date {formatDateLabel(schedule.travel_date)}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Badge variant={statusConfig?.variant || "neutral"} className="px-4 py-2 text-xs sm:text-sm">
                            {statusConfig?.label || schedule.status}
                          </Badge>
                          <AdminInfoPill label={formatTimeLabel(schedule.departure_time)} />
                          <AdminInfoPill label={formatTimeLabel(schedule.expected_arrival_time)} variant="success" />
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-4">
                        <AdminInfoBlock label="Departure" value={formatTimeLabel(schedule.departure_time)} />
                        <AdminInfoBlock label="Expected arrival" value={formatTimeLabel(schedule.expected_arrival_time)} />
                        <AdminInfoBlock label="Delay" value={`${Number(schedule.delay_minutes || 0)} min`} />
                        <AdminInfoBlock label="Status" value={statusConfig?.label || schedule.status} accent />
                      </div>

                      {!isSearchMode ? (
                        <div className="mt-5 flex flex-wrap gap-3">
                          <Button type="button" variant="secondary" size="sm" onClick={() => { setEditingSchedule(schedule); setFormError(""); }}>Edit schedule</Button>
                          <Button type="button" variant="danger" size="sm" onClick={() => setScheduleToDelete(schedule)}>Delete schedule</Button>
                        </div>
                      ) : null}
                    </Card>
                  );
                })}
              </div>
            ) : null}

            {isSearchMode && schedulesSearch.status === "succeeded" && displayRecords.length === 0 ? (
              <EmptyState title="No schedules found" description="Try different search terms." />
            ) : null}
            {!isSearchMode && schedules.length === 0 && schedulesStatus !== "loading" ? (
              <EmptyState title="No schedules created yet" />
            ) : null}
          </PageSection>

          <PageSection className="p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-[var(--color-ink)]">
              {editingSchedule ? "Edit schedule" : "Create schedule"}
            </h2>
            <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">
              Create schedules with a train, travel date, and operating times. Once a schedule exists, you can update its delay and service status from this same form.
            </p>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit} key={editingSchedule?.id || "new"}>
              {!editingSchedule ? (
                <>
                  <div>
                    <label className="field-label">Train</label>
                    <select
                      name="train_id"
                      defaultValue=""
                      className="field-input"
                      required
                      disabled={trainCatalogStatus === "loading"}
                    >
                      <option value="">Select train</option>
                      {trainCatalog.map((train) => (
                        <option key={train.id} value={train.id}>
                          {train.train_number} - {train.name}
                        </option>
                      ))}
                    </select>
                    {trainCatalogStatus === "loading" ? <p className="field-hint">Loading train options...</p> : null}
                    {trainCatalogError ? (
                      <p className="field-error">
                        {Array.isArray(trainCatalogError) ? trainCatalogError.join(", ") : trainCatalogError}
                      </p>
                    ) : null}
                  </div>

                  <Input
                    name="travel_date"
                    label="Travel date"
                    type="date"
                    defaultValue=""
                    required
                  />
                </>
              ) : (
                <Card tone="muted" className="rounded-[1.4rem] p-4 shadow-none">
                  <p className="text-sm font-semibold text-[var(--color-ink)]">
                    {editingSchedule.train?.train_number || "Train"} • {editingSchedule.train?.name || "Scheduled service"}
                  </p>
                  <p className="mt-1 text-sm text-[var(--color-muted)]">
                    Travel date {formatDateLabel(editingSchedule.travel_date)}. Train and date stay locked during updates so downstream bookings remain consistent.
                  </p>
                </Card>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  name="departure_time"
                  label="Departure time"
                  type="time"
                  defaultValue={extractTimeValue(editingSchedule?.departure_time)}
                  required
                />
                <Input
                  name="expected_arrival_time"
                  label="Expected arrival time"
                  type="time"
                  defaultValue={extractTimeValue(editingSchedule?.expected_arrival_time)}
                  required
                />
              </div>

              {editingSchedule ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="field-label">Status</label>
                    <select
                      name="status"
                      defaultValue={editingSchedule.status || "scheduled"}
                      className="field-input"
                      required
                    >
                      {SCHEDULE_STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Input
                    name="delay_minutes"
                    label="Delay minutes"
                    type="number"
                    min="0"
                    step="1"
                    defaultValue={editingSchedule?.delay_minutes ?? 0}
                    required
                  />
                </div>
              ) : null}

              <AdminErrorBox message={formError} />

              <div className="flex flex-col gap-3 pt-2">
                <Button type="submit" className="w-full" disabled={schedulesStatus === "loading"}>
                  {editingSchedule ? "Update schedule" : "Create schedule"}
                </Button>
                {editingSchedule ? (
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full"
                    onClick={() => {
                      setEditingSchedule(null);
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
      </div>

      <AdminConfirmDialog
        open={Boolean(scheduleToDelete)}
        title="Delete schedule"
        description="This schedule will be removed permanently."
        confirmLabel="Delete schedule"
        busy={schedulesStatus === "loading"}
        onClose={() => setScheduleToDelete(null)}
        onConfirm={handleDeleteSchedule}
      />
    </main>
  );
}

function isSameSchedulePayload(currentSchedule, nextSchedule) {
  return (
    extractTimeValue(currentSchedule?.departure_time) === String(nextSchedule.departure_time || "") &&
    extractTimeValue(currentSchedule?.expected_arrival_time) === String(nextSchedule.expected_arrival_time || "") &&
    String(currentSchedule?.status || "") === String(nextSchedule.status || "") &&
    String(currentSchedule?.delay_minutes ?? 0) === String(nextSchedule.delay_minutes ?? "")
  );
}

function extractTimeValue(value) {
  if (!value) {
    return "";
  }

  const stringValue = String(value);
  const match = stringValue.match(/(\d{2}:\d{2})/);
  return match ? match[1] : "";
}

function formatTimeLabel(value) {
  const time = extractTimeValue(value);
  if (!time) {
    return "Time not set";
  }

  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(`1970-01-01T${time}:00`));
}

function formatDateLabel(value) {
  if (!value) {
    return "Date not set";
  }

  const parsedDate = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsedDate.getTime())) {
    return String(value);
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
