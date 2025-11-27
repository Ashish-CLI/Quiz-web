import { successResponse, errorResponse } from '@/lib/apiResponse';
import { pool } from '@/lib/db';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const { title, difficulty, cat_id, creator_id, questions } = await request.json();
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const quizResult = await connection.query(
      `INSERT INTO quiz.quizzes (title, difficulty, cat_id, creator_id, creation_date, question_no)
       VALUES (?, ?, ?, ?, NOW(), ?)`,
      [title, difficulty, cat_id, creator_id, questions.length]
    );

    const quizId = (quizResult as any).insertId;

    for (const question of questions) {
      const questionResult = await connection.query(
        `INSERT INTO quiz.questions (question_text, quiz_id)
         VALUES (?, ?)`,
        [question.question_text, quizId]
      );
      const questionId = (questionResult as any).insertId;
      for (const option of question.options) {
        await connection.query(
          `INSERT INTO quiz.options (option_text, is_correct, question_id)
           VALUES (?, ?, ?)`,
          [option.option_text, option.is_correct, questionId]
        );
      }
    }

    await connection.commit();
    return successResponse("Quiz created successfully", { quiz_id: quizId });
  } catch (error) {
    console.error("Database error:", error);
    await connection.rollback();
    return errorResponse("An unexpected error occurred while creating the quiz.", error, 500);
  } finally {
    connection.release();
  }
}