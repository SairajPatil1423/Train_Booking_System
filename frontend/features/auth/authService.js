import api from "@/services/api";

export async function registerUser(payload) {
  const response = await api.post("/users", {
    user: {
      email: payload.email,
      phone: payload.phone,
      password: payload.password,
      password_confirmation: payload.passwordConfirmation,
    },
  });

  return response.data;
}

export async function loginUser(payload) {
  const response = await api.post("/users/sign_in", {
    user: {
      email: payload.email,
      password: payload.password,
    },
  });

  return response.data;
}

export async function logoutUser() {
  const response = await api.delete("/users/sign_out");
  return response.data;
}
