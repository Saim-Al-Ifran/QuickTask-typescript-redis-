import { Router } from 'express';
import { getTodos, createTodo, updateTodo, deleteTodo, getTodoById } from '../controllers/todoController';

const router = Router();

router.get('/', getTodos);
router.get('/:id', getTodoById);  
router.post('/', createTodo);
router.put('/:id', updateTodo);
router.delete('/:id', deleteTodo);

export default router;
