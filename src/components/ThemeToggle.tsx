"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("helpex_theme") as "light" | "dark" | null;
    if (savedTheme === "dark") {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("helpex_theme", nextTheme);

    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800" />
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 dark:bg-stone-900 dark:hover:bg-stone-800 dark:text-amber-400 border border-stone-200 dark:border-stone-800 transition-all flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-amber-500/50"
      title={`Switch to ${theme === "light" ? "Dark" : "Light"} mode`}
    >
      {theme === "light" ? (
        <Moon className="w-4 h-4 text-stone-700 hover:text-stone-900 transition-transform hover:-rotate-12" />
      ) : (
        <Sun className="w-4 h-4 text-amber-400 hover:text-amber-300 transition-transform hover:rotate-45" />
      )}
    </button>
  );
}
