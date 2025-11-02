import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ITask extends Document {
  title: string;
  description: string;
  status: 'completed' | 'pending' | 'next-week';
  week: string;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema: Schema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'Task title is required'] 
  },
  description: { 
    type: String, 
    default: '' 
  },
  status: { 
    type: String, 
    enum: ['completed', 'pending', 'next-week'], 
    default: 'pending' 
  },
  week: { 
    type: String, 
    required: [true, 'Week identifier is required'] 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Update the updatedAt field before saving
taskSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Update the updatedAt field before updating
taskSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

const Task: Model<ITask> = mongoose.model<ITask>('Task', taskSchema);

export default Task;