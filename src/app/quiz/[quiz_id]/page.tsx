"use client";

import React from "react";
import Quiz from "@/components/Quiz";
import { useParams } from "next/navigation";

export default function QuizPage() {
  const params = useParams();
  const quiz_id = params.quiz_id as string;

  if (!quiz_id) {
    return <div>Loading quiz...</div>;
  }

  return <Quiz quiz_id={quiz_id} />;
}