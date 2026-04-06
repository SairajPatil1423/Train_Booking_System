import axios from "axios";
import { readAuthState } from "@/utils/authStorage";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const requestUrl = String(config.url || "");
    const isAuthBootstrapRequest =
      requestUrl === "/users/sign_in" ||
      requestUrl === "/users";

    const authState = readAuthState();
    const token = authState?.token;

    if (token && !isAuthBootstrapRequest) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined" && error?.response?.status === 401) {
      const backendMessage =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        "";

      window.dispatchEvent(
        new CustomEvent("auth:unauthorized", {
          detail: {
            message: backendMessage,
          },
        }),
      );
    }

    return Promise.reject(error);
  },
);

export default api;
