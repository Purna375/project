"use client"; // This makes it a Client Component

import { ThemeProvider } from "next-themes";

export default function ThemeClientProvider({ children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  );
}
