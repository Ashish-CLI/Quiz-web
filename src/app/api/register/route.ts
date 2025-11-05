import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '@/lib/db';
import { env } from '@/lib/env';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { RegisterRequestBody, UserQueryResult } from '@/types';

export async function POST(request: Request) {
 //
  //const ip = request.headers.get('x-forwarded-for') || request.headers.get('remote-addr') || 'unknown';

  try {
    const {
      username,
      email,
      password,
      admin,
      adminKey,
    } = (await request.json()) as RegisterRequestBody;
  
    const user_name = username;

    if (!user_name || !email || !password) {
      return errorResponse('Missing required fields', null, 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return errorResponse('Invalid email format', null, 400);
    }

    const existingUsers = await query('SELECT user_id FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return errorResponse('Email already registered', null, 409);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    let role: 'admin' | 'student' = 'student';
    if (admin) {
      if (!adminKey) {
        return errorResponse('Admin registration key is required', null, 400);
      }
      const providedKey = adminKey.trim();
      if (providedKey !== env.ADMIN_REGISTRATION_KEY) {
        return errorResponse('Invalid admin registration key', null, 403);
      }
      role = 'admin';
    }

    const sql = `
      INSERT INTO users (user_name, email, password, role)
      VALUES (?, ?, ?, ?)
    `;
    await query(sql, [
      user_name,
      email,
      passwordHash,
      role,
    ]);

    const users = await query<UserQueryResult[]>('SELECT user_id FROM users WHERE email = ?', [email]);
    const userId = users[0].user_id;

    const token = jwt.sign(
      {
        userId: userId,
        role: role,
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

    return successResponse('User registered successfully', {
      id: userId,
      userName: user_name,
      email,
      role: role,
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    return errorResponse('error :', err.message, 500);
  }
}