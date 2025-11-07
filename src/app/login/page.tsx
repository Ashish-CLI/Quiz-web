"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LoginBg from "@/components/login-bg1";
import Image from "next/image";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e:FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed");
        return;
      }


      // Redirect to protected area
      router.push("/dashboard");
    } catch (err) {
      console.error("Login request error:", err);
      setError("An unexpected error occurred");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      <div
        className="absolute inset-0 z-[-1]"
      >
        <LoginBg
        followCursor={false}
        />
      </div>
      {/* Logo */}
      <div className="w-full max-w-md z-10 dark p-5">
    <div className="flex justify-center items-center mb-8">
        <div className="bg-blue-600 rounded-full p-2 mr-2">
        <svg
            className="w-6 h-6 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
        >
            <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
            />
        </svg>
        </div>
        <span className="text-xl font-bold text-blue-600">A-QUIZ</span>
    </div>
    

      {/* Login Form */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-blue-600 mb-1">
            Login to your Account
          </h1>
          <p className="text-sm text-shadow-white">
            with your registered Email Address
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm text-shadow-white font-medium  mb-1"
            >
              Email address*
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="Enter email address"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-shadow-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-shadow-white mb-1"
            >
              Enter password*
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                placeholder="Password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-shadow-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-blue-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label
              htmlFor="remember-me"
              className="ml-2 block text-sm text-shadow-white"
            >
              Remember my password
            </label>
          </div>

          {/* Login Button */}
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Login
            </button>
          </div>
        </form>

        {error && (
          <p className="mt-4 text-center text-sm text-red-600">{error}</p>
        )}

        {/* Admin Login */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2  text-gray-200">or</span>
            </div>
          </div>
          </div>

        {/* Forgot Password */}
        <div className="text-center mt-6">
          <Link
            href="/forgot-password"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Forgot Password?
          </Link>
        </div>

        <div className="text-center mt-6">
          <Link
            href="/register"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            New, Register Account?
          </Link>
        </div>
      </div>
    </div>
    
  );
}