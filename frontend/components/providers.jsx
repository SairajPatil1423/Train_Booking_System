"use client";

import { createContext, useContext, useEffect, useState } from "react";
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

const ThemeContext = createContext({
  theme: "light",
  setTheme: () => {},
  toggleTheme: () => {},
});

function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    if (typeof window === "undefined") {
      return "light";
    }

    const storedTheme = window.localStorage.getItem("railyatra-theme");
    if (storedTheme) {
      return storedTheme;
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  function setTheme(nextTheme) {
    setThemeState(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem("railyatra-theme", nextTheme);
  }

  function toggleTheme() {
    setTheme(theme === "dark" ? "light" : "dark");
  }

  return <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

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
      <ThemeProvider>
        <AuthBootstrap>
          {children}
          <ToastViewport />
        </AuthBootstrap>
      </ThemeProvider>
    </Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
