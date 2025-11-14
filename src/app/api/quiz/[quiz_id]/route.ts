import { QuizData, Question, Option } from '../../../../types';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { query } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { quiz_id: string } }
) {
  const { quiz_id } = params;
  console.log('API: Fetching quiz for quiz_id:', quiz_id);

  try {
    const quizRows = await query<QuizData[]>(
      `SELECT quiz_id, title, creation_date, difficulty, creator_id, cat_id, question_no
       FROM quiz.quizzes
       WHERE quiz_id = ?`,
      [quiz_id]
    );

    if (quizRows.length === 0) {
      console.log('API: Quiz not found for quiz_id:', quiz_id);
      return errorResponse('Quiz not found', null, 404);
    }
    console.log('API: Fetched quizRows:', quizRows);

    const quiz: QuizData = quizRows; // Corrected: Access the first element of the array

    console.log('API: Extracted quiz object:', quiz);

    const questionsRows = await query<Question[]>(
      `SELECT question_id, question_text, quiz_id
       FROM quiz.questions
       WHERE quiz_id = ?
       ORDER BY question_id`,
      [quiz_id]
    );

    const questionIds = questionsRows.map((q: Question) => q.question_id);
    console.log('API: Fetched questionsRows:', questionsRows);
    console.log('API: Extracted questionIds:', questionIds);

    let optionsRows: Option[] = [];
    if (questionIds.length > 0) {
      // Fetch all options for all questions in a single query
      optionsRows = await query<Option[]>(
        `SELECT option_id, option_text, is_correct, question_id
         FROM quiz.options
         WHERE question_id IN (?)
         ORDER BY question_id, option_id`,
        [questionIds]
      );
    }
    console.log('API: Fetched optionsRows:', optionsRows);

    // Map options to questions
    const questions: Question[] = questionsRows.map((q: Question) => ({
      ...q,
      options: optionsRows.filter((o: Option) => o.question_id === q.question_id),
    }));

    const quizData: QuizData = {
      quiz_id: quiz.quiz_id,
      title: quiz.title,
      creation_date: quiz.creation_date,
      difficulty: quiz.difficulty,
      creator_id: quiz.creator_id,
      cat_id: quiz.cat_id,
      question_no: quiz.question_no,
      questions: questions,
    };
    console.log('API: Final quizData before response:', quizData);

    return successResponse('Quiz fetched successfully', quizData);
  } catch (error) {
    console.error('Database error:', error);
    return errorResponse('An unexpected error occurred while fetching the quiz.', error, 500);
  }
}