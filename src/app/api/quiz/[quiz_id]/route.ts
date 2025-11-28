import { QuizData, Question, Option } from '../../../../types';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { query, pool } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { quiz_id: string } }
) {
  const { quiz_id } = await params;

  try {
    const quizRows = await query<QuizData[]>(
      `SELECT quiz_id, title, creation_date, difficulty, creator_id, cat_id, question_no
       FROM quiz.quizzes
       WHERE quiz_id = ?`,
      [quiz_id]
    );

    
    if (quizRows.length === 0) {
      return errorResponse('Quiz not found', null, 404);
    }

    const quiz: QuizData = quizRows[0];


    const questionsRows = await query<Question[]>(
      `SELECT question_id, question_text, quiz_id
       FROM quiz.questions
       WHERE quiz_id = ?
       ORDER BY question_id`,
      [quiz_id]
    );

    const questionIds = questionsRows.map((q: Question) => q.question_id);

    let optionsRows: Option[] = [];
    if (questionIds.length > 0) {
      // Dynamically create placeholders for the IN clause
      const placeholders = questionIds.map(() => '?').join(',');
      optionsRows = await query<Option[]>(
        `SELECT option_id, option_text, is_correct, question_id
         FROM quiz.options
         WHERE question_id IN (${placeholders})
         ORDER BY question_id, option_id`,
        questionIds
      );
    }

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

    return successResponse('Quiz fetched successfully', quizData);
  } catch (error) {
    console.error('Database error:', error);
    return errorResponse('An unexpected error occurred while fetching the quiz.', error, 500);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { quiz_id: string } }
) {
  const { quiz_id } = params;

  try {
    // Delete options associated with the quiz's questions
    await query(
      `DELETE FROM quiz.options
       WHERE question_id IN (SELECT question_id FROM quiz.questions WHERE quiz_id = ?)`,
      [quiz_id]
    );

    // Delete questions associated with the quiz
    await query(
      `DELETE FROM quiz.questions
       WHERE quiz_id = ?`,
      [quiz_id]
    );

    // Delete the quiz itself
    await query(
      `DELETE FROM quiz.quizzes
       WHERE quiz_id = ?`,
      [quiz_id]
    );

    return successResponse('Quiz deleted successfully', null);
  } catch (error) {
    console.error('Database error:', error);
    return errorResponse('An unexpected error occurred while deleting the quiz.', error, 500);
  }
}
export async function PUT(
  req: Request,
  { params }: { params: { quiz_id: string } }
) {
  const { quiz_id } = params;
  const { title, difficulty, cat_id, questions } = await req.json();

  if (!title || !difficulty || !cat_id || !questions) {
    return errorResponse("Missing required fields", null, 400);
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const updateQuizQuery = `
      UPDATE quizzes
      SET title = ?, difficulty = ?, cat_id = ?, question_no = ?
      WHERE quiz_id = ?;
    `;
    await connection.query(updateQuizQuery, [
      title,
      difficulty,
      cat_id,
      questions.length,
      quiz_id,
    ]);

    for (const question of questions) {
      if (question.question_id && typeof question.question_id === 'string' && question.question_id.startsWith("temp-")) {
        const insertQuestionQuery = `
          INSERT INTO questions (quiz_id, question_text)
          VALUES (?, ?);
        `;
        const [newQuestion] = await connection.query(insertQuestionQuery, [quiz_id, question.question_text]);
        const newQuestionId = (newQuestion as any).insertId;

        for (const option of question.options) {
          const insertOptionQuery = `
            INSERT INTO options (question_id, option_text, is_correct)
            VALUES (?, ?, ?);
          `;
          await connection.query(insertOptionQuery, [newQuestionId, option.option_text, option.is_correct]);
        }
      } else {
        const updateQuestionQuery = `
          UPDATE questions
          SET question_text = ?
          WHERE question_id = ?;
        `;
        await connection.query(updateQuestionQuery, [question.question_text, question.question_id]);

        for (const option of question.options) {
          if (option.option_id && typeof option.option_id === 'string' && option.option_id.startsWith("temp-")) {
            const insertOptionQuery = `
              INSERT INTO options (question_id, option_text, is_correct)
              VALUES (?, ?, ?);
            `;
            await connection.query(insertOptionQuery, [question.question_id, option.option_text, option.is_correct]);
          } else {
            const updateOptionQuery = `
              UPDATE options
              SET option_text = ?, is_correct = ?
              WHERE option_id = ?;
            `;
            await connection.query(updateOptionQuery, [option.option_text, option.is_correct, option.option_id]);
          }
        }
      }
    }

    await connection.commit();
    return successResponse("Quiz updated successfully");
  } catch (err) {
    await connection.rollback();
    return errorResponse("Error updating quiz", err, 500);
  } finally {
    connection.release();
  }
}