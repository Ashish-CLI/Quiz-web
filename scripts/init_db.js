import pool from '../src/lib/db.js';

const createUsersTable = async () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS users (
      user_id INT AUTO_INCREMENT PRIMARY KEY,
      user_name VARCHAR(100) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      role ENUM('admin','student') DEFAULT 'student',
      is_admin BOOLEAN DEFAULT FALSE
    );
  `;

  try {
    const [result] = await pool.query(sql);
    console.log('Users table ensured:', result);
  } catch (err) {
    console.error('Error creating users table:', err);
  }
  try {
    const addUserNameSql = `ALTER TABLE users ADD COLUMN IF NOT EXISTS user_name VARCHAR(255) NOT NULL`;
    await pool.query(addUserNameSql);
    console.log('Ensured user_name column exists.');

    const [rows] = await pool.query(`SHOW COLUMNS FROM users LIKE 'username'`);
    if (rows.length > 0) {
      await pool.query(`ALTER TABLE users CHANGE COLUMN username user_name VARCHAR(255) NOT NULL`);
      console.log('Renamed username column to user_name.');
    }
  } catch (err) {
    console.error('Error ensuring user_name column:', err);
  } finally {
    await pool.end();
  }
};

createUsersTable();