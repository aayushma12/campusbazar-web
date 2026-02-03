"use client";
import React from 'react';

//sidebar
export default function Sidebar() {
  return (
    <aside className="w-64 bg-white dark:bg-gray-800 p-4 shadow-lg flex flex-col">
      <h2 className="text-xl font-bold mb-6">Dashboard</h2>
      <nav className="flex flex-col gap-2">
        <a href="#" className="px-3 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700">Overview</a>
        <a href="#" className="px-3 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700">Profile</a>
        <a href="#" className="px-3 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700">Settings</a>
      </nav>
    </aside>
  );
}
