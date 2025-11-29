import { query } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { UserQueryResult } from '@/types';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return errorResponse('Email is required', null, 400);
    }

    const users = await query(
      'SELECT user_id, password, user_name, role FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return successResponse('If an account with that email exists, you will receive a password reset link.');
    }

    const user = users[0];

    const newPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await query('UPDATE users SET password = ? WHERE user_id = ?', [
      hashedPassword,
      user.user_id,
    ]);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER ,
        pass: process.env.EMAIL_PASS,
      },
    });

    console.log("----------------DEBUG----------------");
    console.log("Email User type:", typeof process.env.EMAIL_USER);
    console.log("Email Pass type:", typeof process.env.EMAIL_PASS);
    console.log("Email User value:", process.env.EMAIL_USER); 
    console.log("Email Pass length:", process.env.EMAIL_PASS?.length);
    console.log("-------------------------------------");

    const mailOptions = {
      from: "maggie1234cool.com",
      to: email,
      subject: 'Your New Password',
      text: `Your new password is: ${newPassword}`,
    };

    await transporter.sendMail(mailOptions);

    return successResponse('If an account with that email exists, you will receive a password reset link.');
  } catch (err: any) {
    console.error('Forgot password error:', err);
    return errorResponse('An unexpected error occurred.', err.message, 500);
  }
}