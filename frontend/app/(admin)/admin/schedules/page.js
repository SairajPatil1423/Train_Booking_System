"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PageHero from "@/components/layout/page-hero";
import PageSection from "@/components/layout/page-section";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import EmptyState from "@/components/ui/empty-state";
import Input from "@/components/ui/input";
import Badge from "@/components/ui/badge";
import LoadingState from "@/components/loading-state";
import PaginationToolbar from "@/components/ui/pagination-toolbar";
import {
  createAdminScheduleThunk,
  deleteAdminScheduleThunk,
  fetchAdminTrainCatalogThunk,
  fetchAdminSchedulesThunk,
  updateAdminScheduleThunk,
} from "@/features/admin/adminSlice";
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
  const { schedules, schedulesMeta, trainCatalog, trainCatalogStatus, trainCatalogError, resources } = useSelector((state) => state.admin);
  const schedulesStatus = resources.schedules.status;
  const schedulesError = resources.schedules.error;
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [formError, setFormError] = useState("");
  const [scheduleToDelete, setScheduleToDelete] = useState(null);
  const { currentPage, currentPerPage, setPage, setPerPage } = usePaginatedRouteState({
    totalPages: schedulesMeta.totalPages,
    status: schedulesStatus,
  });

  useEffect(() => {
    dispatch(fetchAdminSchedulesThunk({ page: currentPage, perPage: currentPerPage }));
    dispatch(fetchAdminTrainCatalogThunk());
  }, [currentPage, currentPerPage, dispatch]);

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      if (editingSchedule) {
        const scheduleData = {
          departure_time: formData.get("departure_time"),
          expected_arrival_time: formData.get("expected_arrival_time"),
          status: formData.get("status"),
          delay_minutes: formData.get("delay_minutes"),
        };

        if (isSameSchedulePayload(editingSchedule, scheduleData)) {
          setFormError("No changes to save.");
          toastInfo("No changes to save.", "Nothing updated");
          return;
        }

        await dispatch(updateAdminScheduleThunk({ id: editingSchedule.id, scheduleData })).unwrap();
        toastSuccess("Schedule updated successfully.");
      } else {
        const scheduleData = {
          train_id: formData.get("train_id"),
          travel_date: formData.get("travel_date"),
          departure_time: formData.get("departure_time"),
          expected_arrival_time: formData.get("expected_arrival_time"),
        };

        await dispatch(createAdminScheduleThunk(scheduleData)).unwrap();
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
          meta={[`${schedulesMeta.totalCount || schedules.length} schedules`, `Page ${schedulesMeta.page}`]}
        />

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <PageSection className="p-6 sm:p-8">
            {schedulesStatus === "loading" && schedules.length === 0 ? <LoadingState label="Loading schedules..." /> : null}
            {schedulesStatus === "loading" && schedules.length > 0 ? (
              <div className="pb-4 text-sm font-medium text-[var(--color-muted)]">Loading page {currentPage}...</div>
            ) : null}
            <AdminErrorBox message={Array.isArray(schedulesError) ? schedulesError.join(", ") : schedulesError} />

            {schedules.length > 0 ? null : null}

            {schedules.length > 0 ? (
              <div className="space-y-4">
                {schedules.map((schedule) => {
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

                      <div className="mt-5 flex flex-wrap gap-3">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setEditingSchedule(schedule);
                            setFormError("");
                          }}
                        >
                          Edit schedule
                        </Button>
                        <Button type="button" variant="danger" size="sm" onClick={() => setScheduleToDelete(schedule)}>
                          Delete schedule
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : null}

            {schedules.length === 0 && schedulesStatus !== "loading" ? (
              <EmptyState
                title="No schedules created yet"
              />
            ) : null}

            {schedules.length > 0 ? (
              <div className="pt-6">
                <PaginationToolbar
                  page={schedulesMeta.page}
                  perPage={schedulesMeta.perPage}
                  totalCount={schedulesMeta.totalCount || schedules.length}
                  totalPages={schedulesMeta.totalPages}
                  onPageChange={setPage}
                  onPerPageChange={setPerPage}
                  disabled={schedulesStatus === "loading"}
                  loading={schedulesStatus === "loading"}
                />
              </div>
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
