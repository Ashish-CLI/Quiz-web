"use client";

import React from "react";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Quiz from "../components/Quiz";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push("/login");
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-4">Redirecting to Login...</h1>
      <p className="text-lg text-gray-600">
        If you are not redirected, click the link below:
      </p>
      <Link href="/login" className="mt-4 text-blue-500 underline">
        Go to Login
      </Link>
    </div>
    /*<div className="flex flex-col min-h-screen">
      <Quiz/>
    </div>*/
  );
}
