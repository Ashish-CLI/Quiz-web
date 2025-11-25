import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import { successResponse, errorResponse } from '@/lib/apiResponse';

export async function GET(
  req: NextRequest,
  { params }: { params: { attempt_id: string } }
) {
  const { attempt_id } = await params;

  if (!attempt_id) {
    return errorResponse('Attempt ID is required', null, 400);
  }

  try {
    const attemptDetails = await query(
      `
      SELECT
        q.question_text,
        o.option_text AS selected_answer,
        (SELECT co.option_text FROM quiz.options co WHERE co.question_id = q.question_id AND co.is_correct = 1) AS correct_answer
      FROM quiz.attempt_details ad
      JOIN quiz.questions q ON ad.question_id = q.question_id
      LEFT JOIN quiz.options o ON ad.att_answer_id = o.option_id
      WHERE ad.attempt_id = ?;
      `,
      [attempt_id]
    );

    if (attemptDetails.length === 0) {
      const [resultExists] = await query(
        'SELECT attempt_id FROM quiz.results WHERE attempt_id = ?',
        [attempt_id]
      );
      
      if (resultExists.length === 0) {
        return errorResponse('Attempt not found', null, 404);
      }
      
      return successResponse('No attempt details found', []);
    }
    
    return successResponse('Attempt details fetched successfully', attemptDetails);
  } catch (error: any) {
    console.error('Error fetching attempt details:', error);
    return errorResponse('Internal server error', error.message, 500);
  }
}