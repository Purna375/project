import ThemeToggle from "@/components/ThemeToggle";
import ProjectDetails from "./projectform";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function Home() {
  return (
    <ProtectedRoute>
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-black dark:text-white">
         <ThemeToggle /> 
      <ProjectDetails/>
    </div>
    </ProtectedRoute>
  );
}
