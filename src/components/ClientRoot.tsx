"use client";

import React, { useEffect, useState, ReactNode } from "react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ClientLayout from "@/components/ClientLayout";
import i18n from "@/utils/i18n";

export default function ClientRoot({ children }: { children: ReactNode }) {
  const [, setLang] = useState("en");
  const [, setDir] = useState<"ltr" | "rtl">("ltr");

  useEffect(() => {
    const currentLang =
      i18n.language || localStorage.getItem("language") || "en";
    const isRTL = currentLang === "ar";
    setLang(currentLang);
    setDir(isRTL ? "rtl" : "ltr");

    document.documentElement.lang = currentLang;
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
  }, []);

  return (
    <div className="font-roboto bg-light-background text-light-onBackground dark:bg-dark-background dark:text-dark-onBackground">
      <ThemeProvider>
        <ClientLayout>{children}</ClientLayout>
      </ThemeProvider>
    </div>
  );
}
