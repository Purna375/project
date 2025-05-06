"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";

export default function AuthForm() {
  const [tab, setTab] = useState("login");
  const isLogin = tab === "login";

  return (
    <div className="w-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg min-h-[400px]">
      <Toaster position="top-right" />
      <div className="flex justify-between mb-4">
        <button
          onClick={() => setTab("login")}
          className={`w-1/2 py-2 ${isLogin ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-500 dark:text-gray-400"}`}
        >
          Login
        </button>
        <button
          onClick={() => setTab("register")}
          className={`w-1/2 py-2 ${!isLogin ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-500 dark:text-gray-400"}`}
        >
          Register
        </button>
      </div>

      {isLogin ? <LoginForm /> : <RegisterForm />}
    </div>
  );
}

function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const local_uri = "http://localhost:8000";

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${local_uri}/api/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Login failed");
        return;
      }

      const { token, user, hasProjects } = data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      toast.success("Login successful!");

      if (hasProjects) {
        router.push("/dashboard");
      } else {
        router.push("/studentdetails");
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4 mt-16" onSubmit={handleLogin}>
      <input
        type="email"
        placeholder="Email"
        className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button
        type="submit"
        disabled={loading}
        className={`w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 flex justify-center items-center ${
          loading ? "opacity-70 cursor-not-allowed" : ""
        }`}
      >
        {loading ? (
          <>
            <LoadingSpinner size="sm" />
            <span className="ml-2">Logging in...</span>
          </>
        ) : (
          "Login"
        )}
      </button>
    </form>
  );
}

function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [showOtpFields, setShowOtpFields] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const local_uri = "http://localhost:8000";

  useEffect(() => {
    let interval;
    if (otpTimer > 0) {
      interval = setInterval(() => setOtpTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  const handleOtpChange = (value, index) => {
    if (/^\d?$/.test(value)) {
      const updatedOtp = [...otp];
      updatedOtp[index] = value;
      setOtp(updatedOtp);
      if (value && index < 5) {
        document.getElementById(`otp-${index + 1}`)?.focus();
      }
    }
  };

  const handleGetOtp = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (!email || !password) {
      toast.error("Please fill all required fields.");
      return;
    }

    setOtpLoading(true);
    try {
      const response = await fetch(`${local_uri}/api/users/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
        }),
      });
      const data = await response.json();

      if (response.ok) {
        setShowOtpFields(true);
        setOtpTimer(30);
        toast.success("OTP sent to your email");
      } else if (response.status === 400) {
        toast.error(data.message || "Failed to send OTP");
      } else if (response.status === 500) {
        toast.error("Internal Server Error! Try again later");
      } else {
        toast.error("Something went wrong! Try again");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast.error("Failed to connect to server. Check your internet connection.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    const fullOtp = otp.join("");
    if (fullOtp.length < 6) {
      toast.error("Enter complete 6-digit OTP.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${local_uri}/api/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, otp: fullOtp }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        toast.success("Registration successful!");
        
        const newUser = data.user;
        if (newUser.is_verified) {
          router.push("/studentdetails");
        }
      } else if (res.status === 400) {
        toast.error(data.error || "Invalid OTP");
      } else {
        toast.error("Registration failed. Please try again.");
      }
    } catch (err) {
      toast.error("Internal Server Error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    email &&
    password &&
    confirmPassword &&
    password === confirmPassword &&
    (showOtpFields ? otp.every((digit) => digit !== "") : true);

  return (
    <form className="space-y-4" onSubmit={handleRegister}>
      <input
        type="email"
        placeholder="Email"
        className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={loading || showOtpFields}
      />
      <input
        type="password"
        placeholder="Password"
        className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        disabled={loading || showOtpFields}
      />
      <input
        type="password"
        placeholder="Confirm Password"
        className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
        disabled={loading || showOtpFields}
      />

      {showOtpFields && (
        <div className="space-y-2">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Enter the 6-digit OTP sent to your email
          </p>
          <div className="flex justify-between space-x-2">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                id={`otp-${idx}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(e.target.value, idx)}
                className="w-12 h-12 text-center text-lg border rounded dark:bg-gray-700 dark:text-white"
                disabled={loading}
              />
            ))}
          </div>
        </div>
      )}

      {otpTimer > 0 ? (
        <button
          type="button"
          disabled
          className="w-full bg-gray-400 text-white py-2 rounded cursor-not-allowed"
        >
          Resend OTP in {otpTimer}s
        </button>
      ) : (
        <button
          type="button"
          onClick={handleGetOtp}
          disabled={otpLoading || !email || !password || password !== confirmPassword}
          className={`w-full py-2 rounded flex justify-center items-center ${
            otpLoading || !email || !password || password !== confirmPassword
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-yellow-500 hover:bg-yellow-600 text-white"
          }`}
        >
          {otpLoading ? (
            <>
              <LoadingSpinner size="sm" />
              <span className="ml-2">{showOtpFields ? "Resending OTP..." : "Sending OTP..."}</span>
            </>
          ) : (
            <>{showOtpFields ? "Resend OTP" : "Get OTP"}</>
          )}
        </button>
      )}

      {showOtpFields && (
        <button
          type="submit"
          disabled={!isFormValid || loading}
          className={`w-full py-2 rounded flex justify-center items-center ${
            isFormValid && !loading
              ? "bg-green-500 hover:bg-green-600 text-white"
              : "bg-gray-400 text-white cursor-not-allowed"
          }`}
        >
          {loading ? (
            <>
              <LoadingSpinner size="sm" />
              <span className="ml-2">Registering...</span>
            </>
          ) : (
            "Register"
          )}
        </button>
      )}
    </form>
  );
}

// Reusable loading spinner component
function LoadingSpinner({ size = "md" }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div className={`animate-spin rounded-full border-t-2 border-b-2 border-white ${sizeClasses[size]}`}></div>
  );
}