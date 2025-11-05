// project/quiz-web/src/lib/env.ts
interface EnvConfig {
  JWT_SECRET: string;
  DB_HOST: string;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_DATABASE: string;
  ADMIN_REGISTRATION_KEY: string;
}

const validateEnv = (): EnvConfig => {
  const requiredEnvVars = [
    'JWT_SECRET',
    'DB_HOST',
    'DB_USER',
    'DB_PASSWORD',
    'DB_DATABASE',
    'ADMIN_REGISTRATION_KEY',
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }

  return {
    JWT_SECRET: process.env.JWT_SECRET!,
    DB_HOST: process.env.DB_HOST!,
    DB_USER: process.env.DB_USER!,
    DB_PASSWORD: process.env.DB_PASSWORD!,
    DB_DATABASE: process.env.DB_DATABASE!,
    ADMIN_REGISTRATION_KEY: process.env.ADMIN_REGISTRATION_KEY!,
  };
};

export const env = validateEnv();