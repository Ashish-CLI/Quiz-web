import mysql from 'mysql2/promise';
import { env } from './env';

const pool = mysql.createPool({
  host: env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_DATABASE,
});

export async function query<T = any>(sql: string, params?: any[]): Promise<T> {
  const [rows] = await pool.execute(sql, params);
  return rows as T;
}