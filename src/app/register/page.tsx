"use client";

import { RegisterRequestBody } from '@/types';

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [admin, setAdmin] = useState(false);
  const [adminKey, setAdminKey] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const payload: RegisterRequestBody & { admin?: boolean; adminKey?: string } = {
      username,
      email,
      password,
      admin,
    };
    if (admin) {
      payload.adminKey = adminKey;
    }

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (res.ok) {
      router.push("/dashboard");
    } else {
      setMessage(data.error || "Registration failed");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      <div className="w-full max-w-md z-10 p-5 bg-white rounded shadow">
        <h1 className="text-2xl font-bold text-center mb-4 text-black">
          Register a New Account
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium mb-1 text-black">Username*</label>
            <input
              type="text"
              name="username"
              required
              placeholder="Enter username"
              className="w-full px-3 py-2 border rounded text-black"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1 text-black">Email*</label>
            <input
              type="email"
              name="email"
              required
              placeholder="Enter email address"
              className="w-full px-3 py-2 border rounded text-black"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-1 text-black">Password*</label>
            <input
              type="password"
              name="password"
              required
              placeholder="Enter password"
              className="w-full px-3 py-2 border rounded text-black"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Admin toggle */}
          <div className="flex items-center">
            <input
              id="admin-toggle"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              checked={admin}
              onChange={(e) => setAdmin(e.target.checked)}
            />
            <label htmlFor="admin-toggle" className="ml-2 text-sm text-black">
              Register as admin
            </label>
          </div>

          {/* Admin key – shown only when admin is true */}
          {admin && (
            <div>
              <label className="block text-sm font-medium mb-1 text-black">
                Admin Registration Key*
              </label>
              <input
                type="text"
                name="adminKey"
                required
                placeholder="Enter admin registration key"
                className="w-full px-3 py-2 border rounded text-black"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
              />
            </div>
          )}

          {/* Submit button */}
          <div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Register
            </button>
          </div>
        </form>

        {message && (
          <p className="mt-4 text-center text-sm text-gray-700">{message}</p>
        )}

        <div className="text-center mt-6">
          <Link href="/login" className="font-medium text-blue-600 hover:underline">
            Already have an account? Login
          </Link>
        </div>
      </div>
    </div>
  );
}