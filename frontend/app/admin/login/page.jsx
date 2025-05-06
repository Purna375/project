"use client";

import ThemeToggle from "@/components/ThemeToggle";
import React from "react";
import AdminLoginComponent from "./AdminLogin";

function AdminLoginPage() {
  return (
    <div className="min-h-screen w-screen bg-gray-100 dark:bg-gray-900 text-black dark:text-white">
      <AdminLoginComponent />
    </div>
  );
}

export default AdminLoginPage;