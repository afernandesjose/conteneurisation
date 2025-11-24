import express from 'express';
import { connectWithRetry, query, getPool } from './db.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware pour parser le JSON et pour CORS
app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Pour le développement/minikube. À sécuriser en production.
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  next();
});

// État de santé de l'application (liveness probe)
app.get('/health', (req, res) => {
  // Simple check si le serveur est UP
  res.status(200).send({ status: 'UP', service: 'todo-backend' });
});

// État de préparation de l'application (readiness probe)
app.get('/ready', async (req, res) => {
  try {
    const pool = getPool();
    // Tente d'obtenir un client de connexion pour vérifier la DB
    await pool.query('SELECT 1'); 
    res.status(200).send({ status: 'READY', db: 'CONNECTED' });
  } catch (error) {
    console.error('Readiness check failed (DB connection lost):', error.message);
    // Si la DB n'est pas prête, le Pod n'est pas "Ready"
    res.status(503).send({ status: 'NOT READY', db: 'DISCONNECTED' }); 
  }
});


// --- Routes CRUD ---

// Lister toutes les tâches
app.get('/api/todos', async (req, res) => {
  try {
    const result = await query('SELECT * FROM todos ORDER BY id DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).send({ error: 'Failed to fetch todos.' });
  }
});

// Créer une nouvelle tâche
app.post('/api/todos', async (req, res) => {
  const { title } = req.body;
  if (!title) {
    return res.status(400).send({ error: 'Title is required.' });
  }
  try {
    const result = await query('INSERT INTO todos (title) VALUES ($1) RETURNING *', [title]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).send({ error: 'Failed to create todo.' });
  }
});

// Supprimer une tâche
app.delete('/api/todos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await query('DELETE FROM todos WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).send({ error: 'Todo not found.' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).send({ error: 'Failed to delete todo.' });
  }
});

// Initialiser la connexion DB et démarrer le serveur
async function startServer() {
  const isConnected = await connectWithRetry();
  if (isConnected) {
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } else {
    // Si la DB n'est pas disponible après les retries, le Pod devrait idéalement s'arrêter (Kubernetes le redémarrera)
    console.error("Critical: Database connection failed. Shutting down server.");
    // Process exit pour forcer le redémarrage par K8s si la DB est vitale
    // process.exit(1); 
  }
}

startServer();
