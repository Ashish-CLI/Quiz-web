"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import EditQuizForm from "@/components/edit-quiz-form";

export default function EditQuizPage() {
  const searchParams = useSearchParams();
  const quiz_id = searchParams.get("quiz_id");

  if (!quiz_id) {
    return <div>Loading...</div>;
  }

  return <EditQuizForm quiz_id={quiz_id} />;
}