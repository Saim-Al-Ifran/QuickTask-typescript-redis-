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
    redisClient.setEx('todos', 60, JSON.stringify(todos)); // Cache for 1 min
    return res.json(todos);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
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
    redisClient.del('todos'); // Invalidate cache
    res.json(updatedTodo);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a To-Do
export const deleteTodo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await Todo.findByIdAndDelete(id);
    redisClient.del('todos'); // Invalidate cache
    res.json({ message: 'Todo deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
