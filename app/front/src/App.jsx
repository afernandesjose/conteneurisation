import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// Utilisation de la variable d'environnement définie par le Dockerfile/K8s/Vite
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/todos';

const App = () => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchTodos = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_BASE_URL);
      setTodos(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des tâches:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const handleCreateTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    try {
      await axios.post(API_BASE_URL, { title: newTodo });
      setNewTodo('');
      fetchTodos();
    } catch (error) {
      console.error('Erreur lors de la création:', error);
    }
  };

  const handleDeleteTodo = async (id) => {
    try {
      await axios.delete(`/${id}`);
      fetchTodos();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  return (
    <div>
      <h1>📝 Kubernetes Todo App</h1>

      <form onSubmit={handleCreateTodo} style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Nouvelle tâche..."
          style={{ padding: '10px', width: '70%', marginRight: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <button type="submit" style={{ padding: '10px 15px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Ajouter
        </button>
      </form>

      {loading ? (
        <p>Chargement des tâches...</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {todos.length === 0 ? (
            <p>Aucune tâche pour le moment.</p>
          ) : (
            todos.map((todo) => (
              <li key={todo.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                <span>{todo.title}</span>
                <button 
                  onClick={() => handleDeleteTodo(todo.id)}
                  style={{ backgroundColor: '#f44336', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Supprimer
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};

export default App;
