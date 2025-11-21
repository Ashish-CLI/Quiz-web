import { QuizData, Question, Option } from '@/types';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { query } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const newQuizData: QuizData = await request.json();

    // Insert quiz
    const quizResult = await query(
      `INSERT INTO quiz.quizzes (title, difficulty, creator_id, cat_id, question_no)
       VALUES (?, ?, ?, ?, ?)`,
      [
        newQuizData.title,
        newQuizData.difficulty,
        newQuizData.creator_id,
        newQuizData.cat_id,
        newQuizData.questions.length,
      ]
    );

    const quizId = (quizResult as any).insertId;

    // Insert questions and options
    for (const question of newQuizData.questions) {
      const questionResult = await query(
        `INSERT INTO quiz.questions (question_text, quiz_id)
         VALUES (?, ?)`,
        [question.question_text, quizId]
      );
      const questionId = (questionResult as any).insertId;

      for (const option of question.options) {
        await query(
          `INSERT INTO quiz.options (option_text, is_correct, question_id)
           VALUES (?, ?, ?)`,
          [option.option_text, option.is_correct, questionId]
        );
      }
    }

    return successResponse('Quiz added successfully', { quizId });
  } catch (error) {
    console.error('Database error:', error);
    return errorResponse('An unexpected error occurred while adding the quiz.', error, 500);
  }
}