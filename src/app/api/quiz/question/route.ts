import { successResponse, errorResponse } from '@/lib/apiResponse';
import { pool } from '@/lib/db';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const { quiz_id, question_text, options } = await request.json();
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const questionResult = await connection.query(
      `INSERT INTO quiz.questions (quiz_id, question_text)
       VALUES (?, ?)`,
      [quiz_id, question_text]
    );

    const questionId = (questionResult as any).insertId;

    for (const option of options) {
      await connection.query(
        `INSERT INTO quiz.options (option_text, is_correct, question_id)
         VALUES (?, ?, ?)`,
        [option.option_text, option.is_correct, questionId]
      );
    }

    await connection.commit();
    return successResponse("Question created successfully", { question_id: questionId });
  } catch (error) {
    console.error("Database error:", error);
    await connection.rollback();
    return errorResponse("An unexpected error occurred while creating the question.", error, 500);
  } finally {
    connection.release();
  }
}