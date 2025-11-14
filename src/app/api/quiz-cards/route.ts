import { QuizCardData } from '@/types';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { query } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const quizCardsRows = await query<
      (Omit<QuizCardData, 'questions'> & { question_text: string | null })[]
    >(
      `SELECT
         q.quiz_id,
         q.title,
         q.difficulty,
         q.cat_id,
         u.user_name as creatorName,
         GROUP_CONCAT(ques.question_text ORDER BY ques.question_id SEPARATOR '||') AS question_text
       FROM quiz.quizzes q
       JOIN quiz.users u ON q.creator_id = u.user_id
       LEFT JOIN quiz.questions ques ON q.quiz_id = ques.quiz_id
       GROUP BY q.quiz_id, q.title, q.difficulty, q.cat_id, u.user_name`
     );

    const quizCards: QuizCardData[] = quizCardsRows.map((row) => {
      const questions = row.question_text
        ? row.question_text.split('||').map((text) => ({ question_text: text }))
        : [];
      return {
        quiz_id: row.quiz_id,
        title: row.title,
        creatorName: row.creatorName,
        questions: questions,
        difficulty: row.difficulty,
        cat_id: row.cat_id,
      };
    });

    return successResponse('Quiz cards fetched successfully', quizCards);
  } catch (error) {
    console.error('Database error:', error);
    return errorResponse('An unexpected error occurred while fetching quiz cards.', error, 500);
  }
}