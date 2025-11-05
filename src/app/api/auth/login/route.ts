import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '@/lib/db';
import { env } from '@/lib/env';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { LoginRequestBody, UserQueryResult } from '@/types';

export async function POST(request: Request) {
  //const ip = request.headers.get('x-forwarded-for') || request.headers.get('remote-addr') || 'unknown';
 

  try {
    const { email, password } = (await request.json()) as LoginRequestBody;

    if (!email || !password) {
      return errorResponse('Missing required fields', null, 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return errorResponse('Invalid email format', null, 400);
    }

    const users = await query(
      'SELECT user_id, password, user_name, role FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return errorResponse('Invalid email or password', null, 401);
    }

    const user = users[0];

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return errorResponse('Invalid email or password', null, 401);
    }

    const token = jwt.sign(
      {
        userId: user.user_id,
        role: user.role,
      },
      env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const oneHour = 60 * 60 * 1000;
    (await cookies()).set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: Date.now() + oneHour,
      path: '/',
    });

    return successResponse('Login successful', {
      id: user.user_id,
      userName: user.user_name,
      email,
      role: user.role,
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return errorResponse('An unexpected error occurred during login.', err.message, 500);
  }
}