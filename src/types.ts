export interface Option {
  option_id: string;
  option_text: string;
  is_correct: boolean;
  question_id: string;
}

export interface Question {
  question_id: string;
  question_text: string;
  quiz_id: string;
  options: Option[];
}

export interface QuizData {
  quiz_id: string;
  title: string;
  creation_date: string;
  difficulty: string;
  creator_id: string;
  cat_id: string;
  question_no: number;
  questions: Question[];
}

export interface User {
  user_id: string;
  username: string;
  email: string;
  password_hash: string;
  registration_date: string;
}

export interface LoginRequestBody {
  email: string;
  password: string;
}

export interface RegisterRequestBody {
  username: string;
  email: string;
  password: string;
  admin?: boolean;
  adminKey?: string;
}

export interface UserQueryResult {
  user_id: string;
  user_name: string;
  email: string;
  role: string;
  password_hash: string;
  registration_date: string;
}

export interface QuestionQueryResult {
  question_id: string;
  question_text: string;
  quiz_id: string;
}

export interface OptionQueryResult {
  option_id: string;
  option_text: string;
  is_correct: boolean;
  question_id: string;
}

export interface QuizQueryResult {
  quiz_id: string;
  title: string;
  creation_date: string;
  difficulty: string;
  creator_id: string;
  cat_id: string;
  question_no: number;
}