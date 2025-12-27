"use client";
import React from "react";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <header className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 shadow-md">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
        CampusBazar
      </h1>
      <ThemeToggle />
    </header>
  );
}
