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
exports.deleteTodo = exports.updateTodo = exports.createTodo = exports.getTodos = void 0;
const redis_1 = __importDefault(require("../config/redis"));
const Todo_1 = __importDefault(require("../models/Todo"));
// Get all To-Dos
const getTodos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cachedTodos = yield redis_1.default.get('todos');
        if (cachedTodos) {
            return res.json(JSON.parse(cachedTodos));
        }
        const todos = yield Todo_1.default.find();
        redis_1.default.setEx('todos', 60, JSON.stringify(todos)); // Cache for 1 min
        return res.json(todos);
    }
    catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getTodos = getTodos;
// Create a new To-Do
const createTodo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { task } = req.body;
        const newTodo = new Todo_1.default({
            task,
            completed: false,
        });
        yield newTodo.save();
        redis_1.default.del('todos'); // Invalidate cache
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
        redis_1.default.del('todos'); // Invalidate cache
        res.json(updatedTodo);
    }
    catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.updateTodo = updateTodo;
// Delete a To-Do
const deleteTodo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield Todo_1.default.findByIdAndDelete(id);
        redis_1.default.del('todos'); // Invalidate cache
        res.json({ message: 'Todo deleted' });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.deleteTodo = deleteTodo;
