"use client";

import { Children, cloneElement, createContext, useContext, useMemo, useState } from "react";
import { cn } from "@/utils/cn";

const TabsContext = createContext(null);

export function Tabs({ defaultValue, value, onValueChange, className = "", children }) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const currentValue = value ?? internalValue;

  const contextValue = useMemo(
    () => ({
      value: currentValue,
      setValue: onValueChange || setInternalValue,
    }),
    [currentValue, onValueChange],
  );

  return (
    <TabsContext.Provider value={contextValue}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className = "", children }) {
  return <div className={cn("ui-tabs", className)}>{children}</div>;
}

export function TabsTrigger({ value, className = "", children }) {
  const context = useContext(TabsContext);
  const isActive = context?.value === value;

  return (
    <button
      type="button"
      data-state={isActive ? "active" : "inactive"}
      className={cn("ui-tab-trigger", className)}
      onClick={() => context?.setValue(value)}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, className = "", children }) {
  const context = useContext(TabsContext);

  if (context?.value !== value) {
    return null;
  }

  return <div className={className}>{children}</div>;
}
