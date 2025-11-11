import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { query } from '@/lib/db';
import { env } from '@/lib/env';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { UserQueryResult } from '@/types';

export async function GET(request: Request) {
  try {
    const token = (await cookies()).get('token')?.value;

    if (!token) {
      return errorResponse('Unauthorized', null, 401);
    }

    const decodedToken = jwt.verify(token, env.JWT_SECRET) as { userId: number; role: string; iat: number; exp: number; };
    const userId = decodedToken.userId;

    const users = await query(
      'SELECT user_id, user_name, email, role FROM users WHERE user_id = ?',
      [userId]
    ) as UserQueryResult[];

    if (users.length === 0) {
      return errorResponse('User not found', null, 404);
    }

    const user = users[0] as UserQueryResult;

    return successResponse('User data fetched successfully', {
      id: user.user_id,
      userName: user.user_name,
      email: user.email,
      role: user.role,
    });
  } catch (err: any) {
    console.error('Error fetching user data:', err);
    return errorResponse('An unexpected error occurred while fetching user data.', err.message, 500);
  }
}
