import { successResponse, errorResponse } from "@/lib/apiResponse";
import { query } from "@/lib/db";

export async function DELETE(
  request: Request,
  { params }: { params: { question_id: string } }
) {
  const { question_id } = params;

  try {
    await query(
      `DELETE FROM quiz.options
       WHERE question_id = ?`,
      [question_id]
    );

    await query(
      `DELETE FROM quiz.questions
       WHERE question_id = ?`,
      [question_id]
    );

    return successResponse("Question deleted successfully", null);
  } catch (error) {
    console.error("Database error:", error);
    return errorResponse(
      "An unexpected error occurred while deleting the question.",
      error,
      500
    );
  }
}