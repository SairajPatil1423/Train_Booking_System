"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PageHero from "@/components/layout/page-hero";
import PageSection from "@/components/layout/page-section";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import EmptyState from "@/components/ui/empty-state";
import Input from "@/components/ui/input";
import LoadingState from "@/components/loading-state";
import PaginationToolbar from "@/components/ui/pagination-toolbar";
import { ADMIN_COACH_CONFIGS } from "@/utils/admin-coach-config";
import { formatCoachType, normalizeCoachType } from "@/utils/coach-formatters";
import {
  createAdminCoachThunk,
  deleteAdminCoachThunk,
  fetchAdminTrainCatalogThunk,
  fetchAdminCoachesThunk,
  updateAdminCoachThunk,
} from "@/features/admin/adminSlice";
import {
  AdminErrorBox,
  AdminInfoBlock,
  AdminInfoPill,
  CoachLayoutPreview,
} from "@/components/admin/admin-ui";
import AdminConfirmDialog from "@/components/admin/admin-confirm-dialog";
import { usePaginatedRouteState } from "@/hooks/use-paginated-route-state";
import { formatErrorMessage } from "@/utils/errors";
import { toastError, toastInfo, toastSuccess } from "@/utils/toast";

export default function AdminCoachesPage() {
  const dispatch = useDispatch();
  const { coaches, coachesMeta, trainCatalog, trainCatalogStatus, trainCatalogError, resources } = useSelector((state) => state.admin);
  const coachesStatus = resources.coaches.status;
  const coachesError = resources.coaches.error;
  const [editingCoach, setEditingCoach] = useState(null);
  const [formError, setFormError] = useState("");
  const [coachToDelete, setCoachToDelete] = useState(null);
  const { currentPage, currentPerPage, setPage, setPerPage } = usePaginatedRouteState({
    totalPages: coachesMeta.totalPages,
    status: coachesStatus,
  });

  useEffect(() => {
    dispatch(fetchAdminCoachesThunk({ page: currentPage, perPage: currentPerPage }));
    dispatch(fetchAdminTrainCatalogThunk());
  }, [currentPage, currentPerPage, dispatch]);

  const coachLayouts = useMemo(
    () => Object.fromEntries(ADMIN_COACH_CONFIGS.map((item) => [item.key, item])),
    [],
  );

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const coachData = {
      train_id: formData.get("train_id"),
      coach_number: formData.get("coach_number"),
      coach_type: formData.get("coach_type"),
    };

    try {
      if (editingCoach) {
        if (isSameCoachPayload(editingCoach, coachData)) {
          setFormError("No changes to save.");
          toastInfo("No changes to save.", "Nothing updated");
          return;
        }

        await dispatch(updateAdminCoachThunk({ id: editingCoach.id, coachData })).unwrap();
        toastSuccess("Coach updated successfully.");
      } else {
        await dispatch(createAdminCoachThunk(coachData)).unwrap();
        toastSuccess("Coach created successfully.");
      }

      setFormError("");
      setEditingCoach(null);
      form.reset();
    } catch (requestError) {
      const message = formatErrorMessage(requestError);
      setFormError(message);
      toastError(message, "Coach action failed");
    }
  }

  async function handleDeleteCoach() {
    if (!coachToDelete) {
      return;
    }

    setFormError("");

    try {
      await dispatch(deleteAdminCoachThunk(coachToDelete.id)).unwrap();
      setFormError("");
      setCoachToDelete(null);
      toastSuccess("Coach deleted successfully.");
    } catch (requestError) {
      const message = formatErrorMessage(requestError);
      setFormError(message);
      toastError(message, "Coach deletion failed");
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10 sm:px-10 lg:px-12">
      <div className="space-y-6">
        <PageHero
          eyebrow="Coach management"
          title="Coaches"
          meta={[`${coachesMeta.totalCount || coaches.length} coaches`, `Page ${coachesMeta.page}`]}
        />

        <PageSection className="p-6 sm:p-8">
          <div className="grid gap-4 xl:grid-cols-3">
            {ADMIN_COACH_CONFIGS.map((coach) => (
              <CoachLayoutPreview key={coach.key} coach={coach} compact />
            ))}
          </div>
        </PageSection>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <PageSection className="p-6 sm:p-8">
            {coachesStatus === "loading" && coaches.length === 0 ? <LoadingState label="Loading coaches..." /> : null}
            {coachesStatus === "loading" && coaches.length > 0 ? (
              <div className="pb-4 text-sm font-medium text-[var(--color-muted)]">Loading page {currentPage}...</div>
            ) : null}
            <AdminErrorBox message={Array.isArray(coachesError) ? coachesError.join(", ") : coachesError} />

            {coaches.length > 0 ? (
              <div className="space-y-4">
                {coaches.map((coach) => {
                  const normalizedCoachType = normalizeCoachType(coach.coach_type);
                  const layout = coachLayouts[normalizedCoachType];

                  return (
                    <Card key={coach.id} className="rounded-[1.6rem] p-5">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <p className="text-lg font-semibold text-[var(--color-ink)]">
                            {coach.train?.train_number || "Train"} • {coach.coach_number}
                          </p>
                          <p className="mt-1 text-sm text-[var(--color-muted)]">
                            {coach.train?.name || "Linked train information will appear here after sync."}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <AdminInfoPill label={formatCoachType(normalizedCoachType)} />
                          <AdminInfoPill label={`${coach.total_seats} seats`} variant="success" />
                          {layout ? <AdminInfoPill label={`${layout.rows} x ${layout.columns}`} variant="neutral" /> : null}
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <AdminInfoBlock label="Pattern" value={layout?.pattern || "Fixed layout"} />
                        <AdminInfoBlock label="Generated seats" value={String(coach.seats?.length || 0)} accent />
                        <AdminInfoBlock label="Manual seats" value="Disabled" />
                      </div>

                      {layout ? <div className="mt-4"><CoachLayoutPreview coach={layout} compact /></div> : null}

                      <div className="mt-5 flex flex-wrap gap-3">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setEditingCoach(coach);
                            setFormError("");
                          }}
                        >
                          Edit coach
                        </Button>
                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          onClick={() => setCoachToDelete(coach)}
                        >
                          Delete coach
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : null}

            {coaches.length === 0 && coachesStatus !== "loading" ? (
              <EmptyState
                title="No coaches configured yet"
              />
            ) : null}

            {coaches.length > 0 ? (
              <div className="pt-6">
                <PaginationToolbar
                  page={coachesMeta.page}
                  perPage={coachesMeta.perPage}
                  totalCount={coachesMeta.totalCount || coaches.length}
                  totalPages={coachesMeta.totalPages}
                  onPageChange={setPage}
                  onPerPageChange={setPerPage}
                  disabled={coachesStatus === "loading"}
                  loading={coachesStatus === "loading"}
                />
              </div>
            ) : null}
          </PageSection>

          <PageSection className="p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-[var(--color-ink)]">
              {editingCoach ? "Edit coach" : "Create coach"}
            </h2>
            <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">
              Choose a train, coach number, and one of the fixed coach types. Row count, columns, and seats are generated from the shared coach configuration.
            </p>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit} key={editingCoach?.id || "new"}>
              <div>
                <label className="field-label">Train</label>
                <select
                  name="train_id"
                  defaultValue={editingCoach?.train_id || ""}
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
                {trainCatalogStatus === "loading" ? (
                  <p className="field-hint">Loading train options...</p>
                ) : null}
                {trainCatalogError ? (
                  <p className="field-error">
                    {Array.isArray(trainCatalogError) ? trainCatalogError.join(", ") : trainCatalogError}
                  </p>
                ) : null}
              </div>

              <Input
                name="coach_number"
                label="Coach number"
                defaultValue={editingCoach?.coach_number || ""}
                placeholder="e.g. S1 or H1"
                required
              />

              <div>
                <label className="field-label">Coach type</label>
                <select
                  name="coach_type"
                  defaultValue={normalizeCoachType(editingCoach?.coach_type) || "sleeper"}
                  className="field-input"
                  required
                >
                  {ADMIN_COACH_CONFIGS.map((coach) => (
                    <option key={coach.key} value={coach.key}>
                      {coach.label} • {coach.totalSeats} seats • {coach.pattern}
                    </option>
                  ))}
                </select>
              </div>

              <AdminErrorBox message={formError} />

              <div className="flex flex-col gap-3 pt-2">
                <Button type="submit" className="w-full" disabled={coachesStatus === "loading"}>
                  {editingCoach ? "Update coach" : "Create coach"}
                </Button>
                {editingCoach ? (
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full"
                    onClick={() => {
                      setEditingCoach(null);
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
        open={Boolean(coachToDelete)}
        title="Delete coach"
        description={`Delete ${coachToDelete?.coach_number || "this coach"}? This action cannot be undone.`}
        confirmLabel="Delete coach"
        busy={coachesStatus === "loading"}
        onClose={() => setCoachToDelete(null)}
        onConfirm={handleDeleteCoach}
      />
    </main>
  );
}

function isSameCoachPayload(currentCoach, nextCoach) {
  return (
    String(currentCoach?.train_id || currentCoach?.train?.id || "") === String(nextCoach.train_id || "") &&
    String(currentCoach?.coach_number || "") === String(nextCoach.coach_number || "") &&
    normalizeCoachType(currentCoach?.coach_type) === normalizeCoachType(nextCoach.coach_type)
  );
}
