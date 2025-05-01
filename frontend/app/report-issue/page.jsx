
import ThemeToggle from "@/components/ThemeToggle";
import ReportIssue from "./reportform";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function Home() {
  return (
    <ProtectedRoute>
          <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-black dark:text-white relative">
      <ThemeToggle /> 
      <ReportIssue/>
    </div>
    </ProtectedRoute>

  );
}
