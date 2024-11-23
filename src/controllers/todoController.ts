import { Request, Response } from 'express';
import { getCache, setCache, delCache } from '../utils/cache';
import Todo from '../models/Todo';

// Get all To-Dos
export const getTodos = async (req: Request, res: Response) => {
  try {
    const cacheKey = 'todos';
    const cachedTodos = await getCache(cacheKey);

    if (cachedTodos) {
      return res.json(JSON.parse(cachedTodos));
    }

    const todos = await Todo.find();
    await setCache(cacheKey, todos, 300); // Cache for 5 minutes
    return res.json(todos);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a single To-Do by ID
export const getTodoById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const cacheKey = `todo:${id}`;
    const cachedTodo = await getCache(cacheKey);

    if (cachedTodo) {
      console.log('Cache hit for single To-Do');
      return res.json(JSON.parse(cachedTodo));
    }

    const todo = await Todo.findById(id);

    if (!todo) {
      return res.status(404).json({ message: 'To-Do not found' });
    }

    await setCache(cacheKey, todo, 300); // Cache for 5 minutes
    return res.json(todo);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// Create a new To-Do
export const createTodo = async (req: Request, res: Response) => {
  try {
    const { task } = req.body;
    const newTodo = new Todo({
      task,
      completed: false,
    });
    await newTodo.save();
    await delCache('todos'); // Invalidate list cache
    res.status(201).json(newTodo);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a To-Do
export const updateTodo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { task, completed } = req.body;
    const updatedTodo = await Todo.findByIdAndUpdate(id, { task, completed }, { new: true });

    if (!updatedTodo) {
      return res.status(404).json({ message: 'To-Do not found' });
    }

    await delCache(`todo:${id}`); // Invalidate single cache
    await delCache('todos'); // Invalidate list cache
    res.json(updatedTodo);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a To-Do
export const deleteTodo = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const deletedTodo = await Todo.findByIdAndDelete(id);

    if (!deletedTodo) {
      return res.status(404).json({ message: 'To-Do not found' });
    }

    await delCache('todos'); // Invalidate list cache
    await delCache(`todo:${id}`); // Invalidate single cache
    res.json({ message: 'To-Do deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};
