"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PageHero from "@/components/layout/page-hero";
import PageSection from "@/components/layout/page-section";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import EmptyState from "@/components/ui/empty-state";
import Input from "@/components/ui/input";
import { formatCoachType } from "@/utils/coach-formatters";
import { ADMIN_COACH_CONFIGS } from "@/utils/admin-coach-config";
import LoadingState from "@/components/loading-state";
import {
  createAdminFareRuleThunk,
  deleteAdminFareRuleThunk,
  fetchAdminFareRulesThunk,
  fetchAdminTrainsThunk,
  updateAdminFareRuleThunk,
} from "@/features/admin/adminSlice";
import { AdminErrorBox, AdminInfoBlock, AdminInfoPill } from "@/components/admin/admin-ui";
import { toastError, toastInfo, toastSuccess } from "@/utils/toast";

export default function AdminFaresPage() {
  const dispatch = useDispatch();
  const { fareRules, trains, resources } = useSelector((state) => state.admin);
  const fareRulesStatus = resources.fareRules.status;
  const fareRulesError = resources.fareRules.error;
  const trainsStatus = resources.trains.status;
  const trainsError = resources.trains.error;
  const [editingRule, setEditingRule] = useState(null);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    dispatch(fetchAdminFareRulesThunk());
    if (trainsStatus === "idle") {
      dispatch(fetchAdminTrainsThunk());
    }
  }, [dispatch, trainsStatus]);

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");

    const formData = new FormData(event.currentTarget);
    const fareRuleData = {
      train_id: formData.get("train_id"),
      coach_type: formData.get("coach_type"),
      base_fare_per_km: formData.get("base_fare_per_km"),
      dynamic_multiplier: formData.get("dynamic_multiplier"),
      valid_from: formData.get("valid_from"),
      valid_to: formData.get("valid_to"),
    };

    try {
      if (editingRule) {
        if (isSameFareRulePayload(editingRule, fareRuleData)) {
          setFormError("No changes to save.");
          toastInfo("No changes to save.", "Nothing updated");
          return;
        }

        await dispatch(updateAdminFareRuleThunk({ id: editingRule.id, fareRuleData })).unwrap();
        toastSuccess("Fare rule updated successfully.");
      } else {
        await dispatch(createAdminFareRuleThunk(fareRuleData)).unwrap();
        toastSuccess("Fare rule created successfully.");
      }

      setEditingRule(null);
      event.currentTarget.reset();
    } catch (requestError) {
      const message = Array.isArray(requestError) ? requestError.join(", ") : String(requestError);
      setFormError(message);
      toastError(message, "Fare rule action failed");
    }
  }

  async function handleDelete(id) {
    setFormError("");

    if (!window.confirm("Delete this fare rule?")) {
      return;
    }

    try {
      await dispatch(deleteAdminFareRuleThunk(id)).unwrap();
      toastSuccess("Fare rule deleted successfully.");
    } catch (requestError) {
      const message = Array.isArray(requestError) ? requestError.join(", ") : String(requestError);
      setFormError(message);
      toastError(message, "Fare rule deletion failed");
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10 sm:px-10 lg:px-12">
      <div className="space-y-6">
        <PageHero
          eyebrow="Fare rules"
          title="Price fixed coach types with clean operational rules"
          description="Fare rules now follow the same deterministic coach model as coach creation and seat rendering. Only 1AC, 2AC, and Sleeper are supported."
          meta={["No legacy coach labels", "Date-range aware", "Booking-aligned pricing"]}
        />

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <PageSection className="p-6 sm:p-8">
            {fareRulesStatus === "loading" && fareRules.length === 0 ? <LoadingState label="Loading fare rules..." /> : null}
            <AdminErrorBox message={Array.isArray(fareRulesError) ? fareRulesError.join(", ") : fareRulesError} />

            {fareRules.length > 0 ? (
              <div className="space-y-4">
                {fareRules.map((rule) => (
                  <Card key={rule.id} className="rounded-[1.6rem] p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <p className="text-lg font-semibold text-[var(--color-ink)]">
                          {rule.train?.train_number || "Train"} • {formatCoachType(rule.coach_type)}
                        </p>
                        <p className="mt-1 text-sm text-[var(--color-muted)]">
                          {rule.train?.name || "Train details will appear here after sync."}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <AdminInfoPill label={`₹${Number(rule.base_fare_per_km).toFixed(2)}/km`} />
                        <AdminInfoPill label={`x${Number(rule.dynamic_multiplier).toFixed(2)}`} variant="success" />
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <AdminInfoBlock label="Valid from" value={String(rule.valid_from)} />
                      <AdminInfoBlock label="Valid to" value={String(rule.valid_to)} />
                      <AdminInfoBlock label="Coach type" value={formatCoachType(rule.coach_type)} accent />
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setEditingRule(rule);
                          setFormError("");
                        }}
                      >
                        Edit fare rule
                      </Button>
                      <Button type="button" variant="danger" size="sm" onClick={() => handleDelete(rule.id)}>
                        Delete rule
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : null}

            {fareRules.length === 0 && fareRulesStatus !== "loading" ? (
              <EmptyState
                title="No fare rules configured yet"
                description="Create pricing rules for 1AC, 2AC, or Sleeper so search results and bookings can price each coach deterministically."
              />
            ) : null}
          </PageSection>

          <PageSection className="p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-[var(--color-ink)]">
              {editingRule ? "Edit fare rule" : "Create fare rule"}
            </h2>
            <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">
              Fare rules must use one of the supported coach types so pricing stays aligned with generated seats and booking selection.
            </p>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit} key={editingRule?.id || "new"}>
              <div>
                <label className="field-label">Train</label>
                <select
                  name="train_id"
                  defaultValue={editingRule?.train_id || ""}
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
                {trainsStatus === "loading" ? <p className="field-hint">Loading train options...</p> : null}
                {trainsError ? (
                  <p className="field-error">
                    {Array.isArray(trainsError) ? trainsError.join(", ") : trainsError}
                  </p>
                ) : null}
              </div>

              <div>
                <label className="field-label">Coach type</label>
                <select
                  name="coach_type"
                  defaultValue={editingRule?.coach_type || "sleeper"}
                  className="field-input"
                  required
                >
                  {ADMIN_COACH_CONFIGS.map((coach) => (
                    <option key={coach.key} value={coach.key}>
                      {coach.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  name="base_fare_per_km"
                  label="Base fare per km"
                  type="number"
                  step="0.01"
                  min="0.01"
                  defaultValue={editingRule?.base_fare_per_km || ""}
                  required
                />
                <Input
                  name="dynamic_multiplier"
                  label="Dynamic multiplier"
                  type="number"
                  step="0.01"
                  min="1"
                  defaultValue={editingRule?.dynamic_multiplier || "1"}
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  name="valid_from"
                  label="Valid from"
                  type="date"
                  defaultValue={editingRule?.valid_from || ""}
                  required
                />
                <Input
                  name="valid_to"
                  label="Valid to"
                  type="date"
                  defaultValue={editingRule?.valid_to || ""}
                  required
                />
              </div>

              <AdminErrorBox message={formError} />

              <div className="flex flex-col gap-3 pt-2">
                <Button type="submit" className="w-full" disabled={fareRulesStatus === "loading"}>
                  {editingRule ? "Update fare rule" : "Create fare rule"}
                </Button>
                {editingRule ? (
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full"
                    onClick={() => {
                      setEditingRule(null);
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

function isSameFareRulePayload(currentRule, nextRule) {
  return (
    String(currentRule?.train_id || currentRule?.train?.id || "") === String(nextRule.train_id || "") &&
    String(currentRule?.coach_type || "") === String(nextRule.coach_type || "") &&
    String(currentRule?.base_fare_per_km || "") === String(nextRule.base_fare_per_km || "") &&
    String(currentRule?.dynamic_multiplier || "") === String(nextRule.dynamic_multiplier || "") &&
    String(currentRule?.valid_from || "") === String(nextRule.valid_from || "") &&
    String(currentRule?.valid_to || "") === String(nextRule.valid_to || "")
  );
}
