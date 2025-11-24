import pg from 'pg';
import { setTimeout } from 'timers/promises';

const { Pool } = pg;

const config = {
  user: process.env.POSTGRES_USER || 'todo_user',
  host: process.env.POSTGRES_HOST || 'postgres-service',
  database: process.env.POSTGRES_DB || 'todo_db',
  password: process.env.POSTGRES_PASSWORD || 'todo_password', // Sera surchargé par le Secret K8s
  port: 5432,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

const pool = new Pool(config);

/**
 * Tente de se connecter à la base de données avec des mécanismes de retry.
 * Nécessaire en K8s car le backend démarre souvent avant la DB.
 */
export async function connectWithRetry() {
  const MAX_RETRIES = 15;
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      console.log(`Attempting to connect to PostgreSQL (Attempt ${i + 1}/${MAX_RETRIES})...`);
      const client = await pool.connect();
      // Créer la table si elle n'existe pas
      await client.query(`
        CREATE TABLE IF NOT EXISTS todos (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          completed BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('✅ PostgreSQL connection successful and table ensured.');
      client.release();
      return true;
    } catch (error) {
      console.error('❌ Connection failed:', error.message);
      if (i < MAX_RETRIES - 1) {
        // Attendre 5 secondes avant la prochaine tentative
        await setTimeout(5000);
      }
    }
  }
  console.error('❌ Max retries reached. Could not connect to the database.');
  return false;
}

export const query = (text, params) => pool.query(text, params);
export const getPool = () => pool;
