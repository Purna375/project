"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminDashboard from "./admindashboard";
import AdminLogin from "./login/AdminLogin";

function AdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    setIsAuthenticated(!!token);
  }, []);

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    router.push("/admin/login");
    return null;
  }

  return (
    <div className="min-h-screen w-screen bg-gray-100 dark:bg-gray-900 text-black dark:text-white">
      <AdminDashboard />
    </div>
  );
}

export default AdminPage;