"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import PageHero from "@/components/layout/page-hero";
import PageSection from "@/components/layout/page-section";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import EmptyState from "@/components/ui/empty-state";
import Input from "@/components/ui/input";
import LoadingState from "@/components/loading-state";
import PaginationToolbar from "@/components/ui/pagination-toolbar";
import SearchPagination from "@/components/ui/search-pagination";
import { ADMIN_COACH_CONFIGS } from "@/utils/admin-coach-config";
import { formatCoachType, normalizeCoachType } from "@/utils/coach-formatters";
import {
  createAdminCoachThunk,
  deleteAdminCoachThunk,
  fetchAdminTrainCatalogThunk,
  fetchAdminCoachesThunk,
  updateAdminCoachThunk,
  searchAdminCoachesThunk,
  clearCoachesSearch,
} from "@/features/admin/adminSlice";
import { coachSchema, coachSearchSchema } from "@/features/admin/schemas";
import { sanitizeUsernameInput } from "@/features/validation/constants";
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
  const { coaches, coachesMeta, coachesSearch, trainCatalog, trainCatalogStatus, trainCatalogError, resources } = useSelector((state) => state.admin);
  const coachesStatus = resources.coaches.status;
  const coachesError = resources.coaches.error;
  const [editingCoach, setEditingCoach] = useState(null);
  const [formError, setFormError] = useState("");
  const [coachToDelete, setCoachToDelete] = useState(null);
  const [searchPage, setSearchPage] = useState(1);

  const isSearchMode = coachesSearch.status === "succeeded" || coachesSearch.status === "loading";
  const displayRecords = isSearchMode ? (Array.isArray(coachesSearch.results) ? coachesSearch.results.filter(Boolean) : []) : (Array.isArray(coaches) ? coaches.filter(Boolean) : []);
  const displayMeta = isSearchMode ? coachesSearch.meta : coachesMeta;

  const {
    register: registerSearch,
    handleSubmit: handleSearchSubmit,
    reset: resetSearch,
    formState: { errors: searchErrors },
  } = useForm({ resolver: zodResolver(coachSearchSchema), defaultValues: { train_name: "", train_number: "", coach_type: "" } });

  const { currentPage, currentPerPage, setPage, setPerPage } = usePaginatedRouteState({
    totalPages: coachesMeta.totalPages,
    status: coachesStatus,
  });

  useEffect(() => {
    dispatch(fetchAdminCoachesThunk({ page: currentPage, perPage: currentPerPage }));
    dispatch(fetchAdminTrainCatalogThunk());
  }, [currentPage, currentPerPage, dispatch]);

  function onSearch(data) {
    const params = Object.fromEntries(Object.entries(data).filter(([, v]) => v && v.length > 0));
    setSearchPage(1);
    dispatch(searchAdminCoachesThunk({ ...params, page: 1, perPage: 10 }));
  }

  function onSearchPageChange(nextPage) {
    setSearchPage(nextPage);
    dispatch(searchAdminCoachesThunk({ ...coachesSearch.searchParams, page: nextPage, perPage: 10 }));
  }

  function handleClearSearch() {
    resetSearch();
    dispatch(clearCoachesSearch());
  }

  const coachLayouts = useMemo(
    () => Object.fromEntries(ADMIN_COACH_CONFIGS.map((item) => [item.key, item])),
    [],
  );
  const safeCoaches = Array.isArray(coaches) ? coaches.filter(Boolean) : [];

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const coachData = {
      train_id: String(formData.get("train_id") || "").trim(),
      coach_number: String(formData.get("coach_number") || "").trim().toUpperCase(),
      coach_type: String(formData.get("coach_type") || "").trim(),
    };

    const parsedCoach = coachSchema.safeParse(coachData);
    if (!parsedCoach.success) {
      const message = parsedCoach.error.issues[0]?.message || "Enter valid coach details.";
      setFormError(message);
      toastError(message, "Coach action failed");
      return;
    }

    try {
      if (editingCoach) {
        if (isSameCoachPayload(editingCoach, parsedCoach.data)) {
          setFormError("No changes to save.");
          toastInfo("No changes to save.", "Nothing updated");
          return;
        }

        await dispatch(updateAdminCoachThunk({ id: editingCoach.id, coachData: parsedCoach.data })).unwrap();
        toastSuccess("Coach updated successfully.");
      } else {
        await dispatch(createAdminCoachThunk(parsedCoach.data)).unwrap();
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
          meta={[
            isSearchMode
              ? `${displayMeta.totalCount ?? displayRecords.length} results`
              : `${coachesMeta.totalCount || coaches.length} coaches`,
          ]}
        />

        <PageSection className="p-6 sm:p-8">
          <div className="grid gap-4 xl:grid-cols-3">
            {ADMIN_COACH_CONFIGS.map((coach) => (
              <CoachLayoutPreview key={coach.key} coach={coach} compact />
            ))}
          </div>
        </PageSection>

        {/* ── Search panel ── */}
        <PageSection className="p-6 sm:p-8">
          <div className="mb-5 border-b border-[var(--color-line)] pb-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">Search coaches</p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-[var(--color-ink)]">Find by train or coach type</h2>
          </div>
          <form id="coach-search-form" onSubmit={handleSearchSubmit(onSearch)} className="flex flex-col gap-4 sm:flex-row sm:items-end sm:flex-wrap">
            <Input id="coach-search-train-name" label="Train name" placeholder="e.g. Rajdhani" {...registerSearch("train_name")} />
            <Input id="coach-search-train-number" label="Train number" placeholder="e.g. 12431" {...registerSearch("train_number")} />
            <div>
              <label className="field-label" htmlFor="coach-search-type">Coach type</label>
              <select id="coach-search-type" className="field-input" {...registerSearch("coach_type")}>
                <option value="">Any type</option>
                {ADMIN_COACH_CONFIGS.map((c) => (<option key={c.key} value={c.key}>{c.label}</option>))}
              </select>
            </div>
            <div className="flex gap-3">
              <Button id="coach-search-submit" type="submit" disabled={coachesSearch.status === "loading"} className="shrink-0">
                {coachesSearch.status === "loading" ? "Searching…" : "Search"}
              </Button>
              {isSearchMode ? (
                <Button id="coach-search-clear" type="button" variant="secondary" onClick={handleClearSearch} className="shrink-0">Clear</Button>
              ) : null}
            </div>
          </form>
          {searchErrors[""] ? <AdminErrorBox message={searchErrors[""]?.message} className="mt-4" /> : null}
          {coachesSearch.error ? <AdminErrorBox message={Array.isArray(coachesSearch.error) ? coachesSearch.error.join(", ") : coachesSearch.error} className="mt-4" /> : null}
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
              disabled={isSearchMode ? coachesSearch.status === "loading" : coachesStatus === "loading"}
              loading={isSearchMode ? coachesSearch.status === "loading" : coachesStatus === "loading"}
            />
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <PageSection className="p-6 sm:p-8">
            {!isSearchMode && coachesStatus === "loading" && coaches.length === 0 ? <LoadingState label="Loading coaches..." /> : null}
            {isSearchMode && coachesSearch.status === "loading" ? <LoadingState label="Searching coaches…" /> : null}
            {!isSearchMode ? <AdminErrorBox message={Array.isArray(coachesError) ? coachesError.join(", ") : coachesError} /> : null}

            {displayRecords.length > 0 && coachesSearch.status !== "loading" ? (
              <div className="space-y-4">
                {displayRecords.map((coach) => {
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

                      {!isSearchMode ? (
                        <div className="mt-5 flex flex-wrap gap-3">
                          <Button type="button" variant="secondary" size="sm" onClick={() => { setEditingCoach(coach); setFormError(""); }}>Edit coach</Button>
                          <Button type="button" variant="danger" size="sm" onClick={() => setCoachToDelete(coach)}>Delete coach</Button>
                        </div>
                      ) : null}
                    </Card>
                  );
                })}
              </div>
            ) : null}

            {isSearchMode && coachesSearch.status === "succeeded" && displayRecords.length === 0 ? (
              <EmptyState title="No coaches found" description="Try different search terms." />
            ) : null}
            {!isSearchMode && displayRecords.length === 0 && coachesStatus !== "loading" ? (
              <EmptyState title="No coaches configured yet" />
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
                maxLength={10}
                onChange={(event) => {
                  event.target.value = sanitizeUsernameInput(event.target.value).toUpperCase().slice(0, 10);
                }}
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
