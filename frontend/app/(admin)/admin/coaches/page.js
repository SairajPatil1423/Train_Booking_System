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
import { ADMIN_COACH_CONFIGS } from "@/utils/admin-coach-config";
import { formatCoachType } from "@/utils/coach-formatters";
import {
  createAdminCoachThunk,
  deleteAdminCoachThunk,
  fetchAdminCoachesThunk,
  fetchAdminTrainsThunk,
  updateAdminCoachThunk,
} from "@/features/admin/adminSlice";
import {
  AdminErrorBox,
  AdminInfoBlock,
  AdminInfoPill,
  CoachLayoutPreview,
} from "@/components/admin/admin-ui";

export default function AdminCoachesPage() {
  const dispatch = useDispatch();
  const { coaches, trains, resources } = useSelector((state) => state.admin);
  const coachesStatus = resources.coaches.status;
  const coachesError = resources.coaches.error;
  const trainsStatus = resources.trains.status;
  const trainsError = resources.trains.error;
  const [editingCoach, setEditingCoach] = useState(null);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    dispatch(fetchAdminCoachesThunk());
    if (trainsStatus === "idle") {
      dispatch(fetchAdminTrainsThunk());
    }
  }, [dispatch, trainsStatus]);

  const coachLayouts = useMemo(
    () => Object.fromEntries(ADMIN_COACH_CONFIGS.map((item) => [item.key, item])),
    [],
  );

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");

    const formData = new FormData(event.currentTarget);
    const coachData = {
      train_id: formData.get("train_id"),
      coach_number: formData.get("coach_number"),
      coach_type: formData.get("coach_type"),
    };

    try {
      if (editingCoach) {
        if (isSameCoachPayload(editingCoach, coachData)) {
          setFormError("No changes to save.");
          return;
        }

        await dispatch(updateAdminCoachThunk({ id: editingCoach.id, coachData })).unwrap();
      } else {
        await dispatch(createAdminCoachThunk(coachData)).unwrap();
      }

      setEditingCoach(null);
      event.currentTarget.reset();
    } catch (requestError) {
      setFormError(Array.isArray(requestError) ? requestError.join(", ") : String(requestError));
    }
  }

  async function handleDelete(id) {
    setFormError("");

    if (!window.confirm("Delete this coach?")) {
      return;
    }

    try {
      await dispatch(deleteAdminCoachThunk(id)).unwrap();
    } catch (requestError) {
      setFormError(Array.isArray(requestError) ? requestError.join(", ") : String(requestError));
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10 sm:px-10 lg:px-12">
      <div className="space-y-6">
        <PageHero
          eyebrow="Coach management"
          title="Manage fixed coach layouts with confidence"
          description="Admins only choose the coach type and coach number. Seats are generated automatically using the fixed row-by-column layout, so manual seat entry is intentionally unavailable."
          meta={["1AC / 2AC / Sleeper only", "Seat generation is deterministic", "No custom seat counts"]}
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
            <AdminErrorBox message={Array.isArray(coachesError) ? coachesError.join(", ") : coachesError} />

            {coaches.length > 0 ? (
              <div className="space-y-4">
                {coaches.map((coach) => {
                  const layout = coachLayouts[coach.coach_type];

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
                          <AdminInfoPill label={formatCoachType(coach.coach_type)} />
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
                          onClick={() => handleDelete(coach.id)}
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
                description="Create a coach from the fixed layout system and the app will generate its seats automatically. Custom layouts and manual seat entry are no longer part of the workflow."
              />
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
                  disabled={trainsStatus === "loading"}
                >
                  <option value="">Select train</option>
                  {trains.map((train) => (
                    <option key={train.id} value={train.id}>
                      {train.train_number} - {train.name}
                    </option>
                  ))}
                </select>
                {trainsStatus === "loading" ? (
                  <p className="field-hint">Loading train options...</p>
                ) : null}
                {trainsError ? (
                  <p className="field-error">
                    {Array.isArray(trainsError) ? trainsError.join(", ") : trainsError}
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
                  defaultValue={editingCoach?.coach_type || "sleeper"}
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
    </main>
  );
}

function isSameCoachPayload(currentCoach, nextCoach) {
  return (
    String(currentCoach?.train_id || currentCoach?.train?.id || "") === String(nextCoach.train_id || "") &&
    String(currentCoach?.coach_number || "") === String(nextCoach.coach_number || "") &&
    String(currentCoach?.coach_type || "") === String(nextCoach.coach_type || "")
  );
}
