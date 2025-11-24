import assert from 'assert';
import { describe, it } from 'node:test';

// Mock de la fonction de base de données pour les tests unitaires
// En réalité, on utiliserait un outil comme Supertest pour tester les endpoints HTTP
const mockDB = {
    todos: [],
    idCounter: 1,
    query: async (text, params) => {
        // Logique de mock simplifiée
        if (text.includes('INSERT INTO')) {
            const title = params[0];
            const newTodo = { id: mockDB.idCounter++, title: title, completed: false };
            mockDB.todos.push(newTodo);
            return { rows: [newTodo] };
        } else if (text.includes('SELECT * FROM')) {
            return { rows: mockDB.todos };
        } else if (text.includes('DELETE FROM')) {
            const idToDelete = params[0];
            const initialLength = mockDB.todos.length;
            mockDB.todos = mockDB.todos.filter(todo => todo.id !== idToDelete);
            return { rowCount: initialLength - mockDB.todos.length };
        }
        return { rows: [] };
    }
};

describe('Todo CRUD Operations (Mocked DB)', () => {
    // Réinitialiser avant chaque test
    mockDB.todos = [];
    mockDB.idCounter = 1;

    it('should create a new todo', async () => {
        const title = 'Acheter du pain';
        const result = await mockDB.query('INSERT INTO todos (title) VALUES ($1) RETURNING *', [title]);
        
        assert.strictEqual(result.rows.length, 1, 'Should return exactly one row.');
        assert.strictEqual(result.rows[0].title, title, 'Title should match the input.');
        assert.strictEqual(mockDB.todos.length, 1, 'Should have 1 todo in the list.');
    });

    it('should list all todos', async () => {
        await mockDB.query('INSERT INTO todos (title) VALUES ($1) RETURNING *', ['Task 1']);
        await mockDB.query('INSERT INTO todos (title) VALUES ($1) RETURNING *', ['Task 2']);
        
        const result = await mockDB.query('SELECT * FROM todos');
        
        assert.strictEqual(result.rows.length, 2, 'Should return 2 todos.');
        assert.strictEqual(result.rows[0].title, 'Task 1', 'First item title should be correct.');
    });

    it('should delete a todo by id', async () => {
        const createResult = await mockDB.query('INSERT INTO todos (title) VALUES ($1) RETURNING *', ['Task to delete']);
        const id = createResult.rows[0].id;
        
        const deleteResult = await mockDB.query('DELETE FROM todos WHERE id = $1 RETURNING *', [id]);
        
        assert.strictEqual(deleteResult.rowCount, 1, 'Should delete one row.');
        assert.strictEqual(mockDB.todos.length, 0, 'List should be empty after deletion.');
    });
});
