import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../lib/db';
import { successResponse, errorResponse } from '@/lib/apiResponse';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const user_id = searchParams.get('user_id');

  if (!user_id) {
    return errorResponse('User ID is required', null, 400);
  }

  try {
    const results = await query(
      'SELECT r.attempt_id, r.score, r.date, r.time_taken, q.title FROM quiz.results r JOIN quiz.quizzes q ON r.quiz_id = q.quiz_id WHERE r.user_id = ?',
      [user_id]
    );
    return successResponse('Results fetched successfully', results);
  } catch (error: any) {
    console.error('Error fetching results:', error);
    return errorResponse('Internal server error', error.message, 500);
  }
}