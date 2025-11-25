import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../../lib/db'; // Adjust path as necessary

export async function POST(req: NextRequest) {
  try {
    const { quiz_id, user_id, score, time_taken, attempt_details } = await req.json();

    // Basic validation
    if (!quiz_id || !user_id || score === undefined || time_taken === undefined || !attempt_details) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    // Ensure score is a number and time_taken is an integer
    if (typeof score !== 'number' || typeof time_taken !== 'number' || !Number.isInteger(time_taken)) {
        return NextResponse.json({ success: false, message: 'Invalid data types for score or time_taken' }, { status: 400 });
    }

    const date = new Date().toISOString().slice(0, 19).replace('T', ' '); // YYYY-MM-DD HH:MM:SS format

    const result = await query(
      `INSERT INTO results (quiz_id, user_id, score, date, time_taken) VALUES (?, ?, ?, ?, ?)`,
      [quiz_id, user_id, score, date, time_taken]
    );

    const result_id = (result as any).insertId;

    for (const detail of attempt_details) {
      await query(
        'INSERT INTO attempt_details (attempt_id, question_id, att_answer_id, time_taken) VALUES (?, ?, ?, ?)',
        [result_id, detail.question_id, detail.att_answer_id, detail.time_taken]
      );
    }

    return NextResponse.json({ success: true, message: 'Quiz results submitted successfully', data: { result_id } });
  } catch (error: any) {
    console.error('Error submitting quiz results:', error);
    return NextResponse.json({ success: false, message: 'Internal server error', error: error.message }, { status: 500 });
  }
}
