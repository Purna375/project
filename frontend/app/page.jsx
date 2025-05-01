import ThemeToggle from "../components/ThemeToggle";
import AuthForm from "../components/AuthForm";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-black dark:text-white relative">
      <ThemeToggle /> 
      <AuthForm /> 
    </div>
  );
}
