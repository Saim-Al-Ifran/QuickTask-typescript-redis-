"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTodo = exports.updateTodo = exports.createTodo = exports.getTodoById = exports.getTodos = void 0;
const cache_1 = require("../utils/cache");
const Todo_1 = __importDefault(require("../models/Todo"));
// Get all To-Dos
const getTodos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cacheKey = 'todos';
        const cachedTodos = yield (0, cache_1.getCache)(cacheKey);
        if (cachedTodos) {
            return res.json(JSON.parse(cachedTodos));
        }
        const todos = yield Todo_1.default.find();
        yield (0, cache_1.setCache)(cacheKey, todos, 300); // Cache for 5 minutes
        return res.json(todos);
    }
    catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getTodos = getTodos;
// Get a single To-Do by ID
const getTodoById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const cacheKey = `todo:${id}`;
        const cachedTodo = yield (0, cache_1.getCache)(cacheKey);
        if (cachedTodo) {
            console.log('Cache hit for single To-Do');
            return res.json(JSON.parse(cachedTodo));
        }
        const todo = yield Todo_1.default.findById(id);
        if (!todo) {
            return res.status(404).json({ message: 'To-Do not found' });
        }
        yield (0, cache_1.setCache)(cacheKey, todo, 300); // Cache for 5 minutes
        return res.json(todo);
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
    }
});
exports.getTodoById = getTodoById;
// Create a new To-Do
const createTodo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { task } = req.body;
        const newTodo = new Todo_1.default({
            task,
            completed: false,
        });
        yield newTodo.save();
        yield (0, cache_1.delCache)('todos'); // Invalidate list cache
        res.status(201).json(newTodo);
    }
    catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.createTodo = createTodo;
// Update a To-Do
const updateTodo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { task, completed } = req.body;
        const updatedTodo = yield Todo_1.default.findByIdAndUpdate(id, { task, completed }, { new: true });
        if (!updatedTodo) {
            return res.status(404).json({ message: 'To-Do not found' });
        }
        yield (0, cache_1.delCache)(`todo:${id}`); // Invalidate single cache
        yield (0, cache_1.delCache)('todos'); // Invalidate list cache
        res.json(updatedTodo);
    }
    catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.updateTodo = updateTodo;
// Delete a To-Do
const deleteTodo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const deletedTodo = yield Todo_1.default.findByIdAndDelete(id);
        if (!deletedTodo) {
            return res.status(404).json({ message: 'To-Do not found' });
        }
        yield (0, cache_1.delCache)('todos'); // Invalidate list cache
        yield (0, cache_1.delCache)(`todo:${id}`); // Invalidate single cache
        res.json({ message: 'To-Do deleted successfully' });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
    }
});
exports.deleteTodo = deleteTodo;
