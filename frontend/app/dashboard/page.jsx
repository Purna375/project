
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Dashboard from "./project";

export default function Home() {
  return (
    <ProtectedRoute>
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-black dark:text-white relative">

      <Dashboard/>
    </div>
    </ProtectedRoute>
  );
}
