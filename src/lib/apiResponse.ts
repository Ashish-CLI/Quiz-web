import { NextResponse } from 'next/server';

interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: any;
}

export const successResponse = (message: string, data?: any, status: number = 200): NextResponse => {
  const response: ApiResponse = { success: true, message, data };
  return NextResponse.json(response, { status });
};

export const errorResponse = (message: string, error?: any, status: number = 500): NextResponse => {
  const response: ApiResponse = { success: false, message, error };
  return NextResponse.json(response, { status });
};