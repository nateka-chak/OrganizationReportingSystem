import express, { Request, Response, Application } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Import the Task model - we'll need to convert this to TypeScript too
import Task from './models/Task';

dotenv.config();

const app: Application = express();
const PORT: number = parseInt(process.env.PORT || '5000', 10);

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
let MONGODB_URI: string = process.env.MONGODB_URI || 'mongodb://localhost:27017/weekly-reports';

// Validate MongoDB URI format
if (MONGODB_URI && !MONGODB_URI.startsWith('mongodb://') && !MONGODB_URI.startsWith('mongodb+srv://')) {
  console.warn('Invalid MONGODB_URI format, using default localhost connection');
  MONGODB_URI = 'mongodb://localhost:27017/weekly-reports';
}

// MongoDB connection with better error handling
const connectToDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error: any) {
    console.error('MongoDB connection error:', error.message);
    
    // Try default connection if the first one fails and it's not already the default
    if (MONGODB_URI !== 'mongodb://localhost:27017/weekly-reports') {
      console.log('Attempting to connect to default localhost MongoDB...');
      try {
        await mongoose.connect('mongodb://localhost:27017/weekly-reports');
        console.log('Connected to default MongoDB');
      } catch (defaultError: any) {
        console.error('Failed to connect to MongoDB:', defaultError.message);
        console.error('Please ensure MongoDB is running or set MONGODB_URI environment variable');
        process.exit(1);
      }
    } else {
      process.exit(1);
    }
  }
};

// Initialize database connection
connectToDatabase();

const db = mongoose.connection;
db.on('error', (error: any) => {
  console.error('MongoDB connection error:', error.message);
});
db.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Routes
app.get('/api/tasks/:week', async (req: Request, res: Response): Promise<void> => {
  try {
    const tasks = await Task.find({ week: req.params.week }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/tasks', async (req: Request, res: Response): Promise<void> => {
  try {
    const task = new Task(req.body);
    await task.save();
    res.status(201).json(task);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/tasks/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }
    
    res.json(task);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/tasks/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    
    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/weeks', async (req: Request, res: Response): Promise<void> => {
  try {
    const weeks = await Task.distinct('week');
    res.json(weeks.sort().reverse());
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req: Request, res: Response): void => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req: Request, res: Response): void => {
  res.json({ 
    message: 'Weekly Reports API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      tasks: '/api/tasks/:week',
      weeks: '/api/weeks'
    }
  });
});

app.listen(PORT, (): void => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;