"use client";

import { useEffect } from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import { store } from "@/store";
import {
  clearCredentials,
  hydrateAuth,
} from "@/features/auth/authSlice";
import {
  clearAuthState,
  readAuthState,
  writeAuthState,
} from "@/utils/authStorage";

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
    const handleUnauthorized = () => {
      clearAuthState();
      dispatch(clearCredentials());
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
      <AuthBootstrap>{children}</AuthBootstrap>
    </Provider>
  );
}
