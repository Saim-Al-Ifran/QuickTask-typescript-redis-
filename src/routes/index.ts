import { Router } from 'express';
import todoRoutes from './todoRoutes';
 
const router = Router();

router.use('/api/todos', todoRoutes);
 

export default router;