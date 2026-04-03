"use client";

import { useEffect } from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import { store } from "@/store";
import {
  clearCredentials,
  expireSession,
  hydrateAuth,
} from "@/features/auth/authSlice";
import {
  clearAuthState,
  readAuthState,
  writeAuthState,
} from "@/utils/authStorage";
import ToastViewport from "@/components/toast-viewport";
import { toastError } from "@/utils/toast";

function AuthBootstrap({ children }) {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);

  useEffect(() => {
    const persistedAuth = readAuthState();
    dispatch(hydrateAuth(persistedAuth));
  }, [dispatch]);

  useEffect(() => {
    if (!authState.hydrated) {
      return;
    }

    writeAuthState({
      token: authState.token,
      user: authState.user,
    });
  }, [authState.hydrated, authState.token, authState.user]);

  useEffect(() => {
    const handleUnauthorized = (event) => {
      const backendMessage = event?.detail?.message || "";
      const isExpiredMessage = backendMessage.toLowerCase().includes("expired");

      clearAuthState();
      if (isExpiredMessage) {
        dispatch(expireSession("Your session expired. Please sign in again to continue booking."));
        toastError("Your session expired. Please sign in again to continue.");
        return;
      }

      dispatch(clearCredentials());
      toastError("You were signed out. Please log in again.");
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);

    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, [dispatch]);

  return children;
}

export default function Providers({ children }) {
  return (
    <Provider store={store}>
      <AuthBootstrap>
        {children}
        <ToastViewport />
      </AuthBootstrap>
    </Provider>
  );
}
