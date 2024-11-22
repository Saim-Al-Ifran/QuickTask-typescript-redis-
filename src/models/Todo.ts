import { Schema, model, Document } from 'mongoose';

interface ITodo extends Document {
  task: string;
  completed: boolean;
}

const TodoSchema = new Schema<ITodo>({
  task: { type: String, required: true },
  completed: { type: Boolean, default: false },
});

const Todo = model<ITodo>('Todo', TodoSchema);

export default Todo;
