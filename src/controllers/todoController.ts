import { Request, Response } from 'express';
import redisClient from '../config/redis';
import Todo from '../models/Todo';

// Get all To-Dos
export const getTodos = async (req: Request, res: Response) => {
  try {
    const cachedTodos = await redisClient.get('todos');
    if (cachedTodos) {
      return res.json(JSON.parse(cachedTodos));
    }

    const todos = await Todo.find();
    redisClient.setEx('todos', 300, JSON.stringify(todos)); // Cache for 1 min
    return res.json(todos);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a single To-Do by ID
export const getTodoById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // Check if the To-Do is cached
    const cachedTodo = await redisClient.get(`todo:${id}`);
    if (cachedTodo) {
      console.log('Cache hit for single To-Do');
      return res.json(JSON.parse(cachedTodo));
    }

    // Fetch from MongoDB if not cached
    const todo = await Todo.findById(id);

    if (!todo) {
      return res.status(404).json({ message: 'To-Do not found' });
    }

    // Cache the result for future requests
    await redisClient.setEx(`todo:${id}`, 300, JSON.stringify(todo));  
    console.log('Cache miss for single To-Do');
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
    redisClient.del('todos'); // Invalidate cache
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
    await redisClient.del(`todo:${id}`); // Invalidate single To-Do cache
    await redisClient.del('todos'); // Invalidate the list cache
    res.json(updatedTodo);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a To-Do
export const deleteTodo = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // Attempt to delete the To-Do from MongoDB
    const deletedTodo = await Todo.findByIdAndDelete(id);

    if (!deletedTodo) {
      return res.status(404).json({ message: 'To-Do not found' });
    }

    // Invalidate related caches
    await redisClient.del('todos'); // Invalidate the list cache
    await redisClient.del(`todo:${id}`); // Invalidate the single To-Do cache

    res.json({ message: 'To-Do deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err });
  }
};

