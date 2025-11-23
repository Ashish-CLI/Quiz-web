"use client";

import React from "react";
import Quiz from "@/components/Quiz";
import { useParams, useSearchParams } from "next/navigation";

export default function QuizPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const quiz_id = params.quiz_id as string;
  const user_id = searchParams.get('user_id') as string;

  if (!quiz_id || !user_id) {
    return <div>Loading quiz...</div>;
  }

  return <Quiz quiz_id={quiz_id} user_id={user_id} />;
}