import { successResponse, errorResponse } from "@/lib/apiResponse";
import { query } from "@/lib/db";

export async function DELETE(
  request: Request,
  { params }: { params: { option_id: string } }
) {
  const { option_id } = params;

  try {
    await query(
      `DELETE FROM quiz.options
       WHERE option_id = ?`,
      [option_id]
    );

    return successResponse("Option deleted successfully", null);
  } catch (error) {
    console.error("Database error:", error);
    return errorResponse(
      "An unexpected error occurred while deleting the option.",
      error,
      500
    );
  }
}