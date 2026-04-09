"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PageHero from "@/components/layout/page-hero";
import PageSection from "@/components/layout/page-section";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { AdminErrorBox } from "@/components/admin/admin-ui";
import { adminUserSchema } from "@/features/admin/schemas";
import { createAdminUserThunk } from "@/features/admin/adminSlice";
import {
  sanitizeNameInput,
  sanitizePhoneInput,
  sanitizeUsernameInput,
} from "@/features/validation/constants";
import { toastError, toastSuccess } from "@/utils/toast";

const initialForm = {
  email: "",
  full_name: "",
  username: "",
  phone: "",
  address: "",
  password: "",
  password_confirmation: "",
};

export default function AdminUsersPage() {
  const dispatch = useDispatch();
  const usersError = useSelector((state) => state.admin.resources.users.error);
  const [formData, setFormData] = useState(initialForm);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function updateField(key, value) {
    setFormData((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");
    setSubmitting(true);

    const parsedAdminUser = adminUserSchema.safeParse(formData);
    if (!parsedAdminUser.success) {
      const message = parsedAdminUser.error.issues[0]?.message || "Enter valid administrator details.";
      setFormError(message);
      setSubmitting(false);
      toastError(message, "Admin creation failed");
      return;
    }

    try {
      await dispatch(createAdminUserThunk(parsedAdminUser.data)).unwrap();
      setFormError("");
      toastSuccess("Administrator created successfully.");
      setFormData(initialForm);
    } catch (requestError) {
      const message = Array.isArray(requestError) ? requestError.join(", ") : String(requestError);
      setFormError(message);
      toastError(message, "Admin creation failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-10 sm:px-10 lg:px-12">
      <div className="space-y-6">
        <PageHero
          eyebrow="Admin management"
          title="Create a new administrator"
          description="Use this form to provision another admin account for operational access."
          meta={["Admin only", "Creates a new administrator account", "Requires email, full name, username, and password"]}
        />

        <PageSection className="p-6 sm:p-8">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Full name"
                value={formData.full_name}
                onChange={(event) => updateField("full_name", sanitizeNameInput(event.target.value))}
                required
              />
              <Input
                label="Username"
                value={formData.username}
                onChange={(event) => updateField("username", sanitizeUsernameInput(event.target.value))}
                required
              />
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(event) => updateField("email", event.target.value)}
                required
              />
              <Input
                label="Phone"
                value={formData.phone}
                onChange={(event) => updateField("phone", sanitizePhoneInput(event.target.value))}
                required
              />
            </div>

              <Input
                label="Address"
                value={formData.address}
                onChange={(event) => updateField("address", event.target.value.trimStart())}
                required
              />

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Password"
                type="password"
                value={formData.password}
                onChange={(event) => updateField("password", event.target.value)}
                required
              />
              <Input
                label="Confirm password"
                type="password"
                value={formData.password_confirmation}
                onChange={(event) => updateField("password_confirmation", event.target.value)}
                required
              />
            </div>

            <AdminErrorBox message={formError || (Array.isArray(usersError) ? usersError.join(", ") : usersError)} />

            <div className="pt-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Creating admin..." : "Create admin"}
              </Button>
            </div>
          </form>
        </PageSection>
      </div>
    </main>
  );
}
