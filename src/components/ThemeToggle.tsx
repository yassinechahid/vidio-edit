"use client";

import React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 rounded-xl hover:bg-light-primaryContainer/40 dark:hover:bg-dark-primaryContainer/40 transition-colors duration-200 flex items-center justify-center"
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? (
        <Moon className="w-5 h-5 text-light-onSurface dark:text-dark-onSurface" />
      ) : (
        <Sun className="w-5 h-5 text-light-onSurface dark:text-dark-onSurface" />
      )}
    </button>
  );
};

export default ThemeToggle;
