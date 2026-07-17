"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps as NextThemesProviderProps } from "next-themes";
import { Toaster } from "sonner";

export interface ThemeProviderProps extends NextThemesProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      {children}
      <Toaster
        closeButton
        richColors
        position="top-right"
        toastOptions={{
          className: "text-sm font-medium",
        }}
      />
    </NextThemesProvider>
  );
}
