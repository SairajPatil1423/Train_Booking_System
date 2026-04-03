"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createAdminTrainThunk,
  deleteAdminTrainThunk,
  fetchAdminTrainsThunk,
  updateAdminTrainThunk,
} from "@/features/admin/adminSlice";
import PageHero from "@/components/layout/page-hero";
import PageSection from "@/components/layout/page-section";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import EmptyState from "@/components/ui/empty-state";
import Input from "@/components/ui/input";
import LoadingState from "@/components/loading-state";
import Badge from "@/components/ui/badge";
import { AdminErrorBox, AdminInfoBlock, AdminInfoPill } from "@/components/admin/admin-ui";
import { toastError, toastInfo, toastSuccess } from "@/utils/toast";

const TRAIN_TYPE_OPTIONS = [
  { value: "express", label: "Express" },
  { value: "superfast", label: "Superfast" },
  { value: "passenger", label: "Passenger" },
];

export default function AdminTrainsPage() {
  const dispatch = useDispatch();
  const { trains, resources } = useSelector((state) => state.admin);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const trainsStatus = resources.trains.status;
  const trainsError = resources.trains.error;
  const [editingTrain, setEditingTrain] = useState(null);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (isAuthenticated && user?.role === "admin") {
      dispatch(fetchAdminTrainsThunk());
    }
  }, [dispatch, isAuthenticated, user]);

  async function handleSave(event) {
    event.preventDefault();
    setFormError("");

    const formData = new FormData(event.currentTarget);
    const trainData = {
      train_number: formData.get("train_number"),
      name: formData.get("name"),
      train_type: formData.get("train_type"),
      rating: formData.get("rating"),
      grade: formData.get("grade"),
      is_active: formData.get("is_active") === "on",
    };

    try {
      if (editingTrain) {
        if (isSameTrainPayload(editingTrain, trainData)) {
          setFormError("No changes to save.");
          toastInfo("No changes to save.", "Nothing updated");
          return;
        }

        await dispatch(updateAdminTrainThunk({ id: editingTrain.id, trainData })).unwrap();
        toastSuccess("Train updated successfully.");
      } else {
        await dispatch(createAdminTrainThunk(trainData)).unwrap();
        toastSuccess("Train created successfully.");
      }

      setEditingTrain(null);
      event.currentTarget.reset();
    } catch (requestError) {
      const message = Array.isArray(requestError) ? requestError.join(", ") : String(requestError);
      setFormError(message);
      toastError(message, "Train action failed");
    }
  }

  async function handleDelete(id) {
    setFormError("");

    if (!window.confirm("Are you sure you want to delete this train?")) {
      return;
    }

    try {
      await dispatch(deleteAdminTrainThunk(id)).unwrap();
      toastSuccess("Train deleted successfully.");
    } catch (requestError) {
      const message = Array.isArray(requestError) ? requestError.join(", ") : String(requestError);
      setFormError(message);
      toastError(message, "Train deletion failed");
    }
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-81px)] w-full max-w-5xl flex-1 items-center px-6 py-12 sm:px-10">
        <div className="surface-panel w-full rounded-[2rem] p-8 text-center">
          <p className="font-bold text-[var(--color-danger)]">Unauthorized Access</p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10 sm:px-10 lg:px-12">
      <div className="space-y-6">
        <PageHero
          eyebrow="Train management"
          title="Manage the active train catalog with a cleaner operations flow"
          description="Create and update trains without changing the underlying API contract. This screen keeps train metadata organized while the deterministic coach and schedule systems build on top of it."
          meta={["Modernized admin layout", "Existing payloads preserved", "Ratings and grades supported"]}
        />

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <PageSection className="p-6 sm:p-8">
            {trainsStatus === "loading" && trains.length === 0 ? <LoadingState label="Loading trains..." /> : null}
            <AdminErrorBox message={Array.isArray(trainsError) ? trainsError.join(", ") : trainsError} />

            {trains.length > 0 ? (
              <div className="space-y-4">
                {trains.map((train) => (
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
                      <Button type="button" variant="danger" size="sm" onClick={() => handleDelete(train.id)}>
                        Delete train
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : null}

            {trains.length === 0 && trainsStatus !== "loading" ? (
              <EmptyState
                title="No trains found"
                description="Add the first train record here. Existing backend logic and payload shape remain unchanged, so schedules, fares, and coach generation can build on top of it immediately."
              />
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
                required
              />

              <Input
                name="name"
                label="Train name"
                defaultValue={editingTrain?.name || ""}
                placeholder="e.g. Rajdhani Express"
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
      </div>
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

function formatTrainType(value) {
  if (!value) {
    return "Service";
  }

  return value
    .split("_")
    .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
    .join(" ");
}
