import mysql from 'mysql2/promise';
import { env } from './env';

export const pool = mysql.createPool({
  host: env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_DATABASE,
});

export async function query<T = any>(sql: string, params?: any[]): Promise<T> {
  console.log('--- DB QUERY ---');
  console.log('SQL:', sql);
  console.log('PARAMS:', params);
  const [rows] = await pool.execute(sql, params);
  console.log('RESULT:', JSON.stringify(rows, null, 2));
  console.log('--- END DB QUERY ---');
  return rows as T;
}